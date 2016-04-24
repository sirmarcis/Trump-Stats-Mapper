import sys
import os

def get_backend_filepath():
	filepath = os.path.dirname(os.path.realpath(__file__))
	database_filepath = filepath.split('control')[0] + "backend/"
	return database_filepath

sys.path.append(get_backend_filepath())
import database

def main():
	print get_backend_filepath()

if __name__ == "__main__":
	main()

