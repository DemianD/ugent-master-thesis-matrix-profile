import fs from 'fs';
import N3 from 'n3';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { exec } from '../utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { MP, RDF, HYDRA, PROV, XSD, SOSA } from '../vocs.js';
import stringifyQuads from '@ssn/core/src/utils/stringifyQuads.js';

const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const stat = promisify(fs.stat);

const { quad, namedNode, literal } = N3.DataFactory;

class CreateSnippets {
  constructor(tree, collection, dataPath, nodesPath) {
    this.tree = tree;
    this.collection = collection;
    this.dataPath = dataPath;
    this.nodesPath = nodesPath;

    this.queue = {};
    this.currentProcess = undefined;
  }

  create(node) {
    this.queue[node.nodeNumber] = node;

    if (this.currentProcess === undefined) {
      this._handleNext();
    }
  }

  async _process(node) {
    console.log('_process', node);
    const { mtime: mtimeBefore } = await stat(`${this.nodesPath}/${node.nodeNumber}`);

    const pages = this.tree.getLeavesForNode(node).map(page => {
      return path.resolve(this.dataPath, `${page}.ttl`);
    });

    console.log('_process', node.nodeNumber, pages.length);

    const tempFile = `./temp/${uuidv4()}.json`;

    await writeFile(tempFile, JSON.stringify({ pages: pages }));

    try {
      const results = await exec(`python3 ${path.resolve(__dirname, 'snippets.py')} ${tempFile}`);

      const { mtime: mtimeAfter } = await stat(`${this.nodesPath}/${node.nodeNumber}`);

      if (mtimeAfter.getTime() === mtimeBefore.getTime()) {
        // File has not changed

        const quads = this._quads(node, pages, JSON.parse(results));

        // TODO: don't import stringifyQuads from core library, maybe we need to expose a @ssn/utils package?
        appendFile(`${this.nodesPath}/${node.nodeNumber}`, stringifyQuads(quads));

        console.log('_processed', node.nodeNumber);

        delete this.queue[node.nodeNumber];
      }
    } catch (err) {
      console.error('error', err);
    } finally {
      fs.unlink(tempFile, () => {});

      this._handleNext();
    }
  }

  _quads(node, pages, results) {
    console.log(results);
    const quads = [];

    // TODO: this should not be defined here because this is dependent of the value specified in the (LD)Disk
    const nodeSubject = `${this.collection.getSubject().id}/node/${node.nodeNumber}`;

    Object.entries(results).map(([snippet_size, snippets]) => {
      const subject = namedNode(`${nodeSubject}/snippets/${snippet_size}`);

      quads.push(
        quad(subject, RDF('type'), HYDRA('Collection')),
        quad(subject, PROV('wasDerivedFrom'), namedNode(nodeSubject))
      );

      snippets.map(({ date, fraction }) => {
        const snippetSubject = namedNode(`${subject.value}/${date}`);

        quads.push(
          quad(subject, HYDRA('member'), snippetSubject),
          quad(snippetSubject, RDF('type'), MP('Snippet')),
          quad(snippetSubject, MP('snippet_size'), literal(snippet_size)),
          quad(snippetSubject, MP('fraction'), literal(fraction)),
          quad(snippetSubject, MP('index'), literal(date, XSD('dateTime'))),

          quad(
            snippetSubject,
            MP('from'),
            literal(path.basename(pages[0], '.ttl'), XSD('dateTime'))
          ),

          quad(
            snippetSubject,
            MP('to'),
            literal(
              this._getLastObservationResultTimeOfPage(pages[pages.length - 1]),
              XSD('dateTime')
            )
          )
        );
      });
    });

    return quads;
  }

  _getLastObservationResultTimeOfPage(page) {
    const content = fs.readFileSync(page, 'utf-8');

    const parser = new N3.Parser({ blankNodePrefix: '' });
    const store = new N3.Store();

    store.addQuads(parser.parse(content));

    const observationSubjects = store.getSubjects(RDF('type'), SOSA('Observation'));

    const lastResultTime = store.getObjects(
      observationSubjects[observationSubjects.length - 1],
      SOSA('resultTime')
    );

    return lastResultTime.length ? lastResultTime[0].value : path.basename(page, '.ttl');
  }

  _handleNext() {
    const nextNodes = Object.values(this.queue);

    this.currentProcess = nextNodes.length === 0 ? undefined : this._process(nextNodes[0]);
  }
}

export default CreateSnippets;
