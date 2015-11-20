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
    uid = "1029457540454627"
    r = requests.get(DB_PATH+'/blacklist/'+uid)
    words = json.loads(r.text)['_source']
    savedRejectedWords = words['rejected']
    savedBlaclistedWords = words['blacklist']

    print 'savedRejectedWords'
    print savedRejectedWords

    print 'savedBlaclistedWords'
    print savedBlaclistedWords

    for newWord in setOfRejectedWords:
        if newWord in savedRejectedWords:
            savedRejectedWords[newWord] += 1
        else:
            savedRejectedWords[newWord] = 1

    # Sprawdzanie czy tych rejected jest wiezej niz 5, jesli tak, to wrzucenie ich do blacklist
    for word, number in savedRejectedWords.iteritems():
    	if number >= 5:
    		if word not in savedBlaclistedWords:
    			savedBlaclistedWords.append(word)


    # Saving to database rejected words
    setToDump = {"rejected":savedRejectedWords,"blacklist":savedBlaclistedWords}
    print "setToDump to save"
    print setToDump
    
    data = json.dumps(setToDump)
    print "data to save"
    print data
    r = requests.put(DB_PATH+'/blacklist/'+uid, data)
    print "Soooooo..."
    print r.text	




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
dealWithRejectedEvent("1", e.serializeEvent())
print eventShouldBeBlackListed("1", e.serializeEvent())
