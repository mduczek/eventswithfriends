import os
from settings import APP_STATIC


def createStopwordsSet():
	listOfStopwords = [line.strip() for line in open(os.path.join(APP_STATIC, 'stopwords.txt'))]
	return set(listOfStopwords)

GLOBAL_SET_OF_STOPWORDS = createStopwordsSet()
