"""
data_analysis.py
Written by: Anders Maraviglia
"""

import web_scraper
import states_list
import operator
import nltk

keyword_dict = {}
assc_dict = {}
state_data_dict = {}

class State_Poll_Data:
	def __init__(self, state_name):
		self.state_name = state_name
		self.red_poll_dict_list = []
		self.blue_poll_dict_list = []
		self.general_poll_dict_list = []

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

def get_state_name_token(poll_name_tokens):
	"""called by parse_poll_data"""
	first_token_p = False
	first_token = ""
	for curr_token in poll_name_tokens:
		if first_token_p:
			if curr_token in states_list.second_token_dt_list:
				return first_token + " " + curr_token
		if curr_token in states_list.single_token_states_list:
			return curr_token
		elif curr_token in states_list.first_token_dt_list:
			first_token_p = True
			first_token = curr_token

def parse_poll_str_list(poll_str_list):
	"""called by parse_poll_data"""
	poll_list = poll_str_list[0].split(', ')
	poll_dict = {}
	for curr_poll_str in poll_list:
		curr_poll_list = curr_poll_str.split()
		if len(curr_poll_list) == 2:
			can_name = curr_poll_list[0]
			poll_num = int(curr_poll_list[1])
			poll_dict[can_name] = poll_num
	return poll_dict

def parse_poll_data(all_poll_data):
	"""called by get_data_analysis"""
	for curr_race in all_poll_data.values():
		poll_name_tokens = nltk.word_tokenize(curr_race.race_name)
		state_token = get_state_name_token(poll_name_tokens)
		if state_token != None:
			poll_data_dict = parse_poll_str_list(curr_race.race_poll_str_data)
			if state_token in state_data_dict.keys():
				curr_state_data_obj = state_data_dict[state_token]	
			else:
				curr_state_data_obj = State_Poll_Data(state_token)
			if "Republican" in poll_name_tokens:
				#print "red race in: ", state_token, "data: ", poll_data_dict
				curr_state_data_obj.red_poll_dict_list.append(poll_data_dict)
			elif "Democratic" in poll_name_tokens:
				#print "blue race: ", state_token, "data: ", poll_data_dict
				curr_state_data_obj.blue_poll_dict_list.append(poll_data_dict)
			else:
				#print "general race in: ", state_token, "data: ", poll_data_dict
				curr_state_data_obj.general_poll_dict_list.append(poll_data_dict)
			if not state_token in state_data_dict.keys():
				state_data_dict[state_token] = curr_state_data_obj

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
			#print sorted_keyword[0], ", associated tokens: ", assc_dict[sorted_keyword[0]]
			final_keywords.append(sorted_keyword[0])
	parse_poll_data(all_poll_data)

def main():
	get_data_analysis()

if __name__ == "__main__":
	main()