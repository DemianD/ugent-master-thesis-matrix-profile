import sys
import os
import json
import numpy as np
import pandas as pd
from rdflib import Graph, Namespace
import matrixprofile as mp

def blockPrint():
    sys.stdout = open(os.devnull, 'w')

def enablePrint():
    sys.stdout = sys.__stdout__

blockPrint()

try:
    df = pd.read_pickle("./not_existing.pkl")
except:
    dataPath = sys.argv[1]

    file = open(sys.argv[1], 'r')
    content = json.loads(file.read())

    pages = content['pages']

    observations = []

    RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
    SOSA = Namespace("http://www.w3.org/ns/sosa/")

    for page in pages:
        print(page)
        graph = Graph()
        graph.load(page, format="trig")

        for s, p, o in graph.triples((None, RDF.type, SOSA.Observation)):
            _, _, value = next(graph.triples((s, SOSA.hasSimpleResult, None)))
            _, _, date = next(graph.triples((s, SOSA.resultTime, None)))

            observation = {
                'date': date.value,
                'value': float(value.value)
            }

            observations.append(observation)

    df = pd.DataFrame(observations, columns=['date', 'value'])
    df = df.set_index('date')
    df.index = pd.to_datetime(df.index)
    # df.to_pickle("./test.pkl")

result = {}

original_snippet_size = 12 * 24 * 7 # 1 week
original_dates = np.array(df.index.copy().tolist())
original_values = np.array(df['value'].copy().values.tolist())

start = df.index[0]
end = df.index[-1]
delta = end - start

if delta.days < 60:
    snippet_size = original_snippet_size
    dates = original_dates
    values = original_values
else:
    snippet_size = 1 * 24 * 7 # 1 week

    df = df.resample('1H').mean()
    df = df.dropna()

    values = np.array(df['value'].copy().values.tolist())
    dates = np.array(df.index.copy().tolist())

print("days", delta.days)
print("number of observations:", len(values))

result = {}

if len(df) >= (2 * snippet_size):
    jsonObjects = []
    snippets = mp.discover.snippets(values, snippet_size, 10)

    for snippet in snippets:
        date = dates[snippet['index']]
        fraction = snippet['fraction']

        if fraction == 0.0:
            continue

        closetDate = min(original_dates, key=lambda x:abs(x-date))

        # Because date can be an approximation because of the resampling,
        # we need to search the nearest date

        formattedDate = closetDate.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

        jsonObjects.append({
            "date": formattedDate, 
            "fraction": fraction 
        })

    result[original_snippet_size] = jsonObjects

enablePrint()

print(json.dumps(result))
