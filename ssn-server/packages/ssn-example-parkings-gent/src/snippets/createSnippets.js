import fs from 'fs';
import N3 from 'n3';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { exec } from '../utils.js';
import { MP, RDF, HYDRA, PROV, XSD } from '../vocs.js';
import stringifyQuads from '../../../ssn-core/src/utils/stringifyQuads.js';

const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const stat = promisify(fs.stat);

const { quad, namedNode, literal } = N3.DataFactory;

class CreateSnippets {
  constructor(tree, collection, snippetSizes, dataPath, nodesPath) {
    this.tree = tree;
    this.collection = collection;
    this.snippetSizes = snippetSizes;
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
    const { mtime: mtimeBefore } = await stat(`${this.nodesPath}/${node.nodeNumber}`);

    const pages = this.tree.getLeavesForNode(node).map(page => {
      return path.resolve(this.dataPath, `${page}.ttl`);
    });

    const tempFile = `./temp/${uuidv4()}.json`;

    await writeFile(tempFile, JSON.stringify({ snippet_sizes: this.snippetSizes, pages: pages }));

    const results = await exec(
      `python3 ./src/snippets/snippets.py ${tempFile} ${this.snippetSizes.join(',')}`
    );

    fs.unlink(tempFile, () => {});
    delete this.queue[node.nodeNumber];

    const { mtime: mtimeAfter } = await stat(`${this.nodesPath}/${node.nodeNumber}`);

    if (mtimeAfter.getTime() === mtimeBefore.getTime()) {
      // File has not changed
      const quads = this._quads(node, JSON.parse(results));

      // TODO: don't import stringifyQuads from core library, maybe we need to expose a @ssn/utils package?
      appendFile(`${this.nodesPath}/${node.nodeNumber}`, stringifyQuads(quads));
    }

    this._handleNext();
  }

  _quads(node, results) {
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
          quad(snippetSubject, MP('index'), literal(date, XSD('dateTime')))
        );
      });
    });

    return quads;
  }

  _handleNext() {
    const nextNodes = Object.values(this.queue);

    if (nextNodes.length === 0) {
      this.currentProcess = undefined;
    } else {
      this.currentProcess = this._process(nextNodes[0]);
    }
  }
}

export default CreateSnippets;
