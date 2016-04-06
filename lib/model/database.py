"""
database.py
Written by: Anders Maraviglia
"""

import os
import ast
import data_structures
import json

def get_database_filepath():
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = filepath.split('lib/model')[0] + "data/"
	return database_filepath

def write_current_races_data(state_data_dict):
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "current_races.dat"
	f = open(current_races_filepath, 'w')
	for state_poll_obj in state_data_dict.values():
		f.write("State; " + state_poll_obj.state_name + "\n")
		f.write("rp; " + str(state_poll_obj.red_poll_dict_list)+"\n")
		f.write("bp; " + str(state_poll_obj.blue_poll_dict_list)+"\n")
		f.write("gp; " + str(state_poll_obj.general_poll_dict_list)+"\n")

def get_current_races_data():
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
				new_poll_obj = data_structures.State_Poll_Data(curr_state_name)
				new_poll_obj.red_poll_dict_list = curr_rp_dict
				new_poll_obj.blue_poll_dict_list = curr_bp_dict
				new_poll_obj.general_poll_dict_list = curr_gp_dict
				all_race_data_dict[curr_state_name] = new_poll_obj
	return all_race_data_dict

def write_headlines_data(all_headlines):
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "old_headlines.dat"
	f = open(current_races_filepath, 'w')
	for curr_headline_arr in all_headlines:
		for curr_headline in curr_headline_arr:
			f.write(curr_headline.headline_str + "\n")
			f.write(curr_headline.link_str + "\n")
			f.write(curr_headline.datestamp + "\n")
			f.write(str(curr_headline.keywords) + "\n\n")

def write_headlines_to_JSON(all_headlines):
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "headlines.json"
	headline_1d_list = []
	for curr_headline_arr in all_headlines:
		for curr_headline in curr_headline_arr:
			headline_1d_list.append(curr_headline)
	with open(current_races_filepath, 'w') as outfile:
		json.dump(headline_1d_list, outfile, cls=data_structures.HeadlineEncoder)

def get_old_headlines_data():
	database_filepath = get_database_filepath()
	current_races_filepath = database_filepath + "old_headlines.dat"
	f = open(current_races_filepath, 'r')
	#for line in f:

