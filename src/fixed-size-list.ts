// import { css } from "lit-element";
import type { ScrollViewportElement } from "./scroll-viewport";

const hostStyle = document.createElement("style");
hostStyle.innerHTML = `
  :host {
    display: block;
    height: var(--viewport-height);
    overflow: hidden;
    position: relative;
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }

  slot[name="template"] {
    display: none;
  }
  :host > #scroll-ctrl {
    height: 100%;
    width: 100%;

    position: absolute;
    top: 0;
    z-index: 1;
  }
  :host > #scroll-ctrl .scroll-dir .top,
  :host > #scroll-ctrl .scroll-dir .bottom {
    content: " ";
    display: block;
    visibility: hidden;
    height: var(--ctrl-scroll-panel-height);
  }
  :host > #scroll-ctrl .scroll-dir .center {
    scroll-snap-align: center;
    height: 0;
  }
  :host > #scroll-ctrl .scroll-dir {
    height: 100%;
    scroll-snap-type: y mandatory;
    overflow: overlay;
  }
  :host > #scroll-ctrl .scroll-dir.unscroll {
    overflow: hidden;
  }
  :host > #scroll-ctrl #scroll-down {
    position: sticky;
    left: 0;
    top: 0;
  }
  :host > #scroll-ctrl #virtual-list-view-wrapper {
    height: 0;

    position: sticky;
    top: 0;
    transform: translateY(calc(var(--cache-render-top) * -1));
    z-index: 1;
  }
  :host > #scroll-ctrl #virtual-list-view {
    height: calc(
      var(--viewport-height) + var(--cache-render-top) +
        var(--cache-render-bottom)
    );
    width: 100%;

    overflow: hidden;
    contain: strict;
    transform: translate3d(0, 0, 0);
  }
  :host > #scroll-ctrl .scroll-dir::-webkit-scrollbar {
    width: 4px;
    background-color: transparent;
  }
  :host > #scroll-ctrl .scroll-dir::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.3);
    border-radius: 2px;
  }

  ::slotted(*) {
    position: absolute;
    top: 0;
    transform: var(--virtual-transform) !important;
    display: var(--virtual-display) !important;
    will-change: transform;
    --virtual-display: block;
    width: 100%;
  }
`;
const fixedSizeListTemplate = document.createElement("template");
fixedSizeListTemplate.innerHTML = `
  <slot name="template"></slot>
  <div id="scroll-ctrl" part="scroll-ctrl">
    <div id="scroll-up" class="scroll-dir">
      <div id="scroll-down" class="scroll-dir">
        <div id="virtual-list-view-wrapper">
          <div id="virtual-list-view" part="virtual-list-view">
            <slot></slot>
            <slot name="item"></slot>
          </div>
        </div>
        <div class="center"></div>
        <div class="bottom"></div>
      </div>
      <div class="top"></div>
      <div class="center"></div>
    </div>
  </div>
`;

const observedAttributes = [
  "item-count" as const,
  "item-size" as const,
  "onrenderrangechange" as const,
  "cache-render-top" as const,
  "cache-render-bottom" as const,
  "safe-area-inset-top" as const,
  "safe-area-inset-bottom" as const,
  // "onbuilditem",
  // "ondestroyitem",
];
const anyToInt = (val: unknown) => {
  const numVal = parseInt(val + "") || 0;
  return isFinite(numVal) ? numVal : 0;
};
const anyToNaturalInt = (val: unknown) => {
  const float = anyToInt(val);
  return float < 0 ? 0 : float;
};
const anyToFloat = (val: unknown) => {
  const numVal = parseFloat(val + "") || 0;
  return isFinite(numVal) ? numVal : 0;
};
const anyToNaturalFloat = (val: unknown) => {
  const float = anyToFloat(val);
  return float < 0 ? 0 : float;
};
const anyToNaturalBigInt = (val: unknown) => {
  try {
    const numVal = BigInt(parseInt(val + "")) || 0n;
    return numVal < 0n ? 0n : numVal;
  } catch {
    return 0n;
  }
};

const to6eBn = (num: number) => {
  return BigInt(Math.floor(num * 1e6));
};

export class FixedSizeListBuilderElement<
  T extends HTMLElement = HTMLElement
