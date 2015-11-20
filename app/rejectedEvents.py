# After rejecting event we add words to rejected_words table. It the word was rejected more than 5 times it goes to blacklist table.

from event import *
from stopwords import *		
import string

import requests
import json

DB_PATH = "http://paas:bc9998c29d76573ab6b7196952e5490d@dwalin-us-east-1.searchly.com/esdb"



def dealWithRejectedEvent(uid, json_event):
    event = deserializeEvent(json_event)
    # eventKeywords = set()
    title = [word.strip(string.punctuation).lower() for word in event.description.split()]
    descr = [word.strip(string.punctuation).lower() for word in event.title.split()]
    setOfRejectedWords = set(title) | (set(descr))
    setOfRejectedWords = setOfRejectedWords - GLOBAL_SET_OF_STOPWORDS

	r = requests.get(DB_PATH+'/blacklist/'+uid)
    words = json.loads(r.text)['_source']
    savedRejectedWords = words['rejected']

    for newWord in setOfRejectedWords:
    	if newWord in savedRejectedWords:
    		savedRejectedWords[newWord] += 1
		else:
    		savedRejectedWords[newWord] = 1
    
    # Saving to database rejected words
    data = json.dumps(setOfRejectedWords)
	r = requests.put(DB_PATH+'/blacklist/'+uid, savedRejectedWords)
    print r.text

    # Sprawdzanie czy tych rejected jest wiezej niz 5, jesli tak, to wrzucenie ich do blacklist
    for rejectedWord in setOfRejectedWords:
        n = 0
        # wyciagnac liczbe wystapien dla tego usera
        # jak 5 to dodanie do blacklist





# Checking if event has more then 20% of blacklisted words, in this case it won't be suggested
def eventShouldBeBlackListed(uid, json_event):
    event = deserializeEvent(json_event)
    # eventKeywords = set()
    title = [word.strip(string.punctuation).lower() for word in event.description.split()]
    descr = [word.strip(string.punctuation).lower() for word in event.title.split()]
    eventKeywords = set(title) | (set(descr))

    blacklistedWords = getBlacklistedWords(uid)


    commonBlacklistedWords = eventKeywords & set(blacklistedWords)

    print 'len(commonBlacklistedWords)'    
    print len(commonBlacklistedWords)
    print 'len(eventKeywords)'
    print len(eventKeywords)


    if len(commonBlacklistedWords) * 5 >= len(eventKeywords):
        return True
    return False


# Getting list of blacklisted words for given user
def getBlacklistedWords(uid):
	# TODO remove this id
    uid = "1029457540454627"
    r = requests.get(DB_PATH+'/blacklist/'+uid)
    words = json.loads(r.text)['_source']
    return words['blacklist'];




e = Event(1, "title", "url", "to nie jest spam lalala niedupa niedupa niedupa a a tatat gaf description dupa doda", "123", 0, "address", "datatime", "priority", "")

# test
dealWithRejectedEvent(1, e.serializeEvent())
print eventShouldBeBlackListed(1, e.serializeEvent())
