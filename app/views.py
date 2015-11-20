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

DB_PATH = "http://paas:bc9998c29d76573ab6b7196952e5490d@dwalin-us-east-1.searchly.com/esdb"

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
        r = requests.post(link, data=db_req['query'])
        print r.text
        return r.text
    elif db_req['method'] == 'PUT':
        print 'in put'
        r = requests.put(link, data=db_req['query'])
        print r.text
        return r.text
    else:
        print 'unmatched'