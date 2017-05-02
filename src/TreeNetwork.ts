export interface Options {
  maxBranches?: number;
}

interface StrictOptions {
  maxBranches: number;
}

function setDefaultValue(opts?: Options): StrictOptions {
  return {
    maxBranches: (opts == null ? null : opts.maxBranches) || 2,
  };
}

export default class TreeNetwork<T> {
  private root: Root<T> | null;

  add(item: T, opts?: Options) {
    const root = new Root(item, setDefaultValue(opts));
    if (this.root == null) {
      this.root = root;
      return null;
    }
    return this.root.addBranch(root);
  }

  remove(item: T): { newParent: T | null; branch: T }[] | null {
    if (this.root == null) {
      return null;
    }
    if (this.root.value === item) {
      if (this.root.branches.length === 0) {
        this.root = null;
        return [];
      }
      const newRoot = this.root.branches[0];
      const dropBranch = this.root.branches[1];
      this.root = newRoot;
      return [{ newParent: <T | null>null, branch: this.root.value }]
        .concat([{ newParent: this.root.addBranch(dropBranch), branch: dropBranch.value }]);
    }
    return this.root.remove(item);
  }

  findParent(item: T) {
    if (this.root == null) {
      return null;
    }
    return this.root.findParent(item);
  }

  count() {
    if (this.root == null) {
      return 0;
    }
    return this.root.count();
  }
}

class Root<T> {
  branches: ReadonlyArray<Root<T>> = [];

  constructor(
    public value: T,
    private options: StrictOptions,
  ) {
  }

  /**
   * @return Parent of added item
   */
  addBranch(branch: Root<T>): T {
    if (this.branches.length < this.options.maxBranches) {
      this.branches = this.branches.concat([branch]);
      return this.value;
    }
    return this.branches.slice()
      .sort((a, b) => a.depthOfShallowEmptyBranch() - b.depthOfShallowEmptyBranch())[0]
      .addBranch(branch);
  }

  addBranches(branches: ReadonlyArray<Root<T>>) {
    return branches.slice().sort((a, b) => b.count() - a.count()) // Order of heavy
      .map(branch => ({
        newParent: this.addBranch(branch), // add order of heavy
        branch: branch.value,
      }));
  }

  remove(item: T): { newParent: T; branch: T }[] | null {
    if (item === this.value) {
      throw new Error('Logic error');
    }
    const parentOfDeletingItem = this.findParentBranch(item);
    if (parentOfDeletingItem == null) {
      return null;
    }
    const idx = parentOfDeletingItem.branches.findIndex(x => x.value === item);
    if (idx < 0) {
      throw new Error('Logic error');
    }
    const cutOffBranches = parentOfDeletingItem.branches[idx].branches;
    parentOfDeletingItem.branches = parentOfDeletingItem.branches.filter((_, i) => i !== idx);
    return this.addBranches(cutOffBranches);
  }

  findParent(item: T) {
    const parent = this.findParentBranch(item)
    return parent == null ? null : parent.value;
  }

  private findParentBranch(item: T): Root<T> | null {
    if (this.branches.find(x => x.value === item)) {
      return this;
    }
    for (const branch of this.branches) {
      const parent = branch.findParentBranch(item);
      if (parent != null) {
        return parent;
      }
    }
    return null;
  }

  private depthOfShallowEmptyBranch(): number {
    if (this.branches.length < this.options.maxBranches) {
      return 0;
    }
    return this.branches
      .map(x => x.depthOfShallowEmptyBranch() + 1)
      .sort()[0];
  }

  count(): number {
    return 1 + this.branches.reduce((p, c) => p + c.count(), 0);
  }
}
