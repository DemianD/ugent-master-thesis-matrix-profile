import fs from 'fs';
import N3 from 'n3';
import { promisify } from 'util';
import uuid from 'uuid';
import { SOSA, RDF } from '../vocs.js';
import { exec } from '../utils.js';

const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

const mapStoreToObservations = store => {
  const subjects = store.getSubjects(RDF('type'), SOSA('Observation'));

  return subjects.map(subject => {
    const result = store.getObjects(subject, SOSA('hasSimpleResult'))[0];
    const resultTime = store.getObjects(subject, SOSA('resultTime'))[0];

    return { date: resultTime.value, value: result.value };
  });
};

const getData = async (dataPath, pages) => {
  return Promise.all(
    pages.map(page => {
      return new Promise((resolve, reject) => {
        const store = new N3.Store();
        const parser = new N3.Parser();

        const rdfStream = fs.createReadStream(`${dataPath}/${page}.ttl`);

        parser.parse(rdfStream, (err, quad) => {
          if (err) {
            reject(err);
          } else if (quad) {
            store.addQuad(quad);
          } else {
            resolve(mapStoreToObservations(store));
          }
        });
      });
    })
  ).then(results => results.flat());
};

const createSnippets = async (tree, node, snippetSizes, dataPath, nodesPath) => {
  const { mtime: mtimeBefore } = await stat(`${nodesPath}/${node.nodeNumber}`);

  const pages = tree.getLeavesForNode(node);

  const firstPageDate = new Date(pages[0]).getTime();
  const lastPageDate = new Date(pages[pages.length - 1]).getTime();

  const differenceInMilliseconds = lastPageDate - firstPageDate;
  const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));

  const filteredSnippetSizes = snippetSizes;
  // const filteredSnippetSizes = snippetSizes.filter(
  //   snippetSize => differenceInDays > snippetSize * 2
  // );

  if (filteredSnippetSizes.length <= 0) {
    // return;
  }

  const data = await getData(dataPath, pages);
  const tempFile = `./temp/${uuid.v4()}.json`;

  await writeFile(tempFile, JSON.stringify(data));

  const { mtime: mtimeAfter } = await stat(`${nodesPath}/${node.nodeNumber}`);

  if (mtimeAfter.getTime() > mtimeBefore.getTime()) {
    // File has changed
    return;
  }

  const results = await Promise.all(
    filteredSnippetSizes.map(snippetSize => {
      return exec(`python3 ./src/snippets/snippets.py ${tempFile} ${snippetSize}`);
    })
  );

  console.log(results);

  // fs.unlink(tempFile, () => {});

  // console.log({ firstPageDate, lastPageDate, differenceInDays, data: JSON.stringify(data) });
};

export default createSnippets;
