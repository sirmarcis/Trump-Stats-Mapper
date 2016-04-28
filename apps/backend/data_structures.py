"""
data_structures.py
Written by: Anders Maraviglia

Contains all complex data structures (i.e. classes) used in the backend, whether it be for parsing or analysis.
"""

from json import JSONEncoder

class RaceData:
	"""Each race should be a unique instance of this object,
	but one race should have no more than one instance of this object.
	Each instance has the following properties:
	race_name: the name of the race whose data this instance contains
	race_poll_str_data: the results of all polls, stored in an array of strings
	race_spread_str_data: the summary result of the poll, stored in an array of strings (i.e Trump +12)
	race_result_data: where the parsed data for each poll is stored, an array
	poll_source_str: the source for each poll, stored in an array of strings
	prez_race_p: whether this instance is a poll relating to the presedential election, either True or False.
	"""
	def __init__(self, race_name):
		self.race_name = race_name
		self.race_poll_str_data = []
		self.race_spread_str_data = []
		self.race_result_data = []
		self.poll_source_str = []
		self.prez_race_p = self.in_prez_race_p(race_name)

	def in_prez_race_p(self, race_name):
		"""Called by __init__,
		Identifies if the race has to do with the presidential one.
		"""
		race_name_tokens = race_name.split( )
		return 'Presidential' in race_name_tokens

class Headline:
	"""Stores the data for a news headline.
	headline_str: The string headline of the article
	link_str: the link to the source of the headline
	keywords: an array containing all the keywords for this headline
	source: the news source for this headline, in the form of a string
	datestamp: the exact date and time the article was released
	sub_datestamp: just the day, month, and year the article was released.
	"""
	def __init__(self, headline_str, link_str, source, datestamp):
		self.headline_str = headline_str
		self.link_str = link_str
		self.keywords = []
		self.source = source
		self.datestamp = datestamp
		self.sub_datestamp = self.break_datestamp(datestamp)
		self.keyword_weight = 0
		
	def break_datestamp(self, datestamp):
		"""Called by __init__,
		Reformats the datestamp to only contain the day, month, and year, not the time.
		"""
		datestamp_list = datestamp.split(' ')
		space_datestamp_list = []
		for elt in datestamp_list:
			space_datestamp_list.append(elt)
			space_datestamp_list.append(" ")
		return ''.join(space_datestamp_list[0:7])

	def __str__(self):
		string = self.headline_str + "\n" + self.link_str + "\n"
		return string

class HeadlineEncoder(JSONEncoder):
	"""The class to handle translating a Headline class to JSON."""
	def default(self, o):
		return o.__dict__

class StatePollData:
	"""Stores the parsed polling data for one state.
	Note: there may only be one instance of this object per state.
	state_name: the full name string of the state repreesnted by the object instance
	red_poll_dict_list: a dictionary of lists storing all the republican poll data for the state
	blue_poll_dict_list: a dictionary of lists storing all the democratic poll data for the state
	general_poll_dict_list: a dictionary of lists storing any poll not related to a primary presidential race.
	"""
	def __init__(self, state_name):
		self.state_name = state_name
		self.red_poll_dict_list = []
		self.blue_poll_dict_list = []
		self.general_poll_dict_list = []

class StatePollDataEncoder(JSONEncoder):
	"""The class to handle translating a State_Poll_Data class to JSON."""
	def default(self, o):
		return o.__dict__