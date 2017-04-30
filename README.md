tree-network
====

[![Build Status](https://travis-ci.org/progre/tree-network.svg?branch=master)](https://travis-ci.org/progre/tree-network)

Usage
----

```
const TreeNetwork = require('tree-network').TreeNetwork;

const root = {...};
const child1 = {...};
const child2 = {...};

const tree = new TreeNetwork();
tree.add(root);
tree.add(child1);
tree.add(child2);

assert(tree.getParent(root) == null);
assert(tree.getParent(child1) === root);
assert(tree.getParent(child2) === root);
```
