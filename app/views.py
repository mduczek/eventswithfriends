from flask import render_template, request, make_response, jsonify, session

from app import app
import string

#md ========
import requests
import json
from rejectedEvents import eventShouldBeBlackListed

DB_PATH = "http://paas:bc9998c29d76573ab6b7196952e5490d@dwalin-us-east-1.searchly.com/esdb"

@app.route('/apiMilosza/<user_id>', methods=['GET'])
def apiMilosza(user_id):
    # calculate the score wrt. user's interests
    preferences = db_get_id("preferences", user_id)
    pref = json.loads(preferences)['_source']
    print pref

    fun_raw_scores_json = db_get_id("best_friends", user_id)
    print ">>2"
    print fun_raw_scores_json
    fun_raw_scores = json.loads(fun_raw_scores_json)
    print fun_raw_scores#['hits']['hits']['_source'] # list of lists
    print ">>3"
    #print fun_raw_scores

    # all events
    # events = db_get_all("events")
    # evs = json.loads(events)

    # user events
    user_events = get_events_for_user(user_id)
    print user_events

    # calculate priorities for all events
    #for res in evs['hits']['hits']:
    for ev in user_events:
        # source = res['_source']
        # print source
        #ev = event.Event(**source)
        ev.evaluate_priority(pref[u'interests'])
        ev.evaluate_funness(fun_raw_scores)
        put_events([ev])

    # calculate funness for friends' events
    # for ev in user_events:
    #     ev.evaluate_funness(fun_raw_scores)
    #     put_events([ev])

    # ranked_events = sorted(user_events, key=lambda x: x.get_sum(), reverse=True)
    #print ranked_events
    # print user_events

    return make_response("")


def get_events_for_user(user_id):
    Q = {
      "query": {
        "term": {
          "user_id": {
            "value": str(user_id)
          }
        }
      },
      "size": 100
    }

    r = requests.get(DB_PATH+'/events/_search', data=json.dumps(Q))
    hits = json.loads(r.text)
    events = []
    for res in hits['hits']['hits']:
        source = res['_source']
        print source.keys()
        events.append(Event(**source))
    return events

def put_events(events):
    resp = ""
    for event in events:
        ident = event.ident
        #event_str = json.dumps(event)
        event_str = event.serializeEvent()
        print event_str
        q1 = filter(lambda x: x in string.printable, event_str)
        r = requests.put(DB_PATH+'/events/'+ident, data=q1)
        print r.text
        resp += r.text
    return resp

def db_get_id(type_name, ident):
    link = DB_PATH+'/'+type_name+'/'+ident
    r = requests.get(link)
    return r.text

def db_get_all(type_name):
    link = DB_PATH+'/'+type_name+'/_search'
    r = requests.get(link)
    return r.text


@app.route('/db', methods=['POST'])
def db():
    data = request.get_data()
    print data
    db_req = json.loads(data)
    print db_req
    link = DB_PATH+'/'+db_req['index']
    print db_req['method'] == 'PUT'
    if db_req['method'] == 'GET':
        r = requests.get(link)
        return r.text
    elif db_req['method'] == 'POST':
        q1 = filter(lambda x: x in string.printable, db_req['query'])
        r = requests.post(link, data=q1)
        print r.text
        return r.text
    elif db_req['method'] == 'PUT':
        print 'in put'
        q1 = filter(lambda x: x in string.printable, db_req['query'])
        r = requests.put(link, data=q1)
        print r.text
        return r.text
    elif db_req['method'] == 'SEARCH':
        q1 = filter(lambda x: x in string.printable, db_req['query'])
        r = requests.get(link, data=q1)
        print r.text
        return r.text

from event import Event

#@app.route('/sorted/<user>', methods=['GET'])
def sorted2(user):
    Q = {
      "query": {
        "filtered": {
          "query": {
            "term": {
              "user_id": user
            }
          },
        }
      },
      "sort": [
        {
          "priority": {
            "order": "desc"
          }
        },
        {
          "funness": {
            "order": "desc"
          }
        }
      ],
      "size": 20
      }
    r = requests.get(DB_PATH+'/events/_search', data=json.dumps(Q))
    hits = json.loads(r.text)
    events = []
    for res in hits['hits']['hits']:
        source = res['_source']
        print source.keys()
        events.append(Event(**source))
    return events


@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/events/<user_id>', methods=['GET', 'POST'])
def events(user_id):
    eventslist = sorted2(user_id)
    print eventslist
    elists = []
    for el in eventslist:
        if not eventShouldBeBlackListed(user_id, el.title, el.description):
            elists.append(el)
    return render_template('events.html', events = elists)

@app.route('/error', methods=['GET', 'POST'])
def error():
    return render_template('error.html')
