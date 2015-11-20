# After rejecting event we add words to rejected_words table. It the word was rejected more than 5 times it goes to blacklist table.

from event import *
from stopwords import *
# from views import db
import string

def dealWithRejectedEvent(uid, json_event):
	event = deserializeEvent(json_event)
	# eventKeywords = set()
	title = [word.strip(string.punctuation).lower() for word in event.description.split()]
	descr = [word.strip(string.punctuation).lower() for word in event.title.split()]
	setOfRejectedWords = set(title) | (set(descr))
	setOfRejectedWords = setOfRejectedWords - GLOBAL_SET_OF_STOPWORDS

	# Saving to database rejected words
	# TODO

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
	return ['dupa', 'doda']


e = Event(1, "title", "url", "to nie jest spam lalala niedupa niedupa niedupa a a tatat gaf description dupa doda", "123", 0, "address", "datatime", "priority", "")

# test
dealWithRejectedEvent(1, e.serializeEvent())
print eventShouldBeBlackListed(1, e.serializeEvent())
