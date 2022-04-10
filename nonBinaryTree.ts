import { v4 } from "uuid";
const uuidv4 = v4;

type Traverse<T> = {
  data: T | undefined;
  key: string | undefined;
  children: Array<Traverse<T>>;
};

type Params = {
  onlyThisRoot: boolean;
  depth: number;
};

interface INonBinaryTree<T> {
  data: T | undefined;
  parent: INonBinaryTree<T> | undefined;
  leftChild: INonBinaryTree<T> | undefined;
  leftSibling: INonBinaryTree<T> | undefined;
  rightSibling: INonBinaryTree<T> | undefined;
  pushRightSibling(data: INonBinaryTree<T>): void;
  pushNodeBefore(data: INonBinaryTree<T>): void;
  pushNodeAfter(data: INonBinaryTree<T>): void;
  pushChild(data: INonBinaryTree<T>): void;
  find(code: string): INonBinaryTree<T> | undefined;
  traverse<Z>(
    callback: (
      data: T | undefined,
      firstChild: Z | undefined,
      neighborChild: Z | undefined,
      key: string | undefined,
      depth: number
    ) => Z,
    params: Params
  ): Z;
  parseFromJSON(json: Traverse<T>): INonBinaryTree<T>;
}

export default class nonBinaryTree<T> implements INonBinaryTree<T> {
  private _data: T | undefined;
  private _parent: INonBinaryTree<T> | undefined;
  private _leftChild: INonBinaryTree<T> | undefined;
  private _rightSibling: INonBinaryTree<T> | undefined;
  private _leftSibling: INonBinaryTree<T> | undefined;
  private _code: string | undefined;
  constructor(
    data?: T,
    parent: INonBinaryTree<T> | undefined = undefined,
    leftChild: INonBinaryTree<T> | undefined = undefined,
    rightSibling: INonBinaryTree<T> | undefined = undefined,
    leftSibling: INonBinaryTree<T> | undefined = undefined,
    code: string | undefined = undefined
  ) {
    this._data = data;
    this._parent = parent;
    this._leftChild = leftChild;
    this._rightSibling = rightSibling;
    this._leftSibling = leftSibling;
    this._code = code === undefined ? uuidv4() : code;
  }
  set data(newData) {
    this._data = newData;
  }
  get data() {
    return this._data;
  }
  set parent(newParent) {
    this._parent = newParent;
  }
  get parent() {
    return this._parent;
  }
  set child(newChild) {
    if (newChild !== undefined) {
      newChild.parent = this;
      this._leftChild = newChild;
    } else {
      throw Error("child cannon be a null");
    }
  }
  get child() {
    return this._leftChild;
  }
  pushChild(newChild: INonBinaryTree<T>) {
    if (newChild !== undefined) {
      newChild.parent = this;
      if (this._leftChild !== undefined) {
        this._leftChild.pushRightSibling(newChild);
      } else {
        this._leftChild = newChild;
      }
    } else {
      throw Error("child cannon be a null");
    }
  }
  set rightSibling(rightSibling) {
    if (rightSibling !== undefined) {
      rightSibling.leftSibling = this;
      rightSibling.parent = this._parent;
      this._rightSibling = rightSibling;
    } else {
      throw Error("sibling cannon be a null");
    }
  }
  get rightSibling() {
    return this._rightSibling;
  }
  pushRightSibling(newNeighbour: INonBinaryTree<T>) {
    if (newNeighbour !== undefined) {
      if (this._rightSibling !== undefined) {
        this._rightSibling.pushRightSibling(newNeighbour);
      } else {
        newNeighbour.parent = this._parent;
        newNeighbour.leftSibling = this;
        this._rightSibling = newNeighbour;
      }
    } else {
      throw Error("sibling cannon be a null");
    }
  }
  set leftSibling(leftSibling) {
    if (leftSibling !== undefined) {
      leftSibling.parent = this._parent;
      this._leftSibling = leftSibling;
    } else {
      throw Error("sibling cannon be a null");
    }
  }
  get leftSibling() {
    return this._leftSibling;
  }
  get leftChild() {
    return this._leftChild;
  }
  pushNodeBefore(newNeighbour: INonBinaryTree<T>) {
    if (this._leftSibling === undefined) {
    }
  }
  pushNodeAfter(newNeighbour: INonBinaryTree<T>) {
    if (newNeighbour !== undefined) {
      newNeighbour.rightSibling = this._rightSibling;
      newNeighbour.parent = this._parent;
      newNeighbour.leftSibling = this;
      this._rightSibling = newNeighbour;
    }
  }
  find(code: string): INonBinaryTree<T> | undefined {
    if (this._code === code) {
      return this;
    }
    if (this._leftChild === undefined && this._rightSibling === undefined) {
      return undefined;
    }
    const lChild = this._leftChild?.find(code);
    const rSibling = this._rightSibling?.find(code);
    return lChild || rSibling;
  }
  removeNode() {}
  info() {
    return this._data;
  }
  set code(newCode) {
    this._code = newCode;
  }
  get code() {
    return this._code;
  }
  traverse<Z>(
    callback: (
      data: T | undefined,
      firstChild: Z | undefined,
      neighborChild: Z | undefined,
      key: string | undefined,
      depth: number
    ) => Z,
    params: Params = { onlyThisRoot: true, depth: 0 }
  ): Z {
    let lChild;
    let rSibling;
    if (this._leftChild !== undefined) {
      lChild = this._leftChild.traverse(callback, {
        onlyThisRoot: false,
        depth: params.depth + 1,
      });
    }
    if (this._rightSibling !== undefined && !params.onlyThisRoot) {
      rSibling = this._rightSibling.traverse(callback, {
        onlyThisRoot: false,
        depth: params.depth,
      });
    }
    return callback(this._data, lChild, rSibling, this._code, params.depth);
  }
  parseFromJSON<T>(tree: Traverse<T>) {
    return this;
  }
}

export function parseToJSON<T>(
  data: T | undefined,
  firstChild: Array<Traverse<T>> | undefined,
  neighborChild: Array<Traverse<T>> | undefined,
  key: string | undefined
): Traverse<T>[] {
  const arr: Array<Traverse<T>> =
    neighborChild !== undefined ? neighborChild : [];
  const arrChildren: Array<Traverse<T>> =
    firstChild !== undefined ? firstChild : [];
  return [
    {
      data,
      children: arrChildren,
      key,
    },
    ...arr,
  ];
}
