"""
webserver.py
Written by: Steven Fiacco, Anders Maraviglia
"""

import sys
import os
from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

def get_backend_filepath():
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = filepath.split('control')[0] + "backend/"
	return database_filepath

sys.path.append(get_backend_filepath())
import database
import data_analysis

def get_index_filepath():
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = filepath.split('apps')[0]
	return database_filepath

@app.route('/')
def index():
	return render_template("index_test.html")

@app.route('/get_poll_data/<week>')
def get_poll_data(week=None):
	data_analysis.get_data_analysis([])
	data = None
	if week == None or week == "curr_week":
		data = database.get_poll_JSON_obj(database.get_datestamp())
	else:
		data = database.get_poll_JSON_obj(week)
	return jsonify(result=data)

@app.route('/get_headline_data/<week>')
def get_headline_data(week=None):
	data = None
	if week == None or week == "curr_week":
		data = database.get_headline_JSON_obj(database.get_datestamp())
	else:
		data = database.get_headline_JSON_obj(week)
	return jsonify(result=data)


@app.route('/_add_numbers')
def add_numbers():
    a = request.args.get('a', 0, type=int)
    b = request.args.get('b', 0, type=int)
    return jsonify(result=a + b)



# @app.route('/')
# def hello_world():
#     return 'Hello World!'

@app.route('/update_poll_headline_data')
def update_poll_headline_data():
	data_analysis.get_data_analysis([])
	return "Finished updating headline and poll data."


def main():
	print get_backend_filepath()

if __name__ == "__main__":
	#main()
	app.run(debug=True)

