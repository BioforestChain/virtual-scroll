// import { css } from "lit-element";
import {
  anyToNaturalBigInt,
  anyToNaturalFloat,
  anyToFloat,
  to6eBn,
  bi6e,
} from "./helper";
import type { ScrollViewportElement } from "./scroll-viewport";
import type { VirtualListCustomItemElement } from "./virtual-list-custom-item";
import { css, LitElement, property, TemplateResult } from "lit-element";
import { VirtualListDefaultItemElement } from "./virtual-list-default-item";
import { StatefulItemCount, StateInfo } from "./stateful-item-count";

export type ScrollAnimationInfo = {
  reqFrameId: number;
  startTime: number;
  aniDuration: number;
};

export type ScrollTopOptions = {
  duration?: number;
};

export type CountState<E = unknown, L = unknown> = {
  enter: E;
  leave: L;
};

export type DefaultCountState =
  | CountState<"visible", "hidden">
  | CountState<"create", "destroy">
  | CountState<"moving", "moving">;
/**
 * virtual scroll list with fixed size.
 *
 * @slot - for custom list item
 * @slot template - for buildable item
 * @csspart scroll-up - the scroll up controller
 * @csspart scroll-up - the scroll up controller
 * @csspart virtual-list-view- the scroll item containre
 * @fires renderrangechange - when scroll, the item will need render changed
 * @attr {bigint} item-count -
 * @attr {number} item-size -
 * @attr {number} safe-area-inset-top - like padding-top
 * @attr {number} safe-area-inset-bottom - like padding-bottom
 * @attr {number} cache-render-top - will make list-view higher, for render more item. if item content overflow, you may need change this to make it render correctly
 * @attr {number} cache-render-bottom - will make list-view higher, for render more item. like {cache-render-top}
 * @method refresh() - if you change the attr directly by set property. you may need call the method
 * @prop {bigint} virtualScrollTop - change the scroll top. without animation
 */
export abstract class CommonFixedSizeListBuilder<
  T extends HTMLElement = HTMLElement,
  S extends CountState = DefaultCountState
> extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          display: block;
          width: var(--viewport-width, 100%);
          height: var(--viewport-height, 100%);
          overflow: hidden;
          position: relative;

          --controlbar-color: rgba(0, 0, 0, 0.1);
          --controlbar-bg-color: transparent;
          --controlbar-width: 4px;
        }
        :host::after {
          content: "context error";
          text-transform: uppercase;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          position: absolute;
          backdrop-filter: blur(1em) brightness(0.3);
          z-index: 10;
        }
        :host-context(scroll-viewport)::after {
          content: none;
        }

        slot[name="template"] {
          display: none;
        }
      `,
    ];
  }
  protected _style = document.createElement("style");
  performUpdate() {
    const res = super.performUpdate();
    this.renderRoot.appendChild(this._style);
    return res;
  }

  _debug_ = false;
  constructor() {
    super();

    /// bind custom events
    this.addEventListener("renderrangechange", (event) => {
      this._onrenderrangechange?.(event as RenderRangeChangeEvent<T, S>);
    });
    this.__initInTouch();
  }

  protected _intouch = false;
  private __initInTouch() {
    for (const en of ["touchstart", "mousedown"]) {
      this.addEventListener(
        en,
        () => {
          this._debug_ && console.log(en);
          this._intouch = true;
        },
        { passive: true }
      );
    }
    for (const en of ["touchcancel", "touchend", "mouseup"]) {
      this.addEventListener(
        en,
        () => {
          this._debug_ && console.log(en);
          this._intouch = false;
        },
        { passive: true }
      );
    }
  }

  abstract render(): TemplateResult;

  //#region ???????????????

  protected _tplEle?: Element;
  protected _templateFactory?: () => VirtualListDefaultItemElement<T>;

  protected abstract _getTemplateElement(): Element | undefined;
  protected _resetTemplateFactory = async () => {
    await this.updateComplete;
    const tplEle = this._getTemplateElement();
    if (this._tplEle === tplEle) {
      return;
    }
    this._tplEle = tplEle;

    if (!tplEle) {
      this._templateFactory = undefined;
    } else {
      this._templateFactory = () => {
        const ele = tplEle.cloneNode(true) as T;
        ele.removeAttribute("slot");
        const wrapper = new VirtualListDefaultItemElement(ele);
        wrapper.appendChild(ele);
        wrapper.setAttribute("slot", "item");
        return wrapper;
      };
    }
    /// ????????????????????????
    this.refresh();
  };
  protected _ob = new MutationObserver(this._resetTemplateFactory);
  //#endregion

  //#region bind parent view port

  protected _viewPort: ScrollViewportElement | null = null;

  public get viewPort(): ScrollViewportElement | null {
    return this._viewPort;
  }
  public set viewPort(value: ScrollViewportElement | null) {
    const oldViewPort = this._viewPort;
    if (oldViewPort) {
      oldViewPort.removeEventListener(
        "viewportreisze",
        this._requestRenderAni0
      );
    }
    if ((this._viewPort = value)) {
      value.addEventListener("viewportreisze", this._requestRenderAni0);
      this.requestRenderAni();
    } else {
      this._destroyItems();
    }
  }
  //#endregion
  //#region native lifecycle

  connectedCallback() {
    super.connectedCallback();

    const viewPort = (this.viewPort = this.closest("scroll-viewport"));
    if (viewPort !== this.parentElement) {
      console.warn(
        `<${this.tagName.toLowerCase()}> should be children of <scroll-viewport>`
      );
    }
    if (!viewPort) {
      console.error(
        `<${this.tagName.toLowerCase()}> should be children of <scroll-viewport>`
      );
    }

    this._ob.observe(this, { childList: true });
    this._resetTemplateFactory();
  }
  disconnectedCallback() {
    super.disconnectedCallback();

    this.viewPort = null;
    this._ob.disconnect();
  }
  adoptedCallback() {
    this.viewPort = this.closest("scroll-viewport");
  }
  //#endregion

  //#region attr & prop

  protected _onrenderrangechange?: RenderRangeChangeHanlder<T, S>;
  @property({ attribute: "onrenderrangechange" })
  public get onrenderrangechange(): null | RenderRangeChangeHanlder<T, S> {
    return this._onrenderrangechange || null;
  }
  public set onrenderrangechange(
    value: undefined | null | string | RenderRangeChangeHanlder<T, S>
  ) {
    if (typeof value === "string") {
      value = Function(
        "event",
        `(${value})&&event.preventDefault()`
      ) as RenderRangeChangeHanlder<T, S>;
    }
    if (typeof value !== "function") {
      value = undefined;
    }
    this._onrenderrangechange = value;
  }
  @property({ attribute: "item-count" })
  public get itemCount(): bigint {
    return this._itemCountStateManager.itemCount;
  }
  public set itemCount(value: unknown) {
    const newVal = anyToNaturalBigInt(value);
    const state = this._itemCountStateManager;
    if (newVal !== state.itemCount) {
      if (newVal > state.itemCount) {
        state.push(newVal - state.itemCount);
      } else {
        state.pop(state.itemCount - newVal);
      }
    }
  }
  private _itemCountStateManager = new StatefulItemCount(
    (value: bigint) => {
      this.setAttribute("item-count", value.toString());
      this._setStyle();
    },
    { enter: "visible", leave: "hidden" } as S,
    { enter: "create", leave: "destroy" } as S,
    { enter: "moving", leave: "moving" } as S
  );
  get itemCountStateManager() {
    return this._itemCountStateManager;
  }

  static customItemCountStateManager<
    ES extends CountState,
    ELE extends HTMLElement
    // VL extends CommonFixedSizeListBuilder
  >(
    vl: CommonFixedSizeListBuilder<ELE>,
    customStateInfoGetter?: (index: bigint) => StateInfo<ES>
  ) {
    // type ELE = VL extends CommonFixedSizeListBuilder<infer ELE> ? ELE : never;
    type NEW_STATE = DefaultCountState | ES;
    const newVL = vl as unknown as CommonFixedSizeListBuilder<ELE, NEW_STATE>;
    const oldItemCountStateManager = newVL._itemCountStateManager;
    oldItemCountStateManager._customStateInfoGetter = customStateInfoGetter;
    return newVL;
  }

  private _itemSize = 0;
  @property({ attribute: "item-size" })
  public get itemSize(): number {
    return this._itemSize;
  }
  public set itemSize(value: unknown) {
    this._itemSize = anyToNaturalFloat(value);
    this._setStyle();
  }
  //#endregion

  protected _ctrlScrollPanelHeight = 0;
  protected _totalScrollHeight6e = 0n;
  protected _setStyle() {
    this._totalScrollHeight6e = this.itemCount * to6eBn(this.itemSize);
    this._ctrlScrollPanelHeight = Math.min(
      window.screen.availHeight +
        (this.viewPort?.viewportHeight || window.screen.availHeight),
      Number(this._totalScrollHeight6e) / 1e6
    );

    this._style.innerHTML = `:host {
        --item-size: ${this.itemSize}px;
        --item-count: ${this.itemCount};
        --ctrl-scroll-panel-height: ${this._ctrlScrollPanelHeight}px;
        --cache-render-top: ${this.cacheRenderTop}px;
        --cache-render-bottom: ${this.cacheRenderBottom}px;
    }`;
    this.SAFE_RENDER_TOP_6E = to6eBn(this.safeAreaInsetTop);
    this.MAX_VIRTUAL_SCROLL_HEIGHT_6E =
      to6eBn(this.itemSize) * this.itemCount +
      to6eBn(this.safeAreaInsetBottom) +
      this.SAFE_RENDER_TOP_6E;

    this.requestRenderAni();
  }
  protected _scrollProgress = 0;
  public get scrollProgress() {
    return this._scrollProgress;
  }
  public set scrollProgress(value) {
    this._scrollProgress = value;
    this.MAX_VIRTUAL_SCROLL_HEIGHT_6E;
    // this.virtualScrollTop = this.total
    // this.style.setProperty("--scroll-progress", value.toFixed(6));
  }
  // scrollProcess = 0;
  protected _pre_rangechange_event_collection?: Map<
    bigint,
    RenderRangeChangeEntry<T, S>
  >;
  protected _rangechange_event?: {
    time: number;
    collection: Map<bigint, RenderRangeChangeEntry<T, S>>;
    emitter: () => RenderRangeChangeDetail<T> | undefined;
  };

  protected _stateInfoListEqual = <
    T extends CountStateLeaveInfo<S>[] | CountStateEnterInfo<S>[]
  >(
    arr1: T,
    arr2: T
  ): boolean => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; ++i) {
      if (arr1[i]!.id !== arr2[i]!.id) {
        return false;
      }
    }
    return true;
  };

  /**???????????????????????? */
  protected _collectionRanderItem(
    item: RenderRangeChangeEntry<T, S>,
    time: number
  ) {
    this._debug_ &&
      console.log("collection maybe change", item.index, item.stateInfoList);
    if (!this._rangechange_event) {
      this._rangechange_event = {
        collection: new Map(),
        time,
        emitter: () => {
          if (this._rangechange_event !== rangechange_event) {
            return;
          }
          this._rangechange_event = undefined;
          const preCollection = this._pre_rangechange_event_collection;
          this._pre_rangechange_event_collection = collection;

          const sortedEntries = [...collection.values()].sort((a, b) =>
            a.index - b.index > 0n ? 1 : -1
          );

          const diffedEntries = preCollection
            ? sortedEntries.filter((entry) => {
                const preEnrty = preCollection.get(entry.index);
                return !(
                  preEnrty &&
                  preEnrty.isIntersecting === entry.isIntersecting &&
                  this._stateInfoListEqual(
                    preEnrty.stateInfoList,
                    entry.stateInfoList
                  ) &&
                  preEnrty.node === entry.node
                );
              })
            : sortedEntries;

          if (diffedEntries.length === 0) {
            return;
          }

          const info: RenderRangeChangeDetail<T> = {
            entries: diffedEntries,
            time: rangechange_event.time,
          };
          return info;
        },
      };
      const rangechange_event = this._rangechange_event;
      const collection = this._rangechange_event.collection;
      queueMicrotask(rangechange_event.emitter);
    }
    this._rangechange_event.collection.set(item.index, item);
    this._rangechange_event.time = time;
  }

  private _preCompletedUpdate?: Promise<unknown>;
  protected _emitRenderRangeChange() {
    if (!this._rangechange_event) {
      return;
    }
    const rangechange_event = this._rangechange_event;
    const info = rangechange_event.emitter();
    if (!info) {
      return;
    }
    this._debug_ && console.log("emit changes", info);
    const { updateComplete } = this;
    if (this._preCompletedUpdate !== updateComplete) {
      updateComplete.then(() => {
        this._preCompletedUpdate = updateComplete;
        this.__emitRenderRangeChange(info);
      });
    } else {
      this.__emitRenderRangeChange(info);
    }
  }

  private __emitRenderRangeChange(
    info: RenderRangeChangeDetail<T, CountState>
  ) {
    const event = new RenderRangeChangeEvent("renderrangechange", {
      detail: info,
      cancelable: true,
      bubbles: false,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  protected _ani?: ScrollAnimationInfo;
  protected _DEFAULT_ANI_DURACTION = 500; // ???????????????????????????????????????????????? 1s ?????????
  private _requestRenderAni0 = () => this.requestRenderAni(0);
  readonly requestRenderAni = (duration = 0) => {
    let now: number;
    /// ????????????????????????????????????????????????????????????????????????
    if (this._intouch) {
      now = performance.now();
    } else {
      now = this._ani ? this._ani.startTime : performance.now();
    }
    this._requestRenderAni(now, false, duration);
  };
  protected _requestRenderAni = (
    now: number,
    force: boolean,
    duration: number
  ) => {
    if (this._ani === undefined || force) {
      const ani =
        this._ani ||
        (this._ani = {
          reqFrameId: 0,
          aniDuration: duration || 0, // this._DEFAULT_ANI_DURACTION,
          startTime: now,
        });

      this._itemCountStateManager.clearState(now);

      ani.reqFrameId = requestAnimationFrame(() => {
        const now = performance.now();
        if (ani.startTime + ani.aniDuration > now) {
          this._requestRenderAni(now, true, 0);
        } else {
          this._ani = undefined;
          this._clearAniState();
        }
        // ?????????????????????_requestRenderAni?????????????????????????????????????????? _renderItems ?????????????????????
        this._renderItems(now, ani);
      });
    } else {
      if (duration) {
        if (this._ani.aniDuration + this._ani.startTime < duration + now) {
          this._ani.aniDuration = duration;
        }
      }
      this._ani.startTime = now;
    }
  };
  /**???????????????????????????????????????????????? */
  protected abstract _clearAniState(): unknown;

  protected _stretchScrollDuration = (scrollDiff: number) => {
    const scrollScale =
      (1 + (Math.abs(scrollDiff) * 10) / this._ctrlScrollPanelHeight) ** 2;
    return this._DEFAULT_ANI_DURACTION * scrollScale;
  };
  protected _dampingScrollDiff = (now: number, ani: ScrollAnimationInfo) => {
    const progress =
      ani.aniDuration === 0 ? 1 : (now - ani.startTime) / ani.aniDuration;
    if (progress <= 0) {
      return { progress: 0, forward: 1, backward: 0 };
    }
    if (progress >= 1) {
      return { progress: 1, forward: 0, backward: 1 };
    }
    const backward = this._dampingTimingFunction(progress);
    return { progress, forward: 1 - backward, backward: 1 };
  };
  protected _dampingTimingFunction = function easeOutCirc(x: number): number {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
  };

  /**
   * ??????????????????1e6?????????
   */
  protected virtualScrollTop6e = 0n;
  get virtualScrollTop(): bigint {
    return this.virtualScrollTop6e / bi6e;
  }
  set virtualScrollTop(v: string | number | bigint) {
    if (typeof v === "string") {
      v = +v;
    }
    if (typeof v === "number") {
      this.virtualScrollTop6e = to6eBn(v);
    } else {
      this.virtualScrollTop6e = v * bi6e;
    }
    this.requestRenderAni();
  }
  protected SAFE_RENDER_TOP_6E = 0n;
  protected MAX_VIRTUAL_SCROLL_HEIGHT_6E = 0n;
  get virtualScrollHeight() {
    return this.MAX_VIRTUAL_SCROLL_HEIGHT_6E / bi6e;
  }

  virtualScrollTo(top: unknown, opts: ScrollTopOptions = {}) {
    const virtualScrollTop6e = to6eBn(anyToFloat(top));
    const fromScrollTop6e = this.virtualScrollTop6e;
    const toScrollTop6e = virtualScrollTop6e;
    const diffScrollTop6e = fromScrollTop6e - toScrollTop6e;
    const duration =
      opts.duration ??
      Math.min(
        Math.max(0, Math.log2(Math.abs(Number(-diffScrollTop6e / bi6e)))),
        50
      ) * 50;

    if (duration === 0) {
      this.virtualScrollTop6e = virtualScrollTop6e;
      this.requestRenderAni();
      return;
    }
    const ani: ScrollAnimationInfo = {
      reqFrameId: 0,
      startTime: performance.now(),
      aniDuration: duration,
    };
    const doAni = () => {
      const { progress, forward } = this._dampingScrollDiff(
        performance.now(),
        ani
      );

      const virtualDiffScrollTop6e = (diffScrollTop6e * to6eBn(forward)) / bi6e;
      this.virtualScrollTop6e = virtualDiffScrollTop6e;
      this.requestRenderAni();
      if (progress === 1) {
        return;
      }
      ani.reqFrameId = requestAnimationFrame(doAni);
    };
    doAni();
  }

  protected _cacheRenderTop?: number;
  @property({ attribute: "cache-render-top" })
  public get cacheRenderTop(): number {
    return this._cacheRenderTop ?? this.itemSize / 2;
  }
  public set cacheRenderTop(value: unknown) {
    this._cacheRenderTop = anyToFloat(value);
    this._setStyle();
  }
  protected _cacheRenderBottom?: number;
  @property({ attribute: "cache-render-bottom" })
  public get cacheRenderBottom(): number {
    return this._cacheRenderBottom ?? this.itemSize / 2;
  }
  public set cacheRenderBottom(value: unknown) {
    this._cacheRenderBottom = anyToFloat(value);
    this._setStyle();
  }

  /**?????????????????? */
  protected abstract _renderItems(
    now: number,
    ani: ScrollAnimationInfo
  ): unknown;

  private _safeAreaInsetTop = 0;
  @property({ attribute: "safe-area-inset-top" })
  public get safeAreaInsetTop(): number {
    return this._safeAreaInsetTop;
  }
  public set safeAreaInsetTop(value: unknown) {
    this._safeAreaInsetTop = anyToFloat(value);
    this._setStyle();
  }
  private _safeAreaInsetBottom = 0;
  @property({ attribute: "safe-area-inset-bottom" })
  public get safeAreaInsetBottom() {
    return this._safeAreaInsetBottom;
  }
  public set safeAreaInsetBottom(value) {
    this._safeAreaInsetBottom = anyToFloat(value);
    this._setStyle();
  }
  protected _doScroll(scrollDiff: number, now: number) {
    const scrollCtrlHeight = this.viewPort!.viewportHeight;
    const virtualListViewHeight =
      scrollCtrlHeight + this.cacheRenderBottom + this.cacheRenderTop;
    const virtualListViewHeight6e = to6eBn(virtualListViewHeight);

    /// ??????virtualScrollTop/virtualScrollBottom
    let virtualScrollTop6e = this.virtualScrollTop6e + to6eBn(scrollDiff);

    this._debug_ && console.log("virtualScrollTop6e", virtualScrollTop6e);

    const MIN_VIRTUAL_SCROLL_TOP_6E = 0n;
    const MAX_VIRTUAL_SCROLL_BOTTOM_6E = this.MAX_VIRTUAL_SCROLL_HEIGHT_6E;
    const MAX_VIRTUAL_SCROLL_TOP_6E =
      MAX_VIRTUAL_SCROLL_BOTTOM_6E - to6eBn(scrollCtrlHeight);

    if (virtualScrollTop6e < MIN_VIRTUAL_SCROLL_TOP_6E) {
      virtualScrollTop6e = MIN_VIRTUAL_SCROLL_TOP_6E;
    } else if (virtualScrollTop6e > MAX_VIRTUAL_SCROLL_TOP_6E) {
      virtualScrollTop6e = MAX_VIRTUAL_SCROLL_TOP_6E;
    }

    this.scrollProgress =
      Number((virtualScrollTop6e * 100000000n) / MAX_VIRTUAL_SCROLL_TOP_6E) /
      100000000;

    this.virtualScrollTop6e = virtualScrollTop6e;

    /// ????????????safeArea+cacheRender?????????????????????
    const cacheRenderTop6e = to6eBn(this.cacheRenderTop);
    /**???????????????viewportHeight????????????????????????????????????????????????cacheRenderTop */
    const cacheRenderScrollTop6e = virtualScrollTop6e - cacheRenderTop6e;
    /**safeArea????????????????????????????????????????????????????????????????????????scrollTop????????? */
    let renderScrollTop6e = cacheRenderScrollTop6e - this.SAFE_RENDER_TOP_6E;

    let renderScrollBottom6e = renderScrollTop6e + virtualListViewHeight6e;
    if (renderScrollBottom6e > MAX_VIRTUAL_SCROLL_BOTTOM_6E) {
      renderScrollBottom6e = MAX_VIRTUAL_SCROLL_BOTTOM_6E;
    }

    const itemSize6e = to6eBn(this.itemSize);

    let viewStartIndex = renderScrollTop6e / itemSize6e;
    if (viewStartIndex < 0n) {
      viewStartIndex = 0n;
    }
    let viewEndIndex = renderScrollBottom6e / itemSize6e;
    if (viewEndIndex >= this.itemCount) {
      viewEndIndex = this.itemCount - 1n;
    }
    /**???????????? */
    const koordinatenverschiebung =
      Number(renderScrollTop6e - viewStartIndex * itemSize6e) / 1e6;

    /// ???????????????
    const rms = new Set<VirtualListDefaultItemElement<T>>();
    for (const [i, item] of this._inViewItems) {
      if (i < viewStartIndex || i > viewEndIndex) {
        this._collectionRanderItem(
          {
            index: i,
            node: item,
            stateInfoList: this._itemCountStateManager
              .getStateInfoListByIndex(i)
              .map((stateInfo) => ({
                id: stateInfo.id,
                state: stateInfo.state.leave,
                endTime: stateInfo.endTime,
              })),
            isIntersecting: false,
          },
          now
        );
        this._inViewItems.delete(i);
        this._pool.push(item);
        rms.add(item);
      }
    }

    /// ???????????????
    for (let index = viewStartIndex; index <= viewEndIndex; index++) {
      let node = this._inViewItems.get(index);

      if (!node) {
        node = this._pool.pop();
        this._inViewItems.set(index, node);
        if (rms.delete(node) === false && node.parentElement !== this) {
          this.appendChild(node);
        }
      }
      /// ????????????
      this._collectionRanderItem(
        {
          index,
          node,
          stateInfoList: this._itemCountStateManager
            .getStateInfoListByIndex(index)
            .map((stateInfo) => ({
              id: stateInfo.id,
              state: stateInfo.state.enter,
              endTime: stateInfo.endTime,
            })),
          isIntersecting: true,
        },
        now
      );

      /// ???????????????
      node.virtualTransformTop =
        Number(index - viewStartIndex) * this.itemSize -
        koordinatenverschiebung;
      node.virtualVisible = true;
      node.virtualIndex = Number(index - viewStartIndex);
    }

    /// ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    if (rms.size > 1) {
      for (const node of rms) {
        this.removeChild(node);
      }
    } else {
      for (const node of rms) {
        node.virtualVisible = false;
      }
    }

    /// ????????????????????????????????????
    const cacheRenderScrollBottom6e =
      cacheRenderScrollTop6e + virtualListViewHeight6e;
    for (const customScrollEle of this.querySelectorAll<VirtualListCustomItemElement>(
      ":scope > virtual-list-custom-item"
    )) {
      const top6e = customScrollEle.virtualPositionTop * bi6e;
      const itemSize6e = to6eBn(customScrollEle.itemSize);
      const bottom6e = top6e + itemSize6e;

      if (
        bottom6e < cacheRenderScrollTop6e ||
        top6e > cacheRenderScrollBottom6e
      ) {
        customScrollEle.virtualVisible = false;
      } else {
        customScrollEle.virtualVisible = true;
        customScrollEle.virtualTransformTop = Number(
          (top6e + cacheRenderTop6e - virtualScrollTop6e) / bi6e
        );
      }
      // console.log(customScrollEle);
    }

    return {
      virtualScrollTop6e,
      MIN_VIRTUAL_SCROLL_TOP_6E,
      MAX_VIRTUAL_SCROLL_TOP_6E,
    };
  }
  /**?????????????????? */
  protected _destroyItems() {
    const now = performance.now();
    for (const [i, item] of this._inViewItems) {
      this._collectionRanderItem(
        {
          index: i,
          node: item,
          stateInfoList: [
            {
              id: this._itemCountStateManager.uniqueStateId,
              state: this._itemCountStateManager.operateState.leave,
              endTime: 0,
            },
          ],
          isIntersecting: false,
        },
        now
      );
      this._inViewItems.delete(i);
      this._pool.push(item);
      this.removeChild(item);
    }
  }
  protected _inViewItems = new Map<
    /* index: */ bigint,
    VirtualListDefaultItemElement<T>
  >();
  protected _pool = new ItemPool(() => {
    if (!this._templateFactory) {
      throw new Error("no found template slot");
    }
    return this._templateFactory();
  });
  /**?????????????????? */
  refresh() {
    this._destroyItems();
    for (const ele of this._pool.clear()) {
      ele.remove();
    }
    this._setStyle();
  }
}

export class ItemPool<T> {
  constructor(protected _builder: () => T) {}
  protected _pool: T[] = [];
  pop() {
    return this._pool.pop() || this._builder();
  }
  push(item: T) {
    this._pool.push(item);
  }
  clear() {
    const pool = this._pool;
    this._pool = [];
    return pool;
  }
}

export interface CountStateEnterInfo<S extends CountState = CountState>
  extends StateInfo<S["enter"]> {}

export interface CountStateLeaveInfo<S extends CountState = CountState>
  extends StateInfo<S["leave"]> {}

export type RenderRangeChangeEntry<
  T extends HTMLElement = HTMLElement,
  S extends CountState = CountState
> =
  | {
      node: VirtualListDefaultItemElement<T>;
      index: bigint;
      stateInfoList: CountStateEnterInfo<S>[];
      isIntersecting: true;
    }
  | {
      node: VirtualListDefaultItemElement<T>;
      index: bigint;
      stateInfoList: CountStateLeaveInfo<S>[];
      isIntersecting: false;
    };
export interface RenderRangeChangeDetail<
  T extends HTMLElement = HTMLElement,
  S extends CountState = CountState
> {
  entries: RenderRangeChangeEntry<T, S>[];
  time: number;
}

export class RenderRangeChangeEvent<
  T extends HTMLElement = HTMLElement,
  S extends CountState = CountState
> extends CustomEvent<RenderRangeChangeDetail<T, S>> {
  target!: CommonFixedSizeListBuilder<T, S>;
}

type RenderRangeChangeHanlder<
  T extends HTMLElement = HTMLElement,
  S extends CountState = CountState
> = (event: RenderRangeChangeEvent<T, S>) => unknown;

declare global {
  interface HTMLFixedSizeVirtualListElementEventMap<
    T extends HTMLElement,
    S extends CountState
  > extends HTMLElementEventMap,
      WindowEventHandlersEventMap {
    renderrangechange: import("./common-fixed-size-virtual-list-builder").RenderRangeChangeEvent<
      T,
      S
    >;
  }
}
