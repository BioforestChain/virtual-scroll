export interface StateRange<S> extends StateInfo<S> {
  startIndex: bigint;
  endIndex: bigint;
}

export type SetStateOptions<S> = {
  state?: S;
  duration?: number;
};

export interface StateInfo<S> {
  state: S;
  endTime: number;
  id: number | string;
}

export class StatefulItemCount<S> {
  /**
   * defaultState === 0
   */
  private _stateIdAcc = 1;
  get uniqueStateId() {
    return this._stateIdAcc++;
  }
  constructor(
    public readonly onItemCountChanged: (itemCount: bigint) => unknown,
    public readonly defaultState: S,
    public readonly operateState: S,
    /**添加元素会导致移动的发生，但这里移动是单向的，因为index:0是锚定，所以只有可能是往更高的index进行移动。
     * 而删除元素虽然在逻辑上也会发生移动，但与添加不同的是，添加后的元素处于列表中，所以它有权被标记state信息；
     * 而删除掉的元素没法存储state，所以是瞬发状态，这里统一不标记。
     *
     * 如果是删除元素的动画，首先应该标记存在的元素为将要删除，此时元素还在队列中，随着动画的推移，动画结束时，才会正式执行元素删除。
     * 所以删除元素的动画并不是瞬发，而是有一个过程。
     */
    public readonly movementState: S,
    public _customStateInfoGetter?: (index: bigint) => StateInfo<S>
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
  getStateInfoListByIndex(index: bigint) {
    const stateInfoList: StateInfo<S>[] = [];
    for (const range of this._stateRangeList) {
      if (range.startIndex <= index && index <= range.endIndex) {
        stateInfoList.push({
          id: range.id,
          state: range.state,
          endTime: range.endTime,
        });
      }
    }
    stateInfoList.push({
      id: 0,
      state: this.defaultState,
      endTime: Infinity,
    });
    if (this._customStateInfoGetter) {
      stateInfoList.push(this._customStateInfoGetter(index));
    }
    return stateInfoList;
  }
  //#region 标记

  setState(
    startIndex: bigint,
    endIndex: bigint,
    opts: SetStateOptions<S> = {}
  ) {
    /// 因为是插入元素到末尾，不会对其它顺序产生影响，所以不需要对其它range进行改变
    const stateRange: StateRange<S> = {
      id: this.uniqueStateId,
      startIndex,
      endIndex,
      state: opts.state || this.operateState,
      endTime: opts.duration ? performance.now() + opts.duration : 0,
    };
    this._stateRangeList.unshift(stateRange);
    return stateRange;
  }

  clearState(now: number) {
    this._stateRangeList = this._stateRangeList.filter(
      (range) => range.endTime > now
    );
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
    this.setState(startIndex, endIndex, opts);
    return (this.itemCount += count);
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
    this.setState(startIndex, endIndex, opts);
    if (this.itemCount !== 0n) {
      // 将后面的元素进行向后偏移
      this.setState(endIndex + 1n, this.itemCount + count - 1n, {
        ...opts,
        state: this.movementState,
      });
    }
    return (this.itemCount += count);
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

    /// 因为是插入元素到队列中，所以要对所有state进行同样的删除操作
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

    this.setState(startIndex, endIndex, opts);
    // 将后面的元素进行向后偏移
    this.setState(endIndex + 1n, this.itemCount + count - 1n, {
      ...opts,
      state: this.movementState,
    });

    return (this.itemCount += count);
  }
  //#endregion

  //#region 删除

  /**删除末尾元素 */
  pop(count: bigint) {
    this._checkCount(count);
    /// 全删
    if (count >= this.itemCount) {
      this._stateRangeList.length = 0;
      return (this.itemCount = 0n);
    }

    /// 因为是删除元素，所以要对所有state进行同样的删除操作
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

    return (this.itemCount -= count);
  }
  shift(count: bigint) {
    this._checkCount(count);

    /// 全删
    if (count >= this.itemCount) {
      this._stateRangeList.length = 0;
      return (this.itemCount = 0n);
    }

    /// 因为是删除元素，所以要对所有state进行同样的删除操作
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

    return (this.itemCount -= count);
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

    /// 因为是删除元素，所以要对所有state进行同样的删除操作
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
    return (this.itemCount -= count);
  }
  //#endregion
}
