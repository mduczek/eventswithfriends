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


@app.route('/es_put', methods=['POST'])
def put_events():
    print 'put', request.data
    #r = requests.put(DB+'/'+data['table']+'/'+data['id'], data=json.dumps(data['doc']))
    return request
# ========

from app.xmlToJson import xmlToJson
from flask import Response
API_KEY="FCp5nz27V5HGbWNx"
DOMAIN="http://api.eventful.com/rest"

@app.route('/eventful_api/get_categories', methods=["GET", "POST"])
def getCategories():
    url = DOMAIN + "/categories/list?app_key=" + API_KEY
    print url
    result = xmlToJson(url)
    print result
    resp = Response(result, status=200, mimetype="application/json")
    return resp



