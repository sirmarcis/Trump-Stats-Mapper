import sys
import os
from flask import Flask
app = Flask(__name__)


def get_backend_filepath():
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = filepath.split('control')[0] + "backend/"
	return database_filepath

sys.path.append(get_backend_filepath())
import database

@app.route('/')
def index():
  return render_template('index_test.html')

# @app.route('/')
# def hello_world():
#     return 'Hello World!'


def main():
	print get_backend_filepath()

if __name__ == "__main__":
	main()
	app.run(debug=True)

