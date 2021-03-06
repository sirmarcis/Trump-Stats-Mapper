"""
database.py
Written by: Anders Maraviglia

All basic queries for data from the backend should go through here.
Stores all data the backend uses and produces in parsing and analysis.
All calls to read or write data should come through here.
"""

import os
import ast
import data_structures
import json
import time
import states_list
import platform


def get_datestamp():
	"""Gets the datestamp for the current day in TSM format. 
	<week>.<month, in 2 digit format>.<year>
	"""
	return str(int(time.strftime("%d"))/7) + "." + (time.strftime("%m.%Y"))

def datestamp_correct_form_p(datestamp):
	"""Returns True if the datestamp is in TSM format,
	Returns False otherwise.
	"""
	datestamp_list = datestamp.split('.')
	if len(datestamp_list) != 3:
		return False
	else:
		return True

def get_database_filepath():
	"""Gets the filepath to the database, not hardcoded for a single local machine."""
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = ""
	if platform.system() == "Windows":
		database_filepath = filepath.split('apps\\backend')[0] + "data\\"
	else:
		database_filepath = filepath.split('apps/backend')[0] + "data/"
	return database_filepath

def get_website_URLs():
	"""Called by get_all_headline_data, gets the news sourse URL's to parse."""
	filepath = get_database_filepath() + "web_sources"
	f = open(filepath, 'r')
	websites = []
	for line in f:
		if line != "\n":
			endl_index = line.index('\n')
			clean_line = line[:endl_index]
			new_list = clean_line.split(' ', 1)
			websites.append(new_list)
	f.close()
	return websites

def write_current_races_data(state_data_dict):
	"""Writes the race data to a local file for storage in database."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "current_races.dat"
	f = open(current_races_filepath, 'w')
	for state_poll_obj in state_data_dict.values():
		f.write("State; " + state_poll_obj.state_name + "\n")
		f.write("rp; " + str(state_poll_obj.red_poll_dict_list)+"\n")
		f.write("bp; " + str(state_poll_obj.blue_poll_dict_list)+"\n")
		f.write("gp; " + str(state_poll_obj.general_poll_dict_list)+"\n")

def get_current_races_data():
	"""Reads current races from the database back into working memory."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "current_races.dat"
	f = open(current_races_filepath, 'r')
	curr_state_name = ""
	curr_bp_dict = {}
	curr_rp_dict = {}
	curr_gp_dict = {}
	all_race_data_dict = {}
	for line in f:
		if line != "\n" or line != "":
			endl_index = line.index('\n')
			clean_line = line[:endl_index]
			line_split_list = clean_line.split('; ')
			line_dat_name = line_split_list[0]
			if line_dat_name == "State":
				curr_state_name = line_split_list[1]
			elif line_dat_name == "rp":
				curr_rp_dict = ast.literal_eval(line_split_list[1])
			elif line_dat_name == "bp":
				curr_bp_dict = ast.literal_eval(line_split_list[1])
			elif line_dat_name == "gp":
				curr_gp_dict = ast.literal_eval(line_split_list[1])
				new_poll_obj = data_structures.StatePollData(curr_state_name)
				new_poll_obj.red_poll_dict_list = curr_rp_dict
				new_poll_obj.blue_poll_dict_list = curr_bp_dict
				new_poll_obj.general_poll_dict_list = curr_gp_dict
				all_race_data_dict[curr_state_name] = new_poll_obj
	return all_race_data_dict

