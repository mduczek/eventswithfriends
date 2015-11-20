from app import app
from app.xmlToJson import xmlToJson
from flask import make_response, Response
import json
import requests
from xml.dom import minidom
import string
from app.event import Event


API_KEY="FCp5nz27V5HGbWNx"
DOMAIN="http://api.eventful.com/rest"

def getTagValue(dom, tagValue):
    tag = dom.getElementsByTagName(tagValue)
    if (tag and tag[0] and tag[0].firstChild):
        return tag[0].firstChild.nodeValue
    return ""

def getEventsFromUrl(url):
    eventslist = []
    result = requests.get(url)
    result = filter(lambda x: x in string.printable, result.text)
    dom = minidom.parseString(result)
    events = dom.getElementsByTagName('event')
    for event in events:
        title = getTagValue(event, "title")
        url = getTagValue(event, "url")
        description = getTagValue(event, "description")
        image = getTagValue(event, "image")
        venue_address = getTagValue(event, "venue_address")
        start_time = getTagValue(event, "start_time")
        ident = event.attributes['id'].value

        eventslist.append(Event(ident, title, url, description, user_id, False, venue_address, start_time, 10, image))
    return eventslist


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
@app.route("/eventful_api/filter_events/<user_id>/<filterDictionary>", methods=["GET"])
def filterEvents(user_id, filterDictionary):
    searchString = ""
    dictionary = json.loads(filterDictionary)
    print dictionary
    for (key, value) in dictionary.items():
        searchString += "&" + key + "=" + value
    searchString += "&page_size=100"
    url = DOMAIN+"/events/search?app_key="+API_KEY+searchString
    eventslist = getEventsFromUrl(url)
    # todo call do bazy

    resp = Response("", status=200, mimetype="application/xml")
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
    result = requests.get(url)
    result = filter(lambda x: x in string.printable, result.text)
    return result

"""
Returns the list of events for particular performer
Id might be obtained by calling filterPerformers first
"""
@app.route("/eventful_api/performer_events/<user_id>/<performerId>", methods=["GET"])
def performerEvents(user_id, performerId):
    searchString = "&id=" + performerId
    url = DOMAIN + "/performers/events/list?app_key=" + API_KEY + searchString
    print url
    eventslist = getEventsFromUrl(url)
    # todo call do bazy
    resp = Response("", status=200, mimetype="application/json")
    return resp

