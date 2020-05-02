import it from 'ava';

import { TimeSeriesTree, AbstractDisk as Disk } from '../index.js';
import insertAlphabetHelper from './utils/insertAlphabetHelper.js';

it('should split the leave page (even degree)', async t => {
  const tree = new TimeSeriesTree(new Disk(), 6);

  await insertAlphabetHelper(tree, 'e');
  t.is(tree.path.length, 1);

  t.deepEqual(tree.mostRightIndexNode.keys, ['a', 'b', 'c', 'd', 'e']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['a', 'b', 'c', 'd', 'e']);

  const node = tree.mostRightIndexNode;

  await tree.insert('f', 'f');

  t.deepEqual(tree.path[0].keys, ['e']);
  t.deepEqual(tree.mostRightIndexNode.keys, ['e', 'f']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['e', 'f']);

  t.deepEqual(node.keys, ['a', 'b', 'c', 'd']);
  t.deepEqual(node.relations, ['a', 'b', 'c', 'd']);
});

it('should split the leave page (odd degree)', async t => {
  const tree = new TimeSeriesTree(new Disk(), 7);

  await insertAlphabetHelper(tree, 'f');
  t.is(tree.path.length, 1);

  t.deepEqual(tree.mostRightIndexNode.keys, ['a', 'b', 'c', 'd', 'e', 'f']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['a', 'b', 'c', 'd', 'e', 'f']);

  const node = tree.mostRightIndexNode;

  await tree.insert('g', 'g');

  t.deepEqual(tree.path[0].keys, ['e']);
  t.deepEqual(tree.mostRightIndexNode.keys, ['e', 'f', 'g']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['e', 'f', 'g']);

  t.deepEqual(node.keys, ['a', 'b', 'c', 'd']);
  t.deepEqual(node.relations, ['a', 'b', 'c', 'd']);
});

it('should split a internal page (odd degree)', async t => {
  const tree = new TimeSeriesTree(new Disk(), 5);

  const nodes = await insertAlphabetHelper(tree, 'p');

  t.is(tree.path.length, 2);

  t.is(tree.path[0].nodeNumber, 'root');
  t.deepEqual(tree.path[0].keys, ['d', 'g', 'j', 'm']);

  t.deepEqual(nodes['a'].keys, ['a']);
  t.deepEqual(nodes['b'].keys, ['a', 'b']);
  t.deepEqual(nodes['c'].keys, ['a', 'b', 'c']);
  t.deepEqual(nodes['d'].keys, ['a', 'b', 'c', 'd']);
  t.deepEqual(nodes['d'].node.keys, ['a', 'b', 'c']);
  t.deepEqual(nodes['e'].keys, ['d', 'e']);
  t.deepEqual(nodes['f'].keys, ['d', 'e', 'f']);
  t.deepEqual(nodes['g'].keys, ['d', 'e', 'f', 'g']);
  t.deepEqual(nodes['g'].node.keys, ['d', 'e', 'f']);
  t.deepEqual(nodes['h'].keys, ['g', 'h']);
  t.deepEqual(nodes['i'].keys, ['g', 'h', 'i']);
  t.deepEqual(nodes['j'].keys, ['g', 'h', 'i', 'j']);
  t.deepEqual(nodes['j'].node.keys, ['g', 'h', 'i']);
  t.deepEqual(nodes['k'].keys, ['j', 'k']);
  t.deepEqual(nodes['l'].keys, ['j', 'k', 'l']);
  t.deepEqual(nodes['m'].keys, ['j', 'k', 'l', 'm']);
  t.deepEqual(nodes['m'].node.keys, ['j', 'k', 'l']);
  t.deepEqual(nodes['n'].keys, ['m', 'n']);
  t.deepEqual(nodes['o'].keys, ['m', 'n', 'o']);
  t.deepEqual(nodes['p'].keys, ['m', 'n', 'o', 'p']);

  // Adding the next character will split the root node
  const oldRoot = tree.path[0];
  await tree.insert('q', 'q');

  t.is(tree.path.length, 3);
  t.is(tree.path[0].nodeNumber, 'root');
  t.not(oldRoot.nodeNumber, 'root');

  t.deepEqual(tree.path[0].keys, ['j']);
  t.deepEqual(tree.path[1].keys, ['m', 'p']);
  t.deepEqual(oldRoot.keys, ['d', 'g']);
});

it('should split a internal page (even degree)', async t => {
  const tree = new TimeSeriesTree(new Disk(), 6);

  const nodes = await insertAlphabetHelper(tree, 'y');

  t.is(tree.path.length, 2);
  t.deepEqual(tree.path[0].keys, ['e', 'i', 'm', 'q', 'u']);

  t.deepEqual(nodes['a'].keys, ['a']);
  t.deepEqual(nodes['b'].keys, ['a', 'b']);
  t.deepEqual(nodes['c'].keys, ['a', 'b', 'c']);
  t.deepEqual(nodes['d'].keys, ['a', 'b', 'c', 'd']);
  t.deepEqual(nodes['e'].keys, ['a', 'b', 'c', 'd', 'e']);
  t.deepEqual(nodes['e'].node.keys, ['a', 'b', 'c', 'd']);
  t.deepEqual(nodes['f'].keys, ['e', 'f']);

  // Adding the next character will split the root node
  const oldRoot = tree.path[0];
  await tree.insert('z', 'z');

  t.is(tree.path.length, 3);

  t.deepEqual(tree.path[0].keys, ['q']);
  t.deepEqual(tree.path[1].keys, ['u', 'y']);
  t.deepEqual(oldRoot.keys, ['e', 'i', 'm']);
});
