try { require('source-map-support').install(); } catch (e) { /* NOP */ }
import * as assert from 'power-assert';
import { TreeNetwork } from '../';

const pyramidSample = [
  ['0'],
  ['1-0', '1-1'],
  ['2-0', '2-1', '2-2', '2-3'],
];

describe('TreeNetwork', () => {
  it('can have no item', () => {
    const tree = new TreeNetwork(2);
    assert(tree.count() === 0);
    assert(tree.findParent({}) == null);
    assert(tree.remove({}) == null);
  });

  it('is added items as pyramid', () => {
    const tree = new TreeNetwork(2);
    tree.add(pyramidSample[0][0]);
    assertTree(tree, 1, pyramidSample[0][0], null);
    tree.add(pyramidSample[1][0]);
    assertTree(tree, 2, pyramidSample[1][0], pyramidSample[0][0]);
    tree.add(pyramidSample[1][1]);
    assertTree(tree, 3, pyramidSample[1][1], pyramidSample[0][0]);
    tree.add(pyramidSample[2][0]);
    assertTree(tree, 4, pyramidSample[2][0], pyramidSample[1][0]);
    tree.add(pyramidSample[2][1]);
    assertTree(tree, 5, pyramidSample[2][1], pyramidSample[1][0]);
    tree.add(pyramidSample[2][2]);
    assertTree(tree, 6, pyramidSample[2][2], pyramidSample[1][1]);
    tree.add(pyramidSample[2][3]);
    assertTree(tree, 7, pyramidSample[2][3], pyramidSample[1][1]);
  });

  it('can remove leaf', () => {
    const {
      pyramid,
      child22,
    } = createPyramid();
    assert(pyramid.count() === 7);
    const reconnectings = pyramid.remove(child22);
    assert(pyramid.count() === 6);
    assert(reconnectings != null);
    assert(reconnectings!.length === 0);
  });

  it('can be broken', () => {
    //      o
    //    /   \
    //   x     o
    //  / \   / \
    // o   o o   o
    //      ↓
    //      o
    //    /   \
    //   o     o
    //  /     / \
    // o     o   o
    const {
      pyramid,
      root,
      child1,
      // child2,
      child11,
      child12,
      // child21,
      // child22,
    } = createPyramid();
    assert(pyramid.count() === 7);
    const reconnectings = pyramid.remove(child1);
    assert(pyramid.count() === 6);
    assert(reconnectings != null);
    assert(reconnectings!.length === 2);
    assert(reconnectings![0].branch === child11);
    assert(reconnectings![0].newParent === root);
    assert(reconnectings![1].branch === child12);
    assert(reconnectings![1].newParent === child11);
  });

  it('can pull out root', () => {
    //      x
    //    /   \
    //   o     o
    //  / \   / \
    // o   o o   o
    //      ↓
    //      o
    //    /   \
    //   o     o
    //   |
    //   o
    //  / \
    // o   o
    const {
      pyramid,
      root,
      child1,
      child2,
      child11,
      // child12,
      // child21,
      // child22,
    } = createPyramid();
    assert(pyramid.count() === 7);
    const reconnectings = pyramid.remove(root);
    assert(pyramid.count() === 6);
    assert(reconnectings != null);
    assert(reconnectings!.length === 2);
    assert(reconnectings![0].branch === child1);
    assert(reconnectings![0].newParent == null);
    assert(reconnectings![1].branch === child2);
    assert(reconnectings![1].newParent === child11);
  });
});

function assertTree(tree: TreeNetwork<{}>, count: number, child: {}, parent: {} | null) {
  assert(tree.count() === count);
  assert(tree.findParent(child) == parent);
  assert(tree.remove({}) == null);
  assert(tree.count() === count);
}

function createPyramid() {
  return {
    pyramid: assemblePyramid(pyramidSample),
    root: pyramidSample[0][0],
    child1: pyramidSample[1][0],
    child2: pyramidSample[1][1],
    child11: pyramidSample[2][0],
    child12: pyramidSample[2][1],
    child21: pyramidSample[2][2],
    child22: pyramidSample[2][3],
  };
}

function assemblePyramid(source: ReadonlyArray<ReadonlyArray<string>>) {
  source.forEach((stage, i) => {
    assert(stage.length === 2 ** i);
  });
  const tree = new TreeNetwork<string>(2);
  source.reduce((p, c) => p.concat(c), [])
    .forEach((item) => {
      tree.add(item);
    });
  return tree;
}
