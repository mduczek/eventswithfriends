

def createStopwordsSet():
	listOfStopwords = [line.strip() for line in open('stopwords.txt')]
	return set(listOfStopwords)


print createStopwordsSet()	