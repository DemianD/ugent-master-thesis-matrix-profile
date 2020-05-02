import it from 'ava';

import { TimeSeriesTree, AbstractDisk as Disk } from '../index.js';
import insertAlphabetHelper from './utils/insertAlphabetHelper.js';
import testNodeNamer from './utils/testNodeNamer.js';

it('1', async t => {
  const tree = new TimeSeriesTree(new Disk(), 4, testNodeNamer());

  await tree.insert('a', 'a');
  await tree.insert('b', 'b');
  await tree.insert('c', 'c');

  t.deepEqual(tree.mostRightIndexNode.keys, ['a', 'b', 'c']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['a', 'b', 'c']);
});

it('2', async t => {
  const tree = new TimeSeriesTree(new Disk(), 4, testNodeNamer());

  await tree.insert('a', 'a');
  await tree.insert('b', 'b');
  await tree.insert('c', 'c');

  const node = tree.mostRightIndexNode;

  await tree.insert('d', 'd');

  t.deepEqual(tree.mostRightIndexNode.nodeNumber, 1);
  t.deepEqual(tree.mostRightIndexNode.keys, ['d']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['d']);

  t.deepEqual(node.nodeNumber, 2);
  t.deepEqual(node.keys, ['a', 'b', 'c']);
  t.deepEqual(node.relations, ['a', 'b', 'c']);

  t.deepEqual(tree.path[0].nodeNumber, 'root');
  t.deepEqual(tree.path[0].keys, ['d']);
  t.deepEqual(tree.path[0].relations, [2, 1]);
});

it('3', async t => {
  const tree = new TimeSeriesTree(new Disk(), 4, testNodeNamer());

  await tree.insert('a', 'a');
  await tree.insert('b', 'b');
  await tree.insert('c', 'c');
  await tree.insert('d', 'd');
  await tree.insert('e', 'e');
  await tree.insert('f', 'f');

  const node = tree.mostRightIndexNode;

  await tree.insert('g', 'g');

  t.deepEqual(tree.mostRightIndexNode.keys, ['g']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['g']);

  t.deepEqual(node.keys, ['d', 'e', 'f']);
  t.deepEqual(node.relations, ['d', 'e', 'f']);

  t.deepEqual(tree.path[0].keys, ['d', 'g']);
  t.deepEqual(tree.path[0].relations, [2, 1, 3]);
});

it('4', async t => {
  const tree = new TimeSeriesTree(new Disk(), 4, testNodeNamer());

  await tree.insert('a', 'a');
  await tree.insert('b', 'b');
  await tree.insert('c', 'c');
  await tree.insert('d', 'd');
  await tree.insert('e', 'e');
  await tree.insert('f', 'f');

  const node = tree.mostRightIndexNode;

  await tree.insert('g', 'g');
  await tree.insert('h', 'h');
  await tree.insert('i', 'i');

  t.deepEqual(tree.mostRightIndexNode.keys, ['g', 'h', 'i']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['g', 'h', 'i']);

  t.deepEqual(node.keys, ['d', 'e', 'f']);
  t.deepEqual(node.relations, ['d', 'e', 'f']);

  t.deepEqual(tree.path[0].keys, ['d', 'g']);
  t.deepEqual(tree.path[0].relations, [2, 1, 3]);
});

it('5', async t => {
  const tree = new TimeSeriesTree(new Disk(), 4, testNodeNamer());

  const nodes = await insertAlphabetHelper(tree, 'l');

  const previousRoot = tree.path[0];

  await tree.insert('m', 'm');

  t.deepEqual(tree.path[0].nodeNumber, 'root');
  t.deepEqual(tree.path[0].keys, ['j']);
  t.deepEqual(tree.path[0].relations, [7, 6]);

  t.not(previousRoot.nodeNumber, 'root');
  t.deepEqual(previousRoot.keys, ['d', 'g']);
  t.deepEqual(previousRoot.relations, [2, 1, 3]);

  t.deepEqual(tree.path[1].keys, ['m']);
  t.deepEqual(tree.path[1].relations, [4, 5]);

  t.is(tree.path[2], tree.mostRightIndexNode);

  t.is(tree.mostRightIndexNode.isLeaf(), true);
  t.deepEqual(tree.mostRightIndexNode.keys, ['m']);
  t.deepEqual(tree.mostRightIndexNode.relations, ['m']);

  t.is(nodes['l'].node.isLeaf(), true);
  t.deepEqual(nodes['l'].keys, ['j', 'k', 'l']);
  t.deepEqual(nodes['l'].relations, ['j', 'k', 'l']);
});
