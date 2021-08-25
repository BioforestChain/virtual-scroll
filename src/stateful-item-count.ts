export type StateRange<S> = {
  startIndex: bigint;
  endIndex: bigint;
  status: S;
  endTime: number;
};

export type SetStateOptions<S> = {
  status?: S;
  duration?: number;
};

export class StatefulItemCount<S> {
  constructor(
    public readonly onItemCountChanged: (itemCount: bigint) => unknown,
    public readonly defaultState: S,
    public readonly operateState: S
  ) {}
  private _itemCount = 0n;
  public get itemCount() {
    return this._itemCount;
  }
  public set itemCount(value) {
    this._itemCount = value;
    this.onItemCountChanged(value);
  }

  private _stateRangeList: StateRange<S>[] = [];
  getStateByIndex(index: bigint) {
    for (const range of this._stateRangeList) {
      if (range.startIndex <= index && index <= range.endIndex) {
        return range.status;
      }
    }
    return this.defaultState;
  }
  //#region 标记

  setState(
    startIndex: bigint,
    endIndex: bigint,
    opts: SetStateOptions<S> = {}
  ) {
    /// 因为是插入元素到末尾，不会对其它顺序产生影响，所以不需要对其它range进行改变
    const statusRange: StateRange<S> = {
      startIndex,
      endIndex,
      status: opts.status || this.operateState,
      endTime: opts.duration ? performance.now() + opts.duration : 0,
    };
    this._stateRangeList.unshift(statusRange);
    return statusRange;
  }

  clearState(now: number) {
    this._stateRangeList = this._stateRangeList.filter((range) => {
      range.endTime <= now;
    });
  }

  //#endregion

  //#region 添加
  private _checkCount(count: bigint) {
    if (count <= 0n) {
      throw new RangeError("count less then or equal to zero");
    }
  }
  /**插入元素到末尾 */
  push(count: bigint, opts: SetStateOptions<S> = {}) {
    this._checkCount(count);

    const startIndex = this.itemCount;
    const endIndex = startIndex + count - 1n;

    /// 因为是插入元素到末尾，不会对其它顺序产生影响，所以不需要对其它range进行改变
    const state = this.setState(startIndex, endIndex, opts);
    this.itemCount += count;
    return state;
  }
  unshift(count: bigint, opts: SetStateOptions<S> = {}) {
    this._checkCount(count);

    const startIndex = 0n;
    const endIndex = count;

    /// 因为是插入元素到开头，会对其它所有顺序产生影响，所以需要对其它range进行改变
    for (const range of this._stateRangeList) {
      range.startIndex += count;
      range.endIndex += count;
    }
    const state = this.setState(startIndex, endIndex, opts);
    this.itemCount += count;
    return state;
  }
  insertBefore(
    count: bigint,
    refIndex?: bigint,
    opts: SetStateOptions<S> = {}
  ) {
    this._checkCount(count);
    if (refIndex === undefined || refIndex >= this.itemCount) {
      return this.push(count, opts);
    }

    let endIndex = refIndex + count - 1n;
    if (endIndex < 0n) {
      throw new RangeError(`no items for insert ${count} before ${refIndex}`);
    }
    let startIndex = refIndex;
    if (startIndex < 0n) {
      startIndex = 0n;
      return this.unshift(endIndex + 1n, opts);
    }

    /// 因为是插入元素到队列中，所以要对所有status进行同样的删除操作
    for (const range of this._stateRangeList) {
      /// 该范围被完全往后推
      if (range.startIndex >= refIndex) {
        range.startIndex += count;
        range.endIndex += count;
      }
      /// 该范围被切割成两份了，但是因为覆盖的关系，所以仍然可以只用一个range来表示
      else if (range.startIndex < refIndex && range.endIndex <= refIndex) {
        range.endIndex += refIndex - range.startIndex;
      }
    }

    const state = this.setState(startIndex, endIndex, opts);
    this.itemCount += count;
    return state;
  }
  //#endregion

  //#region 删除

  /**删除末尾元素 */
  pop(count: bigint) {
    this._checkCount(count);
    /// 全删
    if (count >= this.itemCount) {
      this._stateRangeList.length = 0;
      this.itemCount = 0n;
      return;
    }

    this.itemCount -= count;

    /// 因为是删除元素，所以要对所有status进行同样的删除操作
    const lastIndex = this.itemCount - 1n;
    const removes = new Set<StateRange<S>>();
    for (const range of this._stateRangeList) {
      if (range.endIndex > lastIndex) {
        range.endIndex = lastIndex;
        if (range.endIndex > range.startIndex) {
          removes.add(range);
        }
      }
    }
    if (removes.size > 0) {
      this._stateRangeList = this._stateRangeList.filter(
        (range) => !removes.has(range)
      );
    }
  }
  shift(count: bigint) {
    this._checkCount(count);

    /// 全删
    if (count >= this.itemCount) {
      this._stateRangeList.length = 0;
      this.itemCount = 0n;
      return;
    }
    this.itemCount -= count;

    /// 因为是删除元素，所以要对所有status进行同样的删除操作
    const removes = new Set<StateRange<S>>();
    for (const range of this._stateRangeList) {
      range.endIndex -= count;
      if (range.endIndex < 0n) {
        removes.add(range);
      } else {
        range.startIndex -= count;
        if (range.startIndex < 0n) {
          range.startIndex = 0n;
        }
      }
    }
    if (removes.size > 0) {
      this._stateRangeList = this._stateRangeList.filter(
        (range) => !removes.has(range)
      );
    }
  }

  deleteAfter(count: bigint, refIndex?: bigint) {
    this._checkCount(count);
    if (refIndex === undefined) {
      return this.pop(count);
    }
    if (refIndex < 0n) {
      return this.shift(count + refIndex + 1n);
    }

    const lastIndex = this.itemCount - refIndex;
    const deletableCount = lastIndex - 1n;
    if (deletableCount === 0n) {
      throw new RangeError(`no deletable count after index:${refIndex}`);
    }
    if (count > deletableCount) {
      return this.pop(deletableCount);
    }

    /// 因为是删除元素，所以要对所有status进行同样的删除操作
    const removes = new Set<StateRange<S>>();
    for (const range of this._stateRangeList) {
      if (range.endIndex > refIndex) {
        if (range.startIndex < refIndex) {
          range.endIndex -= refIndex - range.startIndex;
        } else {
          range.endIndex -= count;
          if (range.endIndex < 0n) {
            removes.add(range);
          } else {
            range.startIndex -= count;
            if (range.startIndex < 0n) {
              range.startIndex = 0n;
            }
          }
        }
      }
    }
    if (removes.size > 0) {
      this._stateRangeList = this._stateRangeList.filter(
        (range) => !removes.has(range)
      );
    }
  }
  //#endregion
}
