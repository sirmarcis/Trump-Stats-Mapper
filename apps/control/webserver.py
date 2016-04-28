"""
webserver.py
Written by: Steven Fiacco, Anders Maraviglia

In charge of launching the web server and handling ajax calls to it.
Communicates between the backend and frontend, i.e. this is the Control.
All queries for data must go through the database in the backend.
"""

import sys
import os
from flask import Flask, render_template, jsonify, request
import platform
app = Flask(__name__)

def get_backend_filepath():
	"""Gets the path to the backend in order to import it."""
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = ""
	if platform.system() == "Windows":
		database_filepath = filepath.split('control')[0] + "backend\\"
	else:
		database_filepath = filepath.split('control')[0] + "backend/"
	return database_filepath

sys.path.append(get_backend_filepath())
import database
import data_analysis

@app.route('/')
def index():
	"""Serve front end main page."""
	return render_template("index.html")

@app.route('/map_index.html')
def map_index():
	"""Serve front end map html for use by index.html."""
	return render_template("map_index.html")

@app.route('/get_poll_data')
def get_poll_data():
	"""Get the poll data JSON object for the specified week."""
	week=request.args.get('week', '', type=str)
	data = None
	if week == '' or week == "curr_week":
		data = database.get_poll_JSON_obj(database.get_datestamp())
	else:
		data = database.get_poll_JSON_obj(week)
	return jsonify(result=data)

@app.route('/get_headline_data')
def get_headline_data():
	"""Get the headline JSON object for the specified week."""
	week=request.args.get('week', '', type=str)
	data = None
	if week == '' or week == "curr_week":
		data = database.get_headline_JSON_obj(database.get_datestamp())
	else:
		data = database.get_headline_JSON_obj(week)
	return jsonify(result=data)

@app.route('/get_finished_states_data')
def get_finished_states_data():
	"""Get the finished states delegate count JSON object."""
	data = database.get_finished_states_JSON_obj()
	return jsonify(result=data)

@app.route('/update_poll_headline_data')
def update_poll_headline_data():
	"""Call to run the backend analysis."""
	data_analysis.get_data_analysis([])
	return "Finished updating headline and poll data."

@app.route('/get_keywords')
def get_keywords():
	"""Call to get the keywords JSON object for the current week."""
	return jsonify(result=database.get_keywords_JSON_obj())

if __name__ == "__main__":
	app.run(debug=True)

