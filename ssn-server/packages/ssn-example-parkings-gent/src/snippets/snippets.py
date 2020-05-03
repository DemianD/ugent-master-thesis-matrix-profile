import sys
import json
import matrixprofile as mp

taxi = mp.datasets.load('nyc-taxi-anomalies')
ts = taxi['data']

dataPath = sys.argv[1]
snippetsSize = int(sys.argv[2])

file = open(sys.argv[1], 'r')
content = json.loads(file.read())

dates = []
values = []

for row in content:
    dates.append(row['date'])
    values.append(float(row['value']))


test = ts[:len(values)]

snippets = mp.discover.snippets(values, snippetsSize, 4)

print(snippets)
