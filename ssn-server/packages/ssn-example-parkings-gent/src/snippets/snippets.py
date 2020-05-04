import sys
import os
import json
from rdflib import Graph, Namespace
import matrixprofile as mp

def blockPrint():
    sys.stdout = open(os.devnull, 'w')

def enablePrint():
    sys.stdout = sys.__stdout__

blockPrint()

dataPath = sys.argv[1]

file = open(sys.argv[1], 'r')
content = json.loads(file.read())

pages = content['pages']
snippet_sizes = content['snippet_sizes']

dates = []
values = []

RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
SOSA = Namespace("http://www.w3.org/ns/sosa/")

for page in pages:
    graph = Graph()
    graph.load(page, format="trig")

    for s, p, o in graph.triples((None, RDF.type, SOSA.Observation)):
        _, _, value = next(graph.triples((s, SOSA.hasSimpleResult, None)))
        _, _, date = next(graph.triples((s, SOSA.resultTime, None)))

        values.append(value)
        dates.append(date)

result = {}

for snippet_size in snippet_sizes:
    jsonObjects = []
    snippets = mp.discover.snippets(values, snippet_size, 4)

    for snippet in snippets:
        date = dates[snippet['index']]
        fraction = snippet['fraction']

        formattedDate = date.value.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

        jsonObjects.append({
            "date": formattedDate, 
            "fraction": fraction 
        })

    result[snippet_size] = jsonObjects

enablePrint()

print(json.dumps(result))
