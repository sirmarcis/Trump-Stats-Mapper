"""
web_scraper.py 
Written by: Anders Maraviglia
"""

import data_structures
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

def get_rcp_primary_result_data(website_url):
	page = requests.get(website_url)
	page.raise_for_status()
	bs_obj = bs4.BeautifulSoup(page.text, 'html.parser')
	results_bs_table = bs_obj.find('div', attrs={'class':'delegate_wrapper'})
	#table_body = results_bs_table.find('tbody')
	print results_bs_table.prettify()

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

def main():
	get_rcp_primary_result_data("http://www.realclearpolitics.com/epolls/2016/president/republican_delegate_count.html")

if __name__ == "__main__":
	main()

