from app import app
from xmlToJson import xmlToJson
import ConfigParser

config = ConfigParser.RawConfigParser()
config.read('app.conf')

API_KEY = config.get('EVENTFUL', 'eventful_api_key')
DOMAIN = config.get('EVENTFUL', 'domain')


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
@app.route("/eventfulApi/filterEvents", methods["GET"])
def filterEvents(filterDictionary):
    searchString = ""
    for (key, value) in filterDictionary.items():
        searchString += "&" + key + "=" + value
    url = DOMAIN+"/events/search?app_key="+API_KEY+searchString
    return xmlToJson(url)


""" Returns the list of all categories """
@app.route("/eventfulApi/getCategories", methods["GET"])
def getCategories():
    url = DOMAIN + "/categories/list?app_key=" + API_KEY
    return xmlToJson(url)


""" Filters all performers, either keywords parameter or category is required """
@app.route("/eventfulApi/filterPerformers/<string:keywords>", methods["GET"])
@app.route("/eventfulApi/filterPerformers/<string:category>", methods["GET"])
@app.route("/eventfulApi/filterPerformers/<string:keywords>/<string:category>", methods["GET"])
def filterPerformers(keywords=None, category=None):
    searchString = ""
    if (keywords != None):
        searchString += "&keywords="+keywords
    if (category != None):
        searchString += "&category="+category
    url = DOMAIN + "/performers/search?app_key=" + API_KEY + searchString
    return xmlToJson(url)


"""
Returns the list of events for particular performer
Id might be obtained by calling filterPerformers first
"""
@app.route("/eventfulApi/performerEvents/<string:performerId>", methods["GET"])
def performerEvents(performerId):
    searchString = "&id=" + performerId
    url = DOMAIN + "/performers/events/list?app_key=" + API_KEY + searchString
    return xmlToJson(url)

