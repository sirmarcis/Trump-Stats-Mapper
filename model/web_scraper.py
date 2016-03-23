from lxml import html
import requests
import bs4
import nltk

class Race_Data:
	"""Each race should be a unique instance of this object,
	but one race should have no more than one instance of this object.
	Each instance has the following properties:
	race_name: the name of the race whose data this instance contains
	race_poll_str_data: the results of all polls, stored in an array of strings
	race_spread_str_data: the summary result of the poll, stored in an array of strings (i.e Trump +12)
	race_result_data: where the parsed data for each poll is stored, an array
	poll_source_str: the source for each poll, stored in an array of strings
	prez_race_p: whether this instance is a poll relating to the presedential election, either True or False
	"""

	def in_prez_race_p(self, race_name):
		race_name_tokens = race_name.split( )
		return 'Presidential' in race_name_tokens

	def __init__(self, race_name):
		self.race_name = race_name
		self.race_poll_str_data = []
		self.race_spread_str_data = []
		self.race_result_data = []
		self.poll_source_str = []
		self.prez_race_p = self.in_prez_race_p(race_name)

class Headline:
	"""Stores the name and link for a RCP headline"""
	def __init__(self, headline_str, link_str):
		self.headline_str = headline_str
		self.link_str = link_str
		
	def __str__(self):
		string = self.headline_str + "\n" + self.link_str + "\n"
		return string


def get_website_URLs():
	"""Called by main"""
	f = open('web_sources', 'r')
	websites = []
	for line in f:
		if line != "\n":
			endl_index = line.index('\n')
			clean_line = line[:endl_index]
			websites.append(clean_line)
	f.close()
	return websites

def get_rcp_poll_data(website_url):
	"""Called by main"""
	all_races = dict()
	page = requests.get(website_url)
	page.raise_for_status()
	bs_obj = bs4.BeautifulSoup(page.text, 'html.parser')
	div_list = bs_obj.find_all("div", "table-races")
	table_list = bs_obj.find_all("table")
	td_race = bs_obj.find_all("td", "lp-race")
	td_poll = bs_obj.find_all("td", "lp-poll")
	td_results = bs_obj.find_all("td", "lp-results")
	td_spread = bs_obj.find_all("td", "lp-spread")
	#print "td_race [", len(td_race), "] td_poll [", len(td_poll), "] td_results[", len(td_results), "] td_spread [", len(td_spread), "]"
	td_index = 0
	for race_val in td_race:
		#print "race[", race_val.string, "] poll[", td_poll[td_index].string, "] results[", td_results[td_index].string, "] spread[", td_spread[td_index].string, "]"
		if race_val.string not in all_races:
			new_race = Race_Data(race_val.string)
			#print "making new race: ", new_race.race_name
			new_race.race_poll_str_data.append(td_results[td_index].string)
			new_race.race_spread_str_data.append(td_spread[td_index].string)
			new_race.poll_source_str.append(td_poll[td_index].string)
			all_races[race_val.string] = new_race
		else:
			#print "adding to race: ", race_val.string, " data: ", td_poll[td_index].string
			old_race = all_races[race_val.string]
			old_race.race_poll_str_data.append(td_results[td_index].string)
			old_race.race_spread_str_data.append(td_spread[td_index].string)
			old_race.poll_source_str.append(td_poll[td_index].string)
		td_index+=1
	return all_races

def get_headline_data(website_url):
	"""Called by main"""
	page = requests.get(website_url)
	page.raise_for_status()
	all_headlines = []
	bs_obj = bs4.BeautifulSoup(page.text, 'html.parser') ## bs_obj.select('div')
	item_list = bs_obj.select('item')
	for curr_item in item_list:
		item_title = curr_item.title.string
		followup_link = curr_item.select('link')[0].string
		item_title = item_title.replace(u"\u2018", "'").replace(u"\u2019", "'")
		followup_link = followup_link.replace(u"\u2018", "'").replace(u"\u2019", "'")
		new_headline = Headline(item_title, followup_link)
		all_headlines.append(new_headline)
		# print "curr item [", item_title, "]"
	return all_headlines

def main():
	"""The main function for testing HTML parsing"""
	websites = get_website_URLs()
	# rcp_poll_race_dict = get_rcp_poll_data('http://www.realclearpolitics.com/epolls/latest_polls/') # realclearpolotics poll data
	all_headlines_arr = []
	for curr_website in websites:
		curr_headline_arr = get_headline_data(curr_website)
		all_headlines_arr.append(curr_headline_arr)
			
	

if __name__ == "__main__":
	main()


