from flask import render_template, request, make_response, jsonify, session

from app import app
import string

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/events/<user_id>', methods=['GET', 'POST'])
def events(user_id):
    #eventslist = getSortedEvents(user_id)
    return render_template('events.html')


@app.route('/error', methods=['GET', 'POST'])
def error():
    return render_template('error.html')

#md ========
import requests
import json

DB_PATH = "http://paas:bc9998c29d76573ab6b7196952e5490d@dwalin-us-east-1.searchly.com/esdb"

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