def write_headlines_data(all_headlines):
	"""Writes headline and keyword data to the database in the file old_headlines."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "old_headlines.dat"
	f = open(current_races_filepath, 'w')
	for curr_headline_arr in all_headlines:
		for curr_headline in curr_headline_arr:
			f.write(curr_headline.headline_str + "\n")
			f.write(curr_headline.link_str + "\n")
			f.write(curr_headline.datestamp + "\n")
			f.write(str(curr_headline.keywords) + "\n\n")

def is_current_article_p(datestamp, today_datestamp):
	"""Called by write_headlines_to_JSON.
	Returns True if the datestamp is within the current week,
	Returns False otherwise.
	"""
	datestamp_list = datestamp.split(' ')
	month_num = states_list.month_hash[datestamp_list[2]]
	custom_art_datestamp = str(int(datestamp_list[1])/7) + "." + month_num + "." + datestamp_list[3]
	if today_datestamp == custom_art_datestamp:
		return True
	else:
		return False

def get_headline_weight(curr_headline, keyword_weight_dict):
	"""Called by write_headlines_to_JSON,
	Adds the weight of each keyword in curr_headline and returns result.
	"""
	keyword_weight = 0
	for keyword in curr_headline.keywords:
		keyword_weight += keyword_weight_dict[keyword]
	return keyword_weight

def write_headlines_to_JSON(all_headlines, keyword_weight_dict):
	"""Write the headline and keyword data in a json readable format."""
	database_filepath = get_database_filepath()
	today_datestamp = get_datestamp()
	current_races_filepath = database_filepath + "headlines_" + today_datestamp + ".json"
	headline_list_dict = {}
	keywords_list_dict = {}
	for curr_headline_arr in all_headlines:
		for curr_headline in curr_headline_arr:
			if is_current_article_p(curr_headline.sub_datestamp, today_datestamp):
				curr_headline.keyword_weight = get_headline_weight(curr_headline, keyword_weight_dict)
				if curr_headline.sub_datestamp in headline_list_dict.keys():
					headline_list_dict[curr_headline.sub_datestamp].append(curr_headline)
					keywords_list_dict[curr_headline.sub_datestamp] = keywords_list_dict[curr_headline.sub_datestamp] + curr_headline.keywords
				else:
					headline_list_dict[curr_headline.sub_datestamp] = [curr_headline]
					keywords_list_dict[curr_headline.sub_datestamp] = curr_headline.keywords
	for date_str in headline_list_dict.keys():
		agg_keyword_list = []
		for keyword in keywords_list_dict[date_str]:
			if keyword not in agg_keyword_list:
				agg_keyword_list.append(keyword)
		curr_headlines = headline_list_dict[date_str]
		headline_list_dict[date_str] = {}
		headline_list_dict[date_str]["headlines"] = list(sorted(curr_headlines, key=lambda x: x.keyword_weight, reverse=True))
		headline_list_dict[date_str]["keywords"] = agg_keyword_list
	with open(current_races_filepath, 'w') as outfile:
		json.dump(headline_list_dict, outfile, cls=data_structures.HeadlineEncoder)

def write_poll_data_to_JSON(state_data_dict):
	"""Writes the poll data to JSON for communication to frontend."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "polldata_" + get_datestamp() + ".json"
	with open(current_races_filepath, 'w') as outfile:
		json.dump(state_data_dict, outfile, cls=data_structures.StatePollDataEncoder)

def write_finished_states_to_JSON(finished_states_dict):
	"""Writes the finished states results data to JSON for communication to frontend."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "finished_states.json"
	with open(current_races_filepath, 'w') as outfile:
		json.dump(finished_states_dict, outfile, cls=data_structures.StatePollDataEncoder)

def write_assc_dict_to_JSON(assc_dict):
	"""Writes the keywords to JSON for communication to frontend."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "keywords.json"
	with open(current_races_filepath, 'w') as outfile:
		json.dump(assc_dict, outfile)

def get_finished_states_JSON_obj():
	"""Gets the delegate counts for all states who have finished their primary."""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "finished_states.json"
	if os.path.isfile(current_races_filepath):
		with open(current_races_filepath, 'r') as infile:
			data = json.load(infile)
			return data
	else:
		return None

def get_poll_JSON_obj(week):
	"""Gets the poll data from the specified weeks JSON file, 
	Week must be of the correct format and data must exist for said week.
	"""
	if datestamp_correct_form_p(week):
		database_filepath = get_database_filepath()
		current_races_filepath = database_filepath + "polldata_" + week + ".json"
		if os.path.isfile(current_races_filepath):
			with open(current_races_filepath, 'r') as infile:
				data = json.load(infile)
				return data
		else:
			return "No data stored for that week."
	else:
		return "Invalid Week Format"

def get_headline_JSON_obj(week):
	"""Gets the headline data from the specified weeks JSON file, 
	Week must be of the correct format and data must exist for said week.
	"""
	if datestamp_correct_form_p(week):
		database_filepath = get_database_filepath()
		current_races_filepath = database_filepath + "headlines_" + week + ".json"
		if os.path.isfile(current_races_filepath):
			with open(current_races_filepath, 'r') as infile:
				data = json.load(infile)
				return data
		else:
			return "No data stored for that week."
	else:
		return "Invalid Week Format"

def get_keywords_JSON_obj():
	"""Gets the keywords stored in the keywords.json file, for the most current week"""
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "keywords.json"
	if os.path.isfile(current_races_filepath):
		with open(current_races_filepath, 'r') as infile:
			data = json.load(infile)
			return data
	else:
		return None

