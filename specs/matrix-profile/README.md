# Matrix Profile Ontology

## mp:matrixProfile

`mp:matrixProfile` is a property to define on a collection to state that it has a matrix profile.

```turtle
<A> a hydra:Collection; # This doesn't need to be a hydra:Collection, it can also be a tree:Collection or another collection.
    hydra:totalItems "2"^^xsd:integer;
    hydra:member <A/2020-02-28T16:00:00>, <A/2020-02-28T16:01:00>;
    mp:matrixProfile <A/matrix-profiles/10080>. # This link should be followed by the client, when the client is interested
```

## mp:MatrixProfile

`mp:MatrixProfile` is a class that describes the matrix profile and which collection (time series) was used. You should define a collection type to define the members of the matrix profile.

```turtle
<A/matrix-profiles/10080> a mp:MatrixProfile, hydra:Collection;
                          mp:belongsTo <A>;
                          mp:windowSize "10080"^^xsd:integer;
                          hydra:member <A/matrix-profiles/10080/2020-02-28T16:00:00>, <A/matrix-profiles/10080/2020-02-28T16:03:00>.

<A/matrix-profiles/10080> a mp:MatrixProfile, hydra:Collection;
                          mp:belongsTo <A>;
                          mp:windowSize "10080"^^xsd:integer;
                          hydra:member <A/matrix-profiles/10080/2020-02-28T16:00:00>, <A/matrix-profiles/10080/2020-02-28T16:03:00>.
```

**Properties:**

- `mp:belongsTo`: A mp:belongsTo is used to link back to the collection
- `mp:windowSize`: size of the window

**Members**

To model the members, we use the `sosa:Observation` class.

```turtle
<A/matrix-profiles/10080/2020-02-28T16:00:00> a sosa:Observation;
                                              sosa:observedProperty <matrix-profile/distance>;
                                              sosa:usedProcedure <matrix-profile/distance/procedure>;
                                              sosa:hasFeatureOfInterest <A/2020-02-28T16:00:00>;
                                              sosa:hasResult [
                                                  mp:distance "0.0"^^xsd:decimal
                                                  mp:normalisedDistance "0.0"^^xsd:decimal
                                                  mp:nearestNeighbor "2020-02-28T16:03:00"^^xsd:dateTime.
                                              ].
```

## Future work

- Describe snippets
- https://github.com/TREEcg/specification/issues/15
