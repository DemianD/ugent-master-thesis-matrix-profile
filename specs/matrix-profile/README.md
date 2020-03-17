# Matrix Profile Ontology

## mp:matrixProfile

A property to define on a `hydra:collection` to state that it has a matrix profile.

```turtle
<A> a hydra:Collection;
    hydra:totalItems "2";
    hydra:member <A/2020-02-28T16:02:00>, <A/2020-02-28T16:03:00>;
    mp:matrixProfile <A/matrix-profiles/10080>. # This link should be followed by the client, when the client is interested.
```

## Classes

### mp:MatrixProfile

```turtle
<A/matrix-profiles/10080> a mp:MatrixProfile;
                          mp:belongsTo <A>;
                          mp:windowSize 10080;
                          hydra:member <A/matrix-profiles/10080/2020-02-28T16:02:00>, <A/matrix-profiles/10080/2020-02-28T16:03:00>.
```

**Properties:**

- mp:belongsTo: A mp:belongsTo is used to link back to the collection
- mp:windowSize: size of the window

### mp:Result

```turtle
<A/matrix-profiles/10080/2020-02-28T16:03:00> a mp:Result;
                                              mp:matrixProfile <A/matrix-profiles/10080>;
                                              mp:dataPoint <A/2020-02-28T16:03:00>;
                                              mp:value 0.0;
                                              mp:index "2020-02-28T16:02:00"^^xsd:dateTime.
```

**Properties:**

- mp:matrixProfile: links back to the matrix profile
- mp:dataPoint: Links to the corresponding object. Or should we just define the date, similar to mp:index?
- mp:value: The value that corresonds to the matrix profile
- mp:index: Contains the date of the nearest neighbor of the data point

> Question: mp:dataPoint contains an object. This can for example be an `sosa:Observation`. Instead of using an object, we could also just define the date of the `sosa:Observation`.

## Future work

- Describe snippets
