from app import app
from app.xmlToJson import xmlToJson
from flask import make_response, Response
import json
#import ConfigParser

#config = ConfigParser.RawConfigParser()
#config.read('app.conf')

#API_KEY = config.get('EVENTFUL', 'eventful_api_key')
#DOMAIN = config.get('EVENTFUL', 'domain')
API_KEY="FCp5nz27V5HGbWNx"
DOMAIN="http://api.eventful.com/rest"


"""
Filters all events
Supported filters:
    location - name of the place or whatever
    keywords -
    date - 'tomorrow', 'next week' etc. + 'YYYYMMDD00-YYYYMMDD00'
    within - radius (if location is set)
    units - units for within ('km' or 'mi'), default - 'mi'
    category - limits to categories returned by getCategories()
    others: check http://api.eventful.com/docs/events/search
"""
@app.route("/eventful_api/filter_events/<filterDictionary>", methods=["GET"])
def filterEvents(filterDictionary):
    searchString = ""
    print filterDictionary
    dictionary = json.loads(filterDictionary)
    print dictionary
    for (key, value) in dictionary.items():
        searchString += "&" + key + "=" + value
    url = DOMAIN+"/events/search?app_key="+API_KEY+searchString
    print url
    result = xmlToJson(url)
    print result
    resp = Response(result, status=200, mimetype="application/json")
    return resp


""" Returns the list of all categories """
@app.route("/eventful_api/get_categories", methods=["GET"])
def getCategories():
    url = DOMAIN + "/categories/list?app_key=" + API_KEY
    print url
    result = xmlToJson(url)
    print result
    resp = Response(result, status=200, mimetype="application/json")
    return resp


""" Filters all performers, either keywords parameter or category is required """
@app.route("/eventful_api/filter_performers/keywords/<keywords>", methods=["GET"])
@app.route("/eventful_api/filter_performers/category/<category>", methods=["GET"])
@app.route("/eventful_api/filter_performers/<keywords>/<category>", methods=["GET"])
def filterPerformers(keywords=None, category=None):
    searchString = ""
    if (keywords != None):
        searchString += "&keywords="+keywords
    if (category != None):
        searchString += "&category="+category
    url = DOMAIN + "/performers/search?app_key=" + API_KEY + searchString
    print url
    result = xmlToJson(url)
    print result
    resp = Response(result, status=200, mimetype="application/json")
    return resp


"""
Returns the list of events for particular performer
Id might be obtained by calling filterPerformers first
"""
@app.route("/eventful_api/performer_events/<performerId>", methods=["GET"])
def performerEvents(performerId):
    searchString = "&id=" + performerId
    url = DOMAIN + "/performers/events/list?app_key=" + API_KEY + searchString
    print url
    result = xmlToJson(url)
    print result
    resp = Response(result, status=200, mimetype="application/json")
    return resp

