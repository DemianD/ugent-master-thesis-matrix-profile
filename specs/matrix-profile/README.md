# Matrix Profile Ontology

## mp:matrixProfile

`mp:matrixProfile` should be used to state that a series has a matrix profile. You may add multiple matrix profiles to the series. The link of the matrix profile should be followed when the client is interested. The value `mp:matrixProfile` should be a `mp:MatrixProfile`.

```turtle
@prefix tree: <https://w3id.org/tree#>. # You can use your own collection type
@prefix mp: <http://www.example.com/TODO/>.

<A> a tree:Collection;
    tree:member <A/2020-02-28T16:00:00>, <A/2020-02-28T16:01:00>, ...;
    mp:matrixProfile <A/matrix-profiles/1440>,
                     <A/matrix-profiles/2880>.
```

## Classes

### mp:MatrixProfile

`mp:MatrixProfile` defines a matrix profile. It should contain the used window size and series which was used for the calculation. A `mp:MatrixProfile` is a series and should be annotated with a collection.

```turtle
@prefix mp: <http://www.example.com/TODO/>.
@prefix tree: <https://w3id.org/tree#>. # You can use your own collection type

<A/matrix-profiles/1440> a mp:MatrixProfile, tree:Collection;
                         mp:belongsTo <A>;
                         mp:windowSize "1440"^^xsd:integer;
                         tree:member <A/matrix-profiles/1440/2020-02-28T16:00:00>, <A/matrix-profiles/1440/2020-02-28T16:01:00>, ... .
```

Each member of a matrix profile should be a `sosa:Observation`. This `sosa:Observation` must contain a `sosa:hasResult` object. This object must contain the `mp:distance` or `mp:normalisedDistance` and must contain the index (date) of the nearest neighbor. The `sosa:Observation` must contain a `sosa:hasFeatureOfInterest` to identify the start of the window that was used from the original series.

Optionally, you can define a `sosa:procedure`.

```turtle
@prefix mp: <http://www.example.com/TODO/>.
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix sosa: <http://www.w3.org/ns/sosa/>.
@prefix tree: <https://w3id.org/tree#>. # You can use your own collection type
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

<A/matrix-profiles/1440/procedure> a sosa:Procedure;
    rdfs:comment "SCRIMP++ algorithm was used with the euclidean distance".

<A/matrix-profiles/1440/2020-02-28T16:00:00> a sosa:observation;
                                             sosa:hasFeatureOfInterest <A/2020-02-28T16:00:00>;
                                             sosa:usedProcedure <A/matrix-profiles/1440/procedure>;
                                             sosa:hasResult [
                                                 mp:distance "0.0"^^xsd:decimal;
                                                 # or mp:normalisedDistance "0.0"^^xsd:decimal;
                                                 mp:nearestNeighbor "2020-02-30T16:00:00"^^xsd:decimal
                                             ].
```

> TODO: sosa:observedProperty?

## Future work

- Describe snippets
