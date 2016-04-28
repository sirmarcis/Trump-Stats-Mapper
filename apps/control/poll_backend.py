from celery import Celery
from datetime import timedelta
import sys
import os
import platform

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
import data_analysis

app = Celery('tasks', broker='amqp://localhost')

CELERYBEAT_SCHEDULE = {
    'update-every-day': {
        'task': 'tasks.update',
        'schedule': timedelta(hours=24),
    },
}

@app.task
def update():
	data_analysis.get_data_analysis([])
	return "Updated the backend."

if __name__ == "__main__":
	app.start()

# celery -A poll_backend worker --loglevel=info