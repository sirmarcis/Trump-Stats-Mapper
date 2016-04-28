"""
web_scraper.py 
Written by: Anders Maraviglia
"""

import data_structures
import database
from lxml import html
import requests
import bs4
import string
import os
		
def get_website_URLs():
	"""
	Called by get_all_headline_data"""
	filepath = os.path.dirname(os.path.realpath(__file__)) +"/web_sources"
	#print filepath
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

def get_red_rcp_primary_result_data(finished_states_dict):
	data_filepath = database.get_database_filepath() + "rep_primary_results_table.html"
	html_str = open(data_filepath, 'r').read()
	bs_obj = bs4.BeautifulSoup(html_str, 'html.parser')
	table = bs_obj.find('table')
	for row in table.find_all("tr"):
		state_name = ""
		span_list = row.find_all('span')
		if len(span_list) > 1:
			state_name = span_list[1].string
		elt_list = row.find_all("td")
		if len(elt_list) > 0:
			if elt_list[1].span != None:
				date_str = elt_list[1].span.string
				if elt_list[3].string != None:
					trump_votes = int(elt_list[3].string) # trump
					cruz_votes = int(elt_list[4].string) # cruz
					if elt_list[5].string != None:
						rubio_votes = int(elt_list[5].string) # rubio
					else:
						rubio_votes = 0
					kasich_votes = int(elt_list[6].string) # kasich
					state_obj = None
					if state_name not in finished_states_dict.keys():
						state_obj = data_structures.State_Poll_Data(state_name)
					else:
						state_obj = finished_states_dict[state_name]
					red_dict = {}
					can_dict = {}
					can_dict["Trump"] = trump_votes
					can_dict["Cruz"] = cruz_votes
					can_dict["Rubio"] = rubio_votes
					can_dict["Kasich"] = kasich_votes
					red_dict[date_str] = can_dict
					state_obj.red_poll_dict_list.append(red_dict)
					finished_states_dict[state_name] = state_obj

def get_blue_rcp_primary_result_data(finished_states_dict):
	data_filepath = database.get_database_filepath() + "dem_primary_results_table.html"
	html_str = open(data_filepath, 'r').read()
	bs_obj = bs4.BeautifulSoup(html_str, 'html.parser')
	table = bs_obj.find('table')
	for row in table.find_all("tr"):
		state_name = ""
		span_list = row.find_all('span')
		if len(span_list) > 1:
			state_name = span_list[1].string
		elt_list = row.find_all("td")
		if len(elt_list) > 0:
			if elt_list[1].string != "-":
				date_str = elt_list[1].string
				if elt_list[3].string != None:
					clinton_votes = int(elt_list[3].string) # clinton
					sanders_votes = int(elt_list[4].string) # sanders
					state_obj = None
					if state_name not in finished_states_dict.keys():
						state_obj = data_structures.State_Poll_Data(state_name)
					else:
						state_obj = finished_states_dict[state_name]
					red_dict = {}
					can_dict = {}
					can_dict["Clinton"] = clinton_votes
					can_dict["Sanders"] = sanders_votes
					red_dict[date_str] = can_dict
					state_obj.blue_poll_dict_list.append(red_dict)
					finished_states_dict[state_name] = state_obj

def get_rcp_poll_data(website_url):
	"""
	Called by get_all_poll_data, gets poll data from rcp site"""
	all_races = dict()
	page = requests.get(website_url)
	page.raise_for_status()
	bs_obj = bs4.BeautifulSoup(page.text, 'html.parser')
	td_race = bs_obj.find_all("td", "lp-race")
	td_poll = bs_obj.find_all("td", "lp-poll")
	td_results = bs_obj.find_all("td", "lp-results")
	td_spread = bs_obj.find_all("td", "lp-spread")
	td_index = 0
	for race_val in td_race:
		if race_val.string not in all_races:
			new_race = data_structures.Race_Data(race_val.string)
			new_race.race_poll_str_data.append(td_results[td_index].string)
			new_race.race_spread_str_data.append(td_spread[td_index].string)
			new_race.poll_source_str.append(td_poll[td_index].string)
			all_races[race_val.string] = new_race
		else:
			old_race = all_races[race_val.string]
			old_race.race_poll_str_data.append(td_results[td_index].string)
			old_race.race_spread_str_data.append(td_spread[td_index].string)
			old_race.poll_source_str.append(td_poll[td_index].string)
		td_index+=1
	return all_races

def get_headline_data(website_url, source):
	"""
	Called by get_all_headline_data"""
	page = requests.get(website_url)
	page.raise_for_status()
	all_headlines = []
	bs_obj = bs4.BeautifulSoup(page.text, 'html.parser') ## bs_obj.select('div')
	item_list = bs_obj.select('item')
	printable = set(string.printable)
	for curr_item in item_list:
		item_title = curr_item.title.string
		followup_link = curr_item.select('link')[0].string
		datestamp = curr_item.select('pubdate')[0].string
		item_title = item_title.replace(u"\u2018", "'").replace(u"\u2019", "'")
		followup_link = followup_link.replace(u"\u2018", "'").replace(u"\u2019", "'")
		item_title = item_title.encode('ascii', errors='ignore')
		new_headline = data_structures.Headline(item_title, followup_link, source, datestamp)
		all_headlines.append(new_headline)
	return all_headlines

def get_all_headline_data():
	"""
	Gets all headlines in a 2d array of headline objects"""
	websites = get_website_URLs()
	all_headlines_arr = []
	for curr_elt in websites:
		curr_website = curr_elt[0]
		source = curr_elt[1]
		curr_headline_arr = get_headline_data(curr_website, source)
		all_headlines_arr.append(curr_headline_arr)
	return all_headlines_arr

def get_all_poll_data():
	"""
	Gets all poll data from websites, just rcp right now"""
	rcp_poll_race_dict = get_rcp_poll_data('http://www.realclearpolitics.com/epolls/latest_polls/') # realclearpolotics poll data
	return rcp_poll_race_dict

def get_finished_states_dict():
	finished_states_dict = {}
	get_red_rcp_primary_result_data(finished_states_dict)
	get_blue_rcp_primary_result_data(finished_states_dict)
	return finished_states_dict

