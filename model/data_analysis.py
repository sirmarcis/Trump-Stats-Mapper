"""
data_analysis.py
Written by: Anders Maraviglia
"""

import web_scraper
import operator
import nltk

keyword_dict = {}
assc_dict = {}

def load_keyword_dict():
	"""called by get_data_analysis, load keywords from file keywords.txt into keyword_dict"""
	f = open('keywords.txt', 'r')
	for line in f:
		if line != "\n":
			endl_index = line.index('\n')
			clean_line = line[:endl_index]
			keyword_dict[clean_line] = []

def parse_headline_arr(curr_headline_arr, top_keyword_dict):
	"""
	called by get_data_analysis parses all headlines from one news source, in curr_headline_arr. 
	modifies/returns top_keyword_dict: puts in new keywords or adds to the count for existing keywords,
	modifies assc_dict: adds association keywords for every keyword in a headline."""
	sig_tokens = ['NN', 'NNP']
	ignore_tokens = ['Is', 'VIDEO', 'Introduction', '"', 'Has']
	for curr_headline in curr_headline_arr:
		discovered_tokens = []
		headline_tokens = nltk.word_tokenize(curr_headline.headline_str)
		tagged_tokens = nltk.pos_tag(headline_tokens)
		for curr_token in tagged_tokens:
			word_token = curr_token[0]
			if curr_token[1] in sig_tokens and word_token not in ignore_tokens:
				if word_token in keyword_dict.keys() and not word_token in curr_headline.keywords:
					curr_headline.keywords.append(word_token)
					keyword_dict[word_token].append(curr_headline)
				if not word_token in top_keyword_dict.keys():
					top_keyword_dict[word_token] = 0
				else:
					top_keyword_dict[word_token]+=1
				discovered_tokens.append(word_token)
		if len(discovered_tokens) > 0:
			for curr_assc_token in discovered_tokens:
				other_assc_tokens = []
				for other_assc_token in discovered_tokens:
					if other_assc_token != curr_assc_token:
						other_assc_tokens.append(other_assc_token)
				if curr_assc_token in assc_dict.keys():
					assc_dict[curr_assc_token]+=other_assc_tokens
				else:
					assc_dict[curr_assc_token] = other_assc_tokens
	return top_keyword_dict

def clean_assc_dict(top_keyword_dict):
	"""called by get_data_analysis, gets rid of repeat and irrelevent keywords in assc_dict"""
	for assc_token in assc_dict.keys():
		if top_keyword_dict[assc_token] > 1:
			assc_list = assc_dict[assc_token]
			unique_tokens = []
			for assc_list_token in assc_list:
				if assc_list_token not in unique_tokens and top_keyword_dict[assc_list_token] > 1:
					unique_tokens.append(assc_list_token)
			assc_dict[assc_token] = unique_tokens

def get_data_analysis():
	"""called by main"""
	load_keyword_dict()
	all_headlines = web_scraper.get_all_headline_data()
	all_poll_data = web_scraper.get_all_poll_data()
	print "number of news sites parsed: ", len(all_headlines)
	top_keyword_dict = dict()
	for curr_headline_arr in all_headlines:
		top_keyword_dict = parse_headline_arr(curr_headline_arr, top_keyword_dict)
	clean_assc_dict(top_keyword_dict)
	sorted_keyword_list = list(reversed(sorted(top_keyword_dict.items(), key=operator.itemgetter(1))))
	final_keywords = []
	for sorted_keyword in sorted_keyword_list:
		if sorted_keyword[1] > 1:
			print sorted_keyword[0], ", associated tokens: ", assc_dict[sorted_keyword[0]]
			final_keywords.append(sorted_keyword[0])
	#for curr_race in all_poll_data.values():
	#	print curr_race.race_name

def main():
	get_data_analysis()

if __name__ == "__main__":
	main()