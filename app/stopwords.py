def createStopwordsSet():
	listOfStopwords = [line.strip() for line in open('stopwords.txt')]
	return set(listOfStopwords)

GLOBAL_SET_OF_STOPWORDS = createStopwordsSet()

print GLOBAL_SET_OF_STOPWORDS