> extends HTMLElement {
  static style = hostStyle;
  private _style = document.createElement("style");
  private _fragment = fixedSizeListTemplate.content.cloneNode(
    true
  ) as DocumentFragment;
  private _scrollCtrl: HTMLDivElement;
  private _scrollCtrlUp: HTMLDivElement;
  private _scrollCtrlDown: HTMLDivElement;
  private _ob: MutationObserver;
  private _dev = false;
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });
    /// 1. style
    shadowRoot.appendChild(FixedSizeListBuilderElement.style.cloneNode(true));
    shadowRoot.appendChild(this._style);

    /// 2. create content dom
    shadowRoot.appendChild(this._fragment);
    /// 3. scroll controll dom
    this._scrollCtrl = shadowRoot.querySelector(
      "#scroll-ctrl"
    ) as HTMLDivElement;
    this._scrollCtrlUp = this._scrollCtrl.querySelector(
      "#scroll-up"
    ) as HTMLDivElement;
    this._scrollCtrlDown = this._scrollCtrl.querySelector(
      "#scroll-down"
    ) as HTMLDivElement;

    /// 4. get slot=template as builder node
    const tplSlot = shadowRoot.querySelector(
      'slot[name="template"]'
    ) as HTMLSlotElement;

    const resetTemplateFactory = () => {
      const tplEles = tplSlot.assignedElements();
      const tplEle = tplEles[0];
      if (this._tplEle === tplEle) {
        return;
      }
      this._tplEle = tplEle;

      if (!tplEle) {
        this._templateFactory = undefined;
      } else {
        this._templateFactory = () => {
          const ele = tplEle.cloneNode(true) as T;
          ele.setAttribute("slot", "item");
          return ele;
        };
      }
      /// 彻底更新滚动视图
      this.refresh();
    };
    this._ob = new MutationObserver(resetTemplateFactory);
    resetTemplateFactory();

    /// 4. bind custom events
    this.addEventListener("renderrangechange", (event) => {
      this._onrenderrangechange?.(event as RenderRangeChangeEvent);
    });
    this._scrollCtrlUp.addEventListener("scroll", this.requestRenderAni);
    this._scrollCtrlDown.addEventListener("scroll", this.requestRenderAni);
    for (const en of ["touchstart", "mousedown"]) {
      this._scrollCtrl.addEventListener(en, () => {
        this._dev && console.log(en);
        this._intouch = true;
      });
    }
    for (const en of ["touchcancel", "touchend", "mouseup"]) {
      this._scrollCtrl.addEventListener(en, () => {
        this._dev && console.log(en);
        this._intouch = false;
      });
    }

    /// *. bind global
    // Reflect.set(self, "l", this);
  }
  private _viewPort: ScrollViewportElement | null = null;

  public get viewPort(): ScrollViewportElement | null {
    return this._viewPort;
  }
  public set viewPort(value: ScrollViewportElement | null) {
    const oldViewPort = this._viewPort;
    if (oldViewPort) {
      oldViewPort.removeEventListener("viewportreisze", this.requestRenderAni);
    }
    if ((this._viewPort = value)) {
      value.addEventListener("viewportreisze", this.requestRenderAni);
      this._requestRenderAni();
    } else {
      this._destroyItems();
    }
  }
  connectedCallback() {
    this.viewPort = this.closest("scroll-viewport");
    this._ob.observe(this, { childList: true });
  }
  disconnectedCallback() {
    this.viewPort = null;
    this._ob.disconnect();
  }

  adoptedCallback() {
    this.viewPort = this.closest("scroll-viewport");
  }

  static observedAttributes = observedAttributes;

  /// 自定义事件 destroyitem
  private _onrenderrangechange?: RenderRangeChangeHanlder;
  public get onrenderrangechange(): null | RenderRangeChangeHanlder {
    return this._onrenderrangechange || null;
  }
  public set onrenderrangechange(value: null | RenderRangeChangeHanlder) {
    this._onrenderrangechange = value || undefined;
  }

  public itemCount = 0n;
  public itemSize = 0;

  private _tplEle?: Element;
  private _templateFactory?: () => T;

  attributeChangedCallback(
    name: typeof observedAttributes[0],
    _oldValue: unknown,
    newValue: unknown
  ) {
    if (name === "item-count") {
      this.itemCount = anyToNaturalBigInt(newValue);
      this._setStyle();
    } else if (name === "item-size") {
      this.itemSize = anyToNaturalFloat(newValue);
      this._setStyle();
    } else if (name === "onrenderrangechange") {
      if (newValue) {
        this.onrenderrangechange = Function(
          "event",
          `(${newValue})&&event.preventDefault()`
        ) as never;
      } else {
        this.onrenderrangechange = null;
      }
    } else if (name === "cache-render-top") {
      this.cacheRenderTop = anyToFloat(newValue);
      this._setStyle();
    } else if (name === "cache-render-bottom") {
      this.cacheRenderBottom = anyToFloat(newValue);
      this._setStyle();
    } else if (name === "safe-area-inset-top") {
      this.safeAreaInsetTop = anyToFloat(newValue);
      this._setStyle();
    } else if (name === "safe-area-inset-bottom") {
      this.safeAreaInsetBottom = anyToFloat(newValue);
      this._setStyle();
    }
  }
  private _ctrlScrollPanelHeight = 0;
  private _totalScrollHeight6e = 0n;
  private _setStyle() {
    this._totalScrollHeight6e = this.itemCount * to6eBn(this.itemSize);
    this._ctrlScrollPanelHeight = Math.min(
      1e4,
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

    this._requestRenderAni();
  }
  private _scrollProcess = 0;
  public get scrollProcess() {
    return this._scrollProcess;
  }
  public set scrollProcess(value) {
    this._scrollProcess = value;
    // this.style.setProperty("--scroll-progress", value.toFixed(6));
  }
  // scrollProcess = 0;
  private _rangechange_event_collection?: Map<
    bigint,
    RenderRangeChangeEntry<T>
  >;
  private _emitRanderItem(item: RenderRangeChangeEntry<T>) {
    if (!this._rangechange_event_collection) {
      this._rangechange_event_collection = new Map();
      const collection = this._rangechange_event_collection;
      queueMicrotask(() => {
        if (this._rangechange_event_collection === collection) {
          this._rangechange_event_collection = undefined;
        }
        const entries = [...collection.values()].sort((a, b) =>
          a.index - b.index > 0n ? 1 : -1
        );
        const info: RenderRangeChangeDetail<T> = {
          entries,
        };
        this._emitRenderRangeChange(info);
      });
    }
    this._rangechange_event_collection.set(item.index, item);
  }

  private _emitRenderRangeChange(info: RenderRangeChangeDetail<T>) {
    const event = new RenderRangeChangeEvent("renderrangechange", {
      detail: info,
      cancelable: true,
      bubbles: false,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  private _ani?: { reqFrameId: number; startTime: number };
  readonly requestRenderAni = () => this._requestRenderAni();
  private _requestRenderAni = (force?: boolean) => {
    if (this._ani === undefined || force) {
      this._renderItems();

      const ani =
        this._ani ||
        (this._ani = {
          reqFrameId: 0,
          startTime: performance.now(),
        });
      ani.reqFrameId = requestAnimationFrame(() => {
        if (
          ani.startTime + 1e3 /* 每一次触发后，运动 1s 的时间 */ >
          performance.now()
        ) {
          this._requestRenderAni(true);
        } else {
          this._ani = undefined;
        }
      });
    } else {
      this._ani.startTime = performance.now();
    }
  };

  /**
   * 这里是放大了1e6的精度
   */
  private virtualScrollTop6e = 0n;
  get virtualScrollTop() {
    return this.virtualScrollTop6e / 1000000n;
  }
  set virtualScrollTop(v: number | bigint) {
    if (typeof v === "number") {
      this.virtualScrollTop6e = to6eBn(v);
    } else {
      this.virtualScrollTop6e = v * 1000000n;
    }
    this.refresh();
  }
  private SAFE_RENDER_TOP_6E = 0n;
  private MAX_VIRTUAL_SCROLL_HEIGHT_6E = 0n;

  private _cacheRenderTop?: number;
  public get cacheRenderTop() {
    return this._cacheRenderTop ?? this.itemSize / 2;
  }
  public set cacheRenderTop(value) {
    this._cacheRenderTop = value;
  }
  private _cacheRenderBottom?: number;
  public get cacheRenderBottom() {
    return this._cacheRenderBottom ?? this.itemSize / 2;
  }
  public set cacheRenderBottom(value) {
    this._cacheRenderBottom = value;
  }

  private _preScrollDiff = 0;

  private _preScrollUpTop = 0;
  private _preScrollUpDiff = 0;
  private _preScrollDownTop = 0;
  private _preScrollDownDiff = 0;

  private _intouch = false;
  /**渲染滚动视图 */
  private _renderItems() {
    if (!this.viewPort || !this._templateFactory) {
      return;
    }

    const scrollUpTop = this._scrollCtrlUp.scrollTop;
    const scrollDownTop = this._scrollCtrlDown.scrollTop;
    const scrollUpDiff = scrollUpTop - this._preScrollUpTop;
    const scrollDownDiff = scrollDownTop - this._preScrollDownTop;
    this._preScrollUpTop = scrollUpTop;
    this._preScrollDownTop = scrollDownTop;

    let scrollDiff = 0;
    if (scrollDownDiff > 0 || (scrollDownDiff < 0 && this._intouch)) {
      scrollDiff = scrollDownDiff;
      this._preScrollDownDiff = scrollDownDiff;
      /// 重置其它滚动的 scrollTop；因为scroll-snap，所以使用0即可强制触发位置重置
      this._scrollCtrlUp.scrollTop = 0;
      this._preScrollUpTop = this._scrollCtrlUp.scrollTop;
      this.viewPort.scrollTop = 0;
    } else if (scrollUpDiff < 0 || (scrollUpDiff > 0 && this._intouch)) {
      scrollDiff = scrollUpDiff;
      this._preScrollUpDiff = scrollUpDiff;
      /// 重置其它滚动的 scrollTop；因为scroll-snap，所以使用0即可强制触发位置重置
      this._scrollCtrlDown.scrollTop = 0;
      this._preScrollDownTop = this._scrollCtrlDown.scrollTop;
      this.viewPort.scrollTop = 0;
    } else if (scrollDownDiff < 0) {
      scrollDiff = this._preScrollDownDiff;
      this._preScrollDownDiff *= 0.9;
    } else if (scrollUpDiff > 0) {
      scrollDiff = this._preScrollUpDiff;
      this._preScrollUpDiff *= 0.9;
    } else {
      /// 平滑滚动
      scrollDiff = this._preScrollDiff * 0.9;
    }

    this._preScrollDiff = scrollDiff;

    this._dev &&
      console.log(
        "scrollUpDiff",
        scrollUpDiff,
        "scrollDownDiff",
        scrollDownDiff,
        "scrollDiff",
        scrollDiff
      );
    this._doScroll(scrollDiff);
  }

  safeAreaInsetTop = 0;
  safeAreaInsetBottom = 0;
  private _doScroll(scrollDiff: number) {
    const scrollCtrlHeight = this.viewPort!.viewportHeight;
    const virtualListViewHeight =
      scrollCtrlHeight + this.cacheRenderBottom + this.cacheRenderTop;

    /// 计算virtualScrollTop/virtualScrollBottom
    let virtualScrollTop6e = this.virtualScrollTop6e + to6eBn(scrollDiff);

    this._dev && console.log("virtualScrollTop6e", virtualScrollTop6e);

    const MIN_VIRTUAL_SCROLL_TOP_6E = 0n;
    const MAX_VIRTUAL_SCROLL_BOTTOM_6E = this.MAX_VIRTUAL_SCROLL_HEIGHT_6E;
    const MAX_VIRTUAL_SCROLL_TOP_6E =
      MAX_VIRTUAL_SCROLL_BOTTOM_6E - to6eBn(scrollCtrlHeight);

    if (virtualScrollTop6e < MIN_VIRTUAL_SCROLL_TOP_6E) {
      virtualScrollTop6e = MIN_VIRTUAL_SCROLL_TOP_6E;
    } else if (virtualScrollTop6e > MAX_VIRTUAL_SCROLL_TOP_6E) {
      virtualScrollTop6e = MAX_VIRTUAL_SCROLL_TOP_6E;
    }
    this._scrollCtrlUp.classList.toggle(
      "unscroll",
      virtualScrollTop6e === MIN_VIRTUAL_SCROLL_TOP_6E
    );
    this._scrollCtrlDown.classList.toggle(
      "unscroll",
      virtualScrollTop6e === MAX_VIRTUAL_SCROLL_TOP_6E
    );

    this.scrollProcess =
      Number((virtualScrollTop6e * 100000000n) / MAX_VIRTUAL_SCROLL_TOP_6E) /
      100000000;

    this.virtualScrollTop6e = virtualScrollTop6e;

    /// 开始进行safeArea的渲染空间计算
    const cacheRenderTop6e = to6eBn(this.cacheRenderTop);
    let renderScrollTop6e =
      virtualScrollTop6e - cacheRenderTop6e - this.SAFE_RENDER_TOP_6E;

    let renderScrollBottom6e =
      renderScrollTop6e + to6eBn(virtualListViewHeight);
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
    /**坐标偏移 */
    const koordinatenverschiebung =
      Number(renderScrollTop6e - viewStartIndex * itemSize6e) / 1e6;

    /// 先标记回收
    const rms = new Set<T>();
    for (const [i, item] of this._inViewItems) {
      if (i < viewStartIndex || i > viewEndIndex) {
        this._emitRanderItem({ index: i, node: item, type: "hidden" });
        this._inViewItems.delete(i);
        this._pool.push(item);
        rms.add(item);
      }
    }

    /// 再进行重建
    for (let index = viewStartIndex; index <= viewEndIndex; index++) {
      let node = this._inViewItems.get(index);

      if (!node) {
        node = this._pool.pop();
        this._inViewItems.set(index, node);
        if (rms.delete(node) === false && node.parentElement !== this) {
          this.appendChild(node);
        }
        /// 触发事件
        this._emitRanderItem({ index, node, type: "visible" });
        // (node as any).disabled_ani = true;
      }

      /// 设置偏移量
      node.style.setProperty(
        "--virtual-transform",
        `translateY(${
          // scrollTop +
          Number(index - viewStartIndex) * this.itemSize -
          koordinatenverschiebung
        }px)`
      );
      node.style.removeProperty("--virtual-display");
    }

    /// 移除剩余的没有被重复利用的元素；（使用挪动到视图之外来替代移除，避免过度抖动）
    if (rms.size > 1) {
      for (const node of rms) {
        this.removeChild(node);
      }
    } else {
      for (const node of rms) {
        node.style.setProperty("--virtual-display", `none`);
      }
    }

    /// 最后对自定义元素进行偏移
    for (const customScrollEle of this.querySelectorAll("custom-list-item")) {
      const top6e =
        customScrollEle.virtualPositionTop * 1000000n + cacheRenderTop6e;
      const bottom6e = top6e + to6eBn(customScrollEle.clientHeight);
      if (bottom6e < renderScrollTop6e || top6e > renderScrollBottom6e) {
        customScrollEle.style.setProperty("--virtual-display", `none`);
      } else {
        customScrollEle.style.setProperty(
          "--virtual-transform",
          `translateY(${(top6e - virtualScrollTop6e) / 1000000n}px)`
        );
        customScrollEle.style.removeProperty("--virtual-display");
      }
      // console.log(customScrollEle);
    }
  }
  /**销毁滚动视图 */
  private _destroyItems() {
    for (const [i, item] of this._inViewItems) {
      this._emitRanderItem({ index: i, node: item, type: "hidden" });
      this._inViewItems.delete(i);
      this._pool.push(item);
      this.removeChild(item);
    }
  }
  private _inViewItems = new Map</* index: */ bigint, T>();
  private _pool = new ItemPool(() => {
    if (!this._templateFactory) {
      throw new Error("no found template slot");
    }
    return this._templateFactory();
  });
  /**滚动视图刷新 */
  refresh() {
    this._destroyItems();
    for (const ele of this._pool.clear()) {
      ele.remove();
    }
    this._setStyle();
    this._requestRenderAni();
  }
}

export class ItemPool<T> {
  constructor(private _builder: () => T) {}
  private _pool: T[] = [];
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

interface RenderRangeChangeEntry<T extends HTMLElement = HTMLElement> {
  node: T;
  index: bigint;
  type: "visible" | "hidden" | "create" | "destroy";
}
interface RenderRangeChangeDetail<T extends HTMLElement = HTMLElement> {
  entries: RenderRangeChangeEntry<T>[];
}

export class RenderRangeChangeEvent<
  T extends HTMLElement = HTMLElement
> extends CustomEvent<RenderRangeChangeDetail<T>> {}

type RenderRangeChangeHanlder = <T extends HTMLElement = HTMLElement>(
  event: RenderRangeChangeEvent<T>
) => unknown;

customElements.define("fixed-size-list", FixedSizeListBuilderElement);

declare global {
  interface HTMLElementTagNameMap {
    "fixed-size-list": FixedSizeListBuilderElement;
  }
}
