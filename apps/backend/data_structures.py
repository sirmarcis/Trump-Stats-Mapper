"""
data_structures.py
Written by: Anders Maraviglia
"""

import time
from json import JSONEncoder

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
	"""
	Stores the data for a news headline.
	headline_str: """
	def __init__(self, headline_str, link_str, source, datestamp):
		self.headline_str = headline_str
		self.link_str = link_str
		self.keywords = []
		self.source = source
		self.datestamp = datestamp #str(int(time.strftime("%d"))/7) + "/" + (time.strftime("%m/%Y"))
		
	def __str__(self):
		string = self.headline_str + "\n" + self.link_str + "\n"
		return string

class HeadlineEncoder(JSONEncoder):
	def default(self, o):
		return o.__dict__

class State_Poll_Data:
	"""
	Stores the parsed polling data for one state.
	Note: there may only be one instance of this object per state."""
	def __init__(self, state_name):
		self.state_name = state_name
		self.red_poll_dict_list = []
		self.blue_poll_dict_list = []
		self.general_poll_dict_list = []

class State_Poll_DataEncoder(JSONEncoder):
	def default(self, o):
		return o.__dict__