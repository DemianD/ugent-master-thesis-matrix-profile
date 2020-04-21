import os
import glob
import json
import time
import pickle

from series import Series
from utils import DelayedKeyboardInterrupt

# Config
queue_directory = './queue/*.json'
pickle_directory = './pickles'
        
seriesRepository = {}

while True:
    processed = 0

    # Get all files from the queue directory in order
    fileNames = sorted(glob.glob(queue_directory, recursive=True))

    for fileName in fileNames:
        if not fileName.endswith(".json"):
            continue

        # Open the file and parse to json
        print(fileName)

        file = open(fileName, "r")
        content = json.loads(file.read())

        key = content['key']

        # Check if there is a series object in memory. If not, check if it exists as a pickle object on the disk
        series = seriesRepository.get(key)
        
        if series is None:
            pickle_filename = pickle_directory + '/' + key + '.pickle'

            if os.path.exists(pickle_filename):
                print("Loading:", pickle_filename)

                with open(pickle_filename, 'rb') as f:
                    seriesRepository[key] = series = pickle.load(f)
            else:
                seriesRepository[key] = series = Series(key, content['window_sizes'], content['series_window'], content['results_folder'])

        # Add the observation
        series.add(content['date'], float(content['value']))

        # Save the series object to disk
        with DelayedKeyboardInterrupt():
            with open(pickle_filename, 'wb') as f:
                pickle.dump(series, f, pickle.HIGHEST_PROTOCOL)

            # Delete the file when completed
            os.unlink(fileName)
        
        processed += 1

    if processed == 0:
        # There are no files, we will sleep a few seconds
        time.sleep(10)
