from flask import render_template, request, make_response, jsonify

from app import app


@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

@app.route('/events', methods=['GET', 'POST'])
def events():
    return render_template('events.html')

@app.route('/error', methods=['GET', 'POST'])
def error():
    return render_template('error.html')

#md ========
import requests
import json

DB = "http://paas:bc9998c29d76573ab6b7196952e5490d@dwalin-us-east-1.searchly.com/esdb"

@app.route('/put_events/<user>', methods=['POST'])
def put_events(user):
    events = json.loads(request.data)
    resp = ""
    for event in events['my']:
        event['user'] = user
        event_id = event['id']
        r = requests.put(DB+'/events/'+user+'_'+event_id, data=json.dumps(event))
        resp += r.text
    for event in events['of_friends']:
        event['of_friend'] = user
        event_id = event['id']
        r = requests.put(DB+'/events'+user+'_'+event_id, data=json.dumps(event))
        resp += r.text

    return resp


