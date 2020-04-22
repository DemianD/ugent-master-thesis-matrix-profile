export const getParkingsQuery = `
PREFIX datex: <http://vocab.datex.org/terms#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?s ?parkingName ?parkingNumberOfSpaces
WHERE {
    ?s rdf:type datex:UrbanParkingSite;
       datex:parkingName ?parkingName;
       datex:parkingNumberOfSpaces ?parkingNumberOfSpaces.
}`;

export const getTreeCollections = `
PREFIX tree: <https://w3id.org/tree#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX mp: <http://www.example.com/matrix-profile#>

SELECT ?url ?matrixProfile
WHERE {
    ?url rdf:type tree:collection.
  	OPTIONAL {
    	?url mp:matrixProfile ?matrixProfile.
  	}
}`;

export const getMatrixProfile = `
PREFIX tree: <https://w3id.org/tree#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX mp: <http://www.example.com/matrix-profile#>

SELECT ?dates ?distances ?indexes ?windowSize
WHERE {
  ?s mp:dates ?dates;
     mp:distances ?distances;
     mp:indexes ?indexes;
     mp:windowSize ?windowSize.
}`;

export const getLabelForSubject = (subject) => `
PREFIX tree: <https://w3id.org/tree#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?label
WHERE {
    <${subject}> rdfs:label ?label.
}`;

export const getNodes = `
PREFIX tree: <https://w3id.org/tree#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?s
WHERE {
    ?s rdf:type tree:Node.
}`;

export const getRelations = `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX tree: <https://w3id.org/tree#>
PREFIX void: <http://rdfs.org/ns/void#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?relation ?relationType ?node ?path ?value
WHERE { 
    ?collection void:subset ?partial.
    ?partial tree:relation ?relation.
    ?relation rdf:type ?relationType;
              tree:Node ?node;
              tree:path ?path;
              tree:value ?value.
}`;
