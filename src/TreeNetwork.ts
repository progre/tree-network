export default class TreeNetwork<T> {
  private root: Root<T> | null;

  constructor(
    private maxBranches: number,
  ) {
  }

  add(item: T) {
    if (this.root == null) {
      this.root = new Root(item, this.maxBranches);
      return null;
    }
    return this.root.add(item);
  }

  /**
   * @return Array of { newParent, child }
   */
  remove(item: T) {
    if (this.root == null) {
      return null;
    }
    if (this.root.value === item) {
      if (this.root.branches.length === 0) {
        this.root = null;
        return [];
      }
      this.root = this.root.branches[0];
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
    private maxBranches: number,
  ) {
  }

  /**
   * @return Parent of added item
   */
  add(item: T) {
    if (this.value == null) {
      this.value = item;
      return null;
    }
    return this.addBranch(new Root<T>(item, this.maxBranches));
  }

  /**
   * @return Parent of added item
   */
  private addBranch(branch: Root<T>): T {
    if (this.branches.length < this.maxBranches) {
      this.branches = this.branches.concat([branch]);
      return this.value;
    }
    return this.branches.slice()
      .sort((a, b) => a.depthOfShallowEmptyBranch() - b.depthOfShallowEmptyBranch())[0]
      .addBranch(branch);
  }

  /**
   * @return Array of { newParent, child }
   */
  remove(item: T): { newParent: T; branch: T }[] | null {
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
    return cutOffBranches.slice()
      .sort((a, b) => b.count() - a.count())
      .map(branch => ({
        newParent: this.addBranch(branch),
        branch: branch.value,
      }));
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
    if (this.branches.length < this.maxBranches) {
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
