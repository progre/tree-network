tree-network
====

[![Build Status](https://travis-ci.org/progre/tree-network.svg?branch=master)](https://travis-ci.org/progre/tree-network)

Usage
----

```
const TreeNetwork = require('tree-network').TreeNetwork;

// declare function connectP2P(parent, child); // You implement this.

//      0
//    /   \
//   1     2
//  / \   / \
// 3   4 5   6
const root = {...};
const child1 = {...};
const child2 = {...};
const child3 = {...};
const child4 = {...};
const child5 = {...};
const child6 = {...};

const tree = new TreeNetwork();
tree.add(root);
connectP2P(tree.add(child1), child1);
connectP2P(tree.add(child2), child2);
connectP2P(tree.add(child3), child3);
connectP2P(tree.add(child4), child4);
connectP2P(tree.add(child5), child5);
connectP2P(tree.add(child6), child6);
// Tree network was completed.

// Drop child1...
//      0
//    /   \
//   3     2
//   |    / \
//   4   5   6
tree.remove(child1).forEach(({ newParent, branch }) => {
  connectP2P(newParent, branch);
});
```
