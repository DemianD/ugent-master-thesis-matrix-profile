import os
import json
import time
import pickle

from series import Series
from utils import DelayedKeyboardInterrupt

# Config
queue_directory = '../queue'
pickle_directory = '../pickles'
        
seriesRepository = {}

while True:
    processed = 0

    # Get all files from the queue directory in order
    fileNames = sorted(os.listdir(queue_directory))

    for fileName in fileNames:
        if not fileName.endswith(".json"):
            continue

        # Open the file and parse to json
        file = open(queue_directory + '/' + fileName, "r")
        content = json.loads(file.read())

        # Check if there is a series object in memory. If not, check if it exists as a pickle object on the disk
        series = seriesRepository.get(content['key'])
        pickle_filename = pickle_directory + '/' + content['key'] + '.pickle'
        
        if series is None:
            if os.path.exists(pickle_filename):
                print("Loading:", pickle_filename)

                with open(pickle_filename, 'rb') as f:
                    seriesRepository[content['key']] = series = pickle.load(f)
            else:
                seriesRepository[content['key']] = series = Series(content['key'], content['m'], content['series_window'], content['result_path'])

        # Add the observation
        series.add(content['index'], float(content['value']))

        # Save the series object to disk
        with DelayedKeyboardInterrupt():
            with open(pickle_filename, 'wb') as f:
                pickle.dump(series, f, pickle.HIGHEST_PROTOCOL)

            # Delete the file when completed
            os.unlink(queue_directory + '/' + fileName)
        
        processed += 1

    if processed == 0:
        # Sleep 10 seconds
        time.sleep(10)
