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
    z-index: 2;

    scroll-snap-type: y mandatory;
    overflow: auto;
  }
  :host > #scroll-ctrl > .top,
  :host > #scroll-ctrl > .bottom {
    content: " ";
    display: block;
    visibility: hidden;
  }
  :host > #scroll-ctrl > .top {
    height:var(--ctrl-scroll-panel-height);
    // height: calc(var(--ctrl-scroll-panel-height)*var(--scroll-progress));
  }
  :host > #scroll-ctrl > .bottom {
    height:var(--ctrl-scroll-panel-height);
    // height: calc(var(--ctrl-scroll-panel-height)*(1 - var(--scroll-progress)));
  }
  :host > #scroll-ctrl > .center {
    scroll-snap-align: center;
    height: 0;
  }
  :host > #scroll-ctrl > #virtual-list-view-wrapper {
    height: 0;

    position: sticky;
    top: calc(var(--safe-render-top) * -1);
    z-index: 1;
  }
  :host > #scroll-ctrl > #virtual-list-view-wrapper > #virtual-list-view {
    height: calc(var(--viewport-height) + var(--safe-render-top) + var(--safe-render-bottom));
    width: 100%;

    overflow: hidden;
    contain: strict;
  }
  :host > #scroll-ctrl::-webkit-scrollbar {
    display: none;
  }

  ::slotted(*) {
    position: absolute;
    top: 0;
    transform: var(--virtual-transform) !important;
    display: var(--virtual-display) !important;
  }
`;
const fixedSizeListTemplate = document.createElement("template");
fixedSizeListTemplate.innerHTML = `
  <slot name="template"></slot>
  <div id="scroll-ctrl" part="scroll-ctrl">
    <div id="virtual-list-view-wrapper">
      <div id="virtual-list-view" part="virtual-list-view">
        <slot name="item"></slot>
      </div>
    </div>
    <div class="top"></div>
    <div class="center"></div>
    <div class="bottom"></div>
  </div>
`;

const observedAttributes = [
  "item-count" as const,
  "item-size" as const,
  "onrenderrangechange" as const,
  "safe-render-top" as const,
  "safe-render-bottom" as const,
  // "onbuilditem",
  // "ondestroyitem",
];
const anyToInt = (val: unknown) => {
  const numVal = parseInt(val + "") || 0;
  return numVal < 0 ? 0 : numVal;
};
const anyToFloat = (val: unknown) => {
  const numVal = parseFloat(val + "") || 0;
  return numVal < 0 ? 0 : numVal;
};
const anyToBigInt = (val: unknown) => {
  try {
    const numVal = BigInt(parseInt(val + "")) || 0n;
    return numVal < 0n ? 0n : numVal;
  } catch {
    return 0n;
  }
};
const fixedNum = (num: number) => {
  return Math.round(num * 100) / 100;
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
  private _virtualListView: HTMLDivElement;
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
    this._virtualListView = shadowRoot.querySelector(
      "#virtual-list-view"
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
    this._scrollCtrl.addEventListener("scroll", this.requestRenderAni);
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
    Reflect.set(self, "l", this);
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
      this.itemCount = anyToBigInt(newValue);
      this._setStyle();
    } else if (name === "item-size") {
      this.itemSize = anyToFloat(newValue);
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
    } else if (name === "safe-render-top") {
      this.safeRenderTop = anyToInt(newValue);
      this._setStyle();
    } else if (name === "safe-render-bottom") {
      this.safeRenderTop = anyToInt(newValue);
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
        --safe-render-top: ${this.safeRenderTop}px;
        --safe-render-bottom: ${this.safeRenderBottom}px;
    }`;
    this.MAX_VIRTUAL_SCROLL_HEIGHT_6E = to6eBn(this.itemSize) * this.itemCount;

    this._requestRenderAni();
  }
  private _scrollProcess = 0;
  public get scrollProcess() {
    return this._scrollProcess;
  }
  public set scrollProcess(value) {
    this._scrollProcess = value;
    this.style.setProperty("--scroll-progress", value.toFixed(6));
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
          // console.log("un ani", ani);
        }
      });

      // console.log("do ani", ani);
      this._renderItems();
    } else {
      this._ani.startTime = performance.now();
    }
  };

  /**
   * 这里是放大了1e6的精度
   */
  virtualScrollTop6e = 0n;
  get virtualScrollTop() {
    return this.virtualScrollTop6e / 1000000n;
  }
  private MAX_VIRTUAL_SCROLL_HEIGHT_6E = 0n;

  private _preScrollTop = -1;
  private _preScrollDiff = 0;

  private _safeRenderTop?: number;
  public get safeRenderTop() {
    return this._safeRenderTop ?? this.itemSize / 2;
  }
  public set safeRenderTop(value) {
    this._safeRenderTop = value;
  }
  private _safeRenderBottom?: number;
  public get safeRenderBottom() {
    return this._safeRenderBottom ?? this.itemSize / 2;
  }
  public set safeRenderBottom(value) {
    this._safeRenderBottom = value;
  }

  private _intouch = false;
  /**渲染滚动视图 */
  private _renderItems() {
    if (!this.viewPort || !this._templateFactory) {
      return;
    }
    const scrollHeight = this._ctrlScrollPanelHeight * 2;
    const scrollCtrlHeight = this.viewPort.viewportHeight;
    const virtualListViewHeight =
      this.viewPort.viewportHeight + this.safeRenderBottom + this.safeRenderTop;

    const scrollTop = fixedNum(this._scrollCtrl.scrollTop);
    const _centerScrollTop = fixedNum((scrollHeight - scrollCtrlHeight) / 2);
    const preScrollTop =
      this._preScrollTop === -1 ? _centerScrollTop : this._preScrollTop;

    let scrollDiff = 0;
    /// 正在向下滚动
    if (scrollTop > _centerScrollTop) {
      /// 正在向下滚动
      if (scrollTop > preScrollTop || this._intouch) {
        scrollDiff = this._preScrollDiff = scrollTop - preScrollTop;
      }
      /// 正在弹回滚动
      else {
        scrollDiff = this._preScrollDiff;
      }
    }
    /// 正在向上滚动
    else if (scrollTop < _centerScrollTop) {
      /// 正在向上滚动
      if (scrollTop < preScrollTop || this._intouch) {
        scrollDiff = this._preScrollDiff = scrollTop - preScrollTop;
      }
      /// 正在弹回滚动
      else {
        scrollDiff = this._preScrollDiff;
      }
    }

    this._dev &&
      console.log(
        scrollTop,
        scrollHeight,
        scrollCtrlHeight,
        virtualListViewHeight,
        _centerScrollTop
      );

    this._preScrollTop = scrollTop;

    /// 计算virtualScrollTop/virtualScrollBottom
    let virtualScrollTop6e = this.virtualScrollTop6e + to6eBn(scrollDiff);

    this._dev && console.log("virtualScrollTop6e", virtualScrollTop6e);

    const MAX_VIRTUAL_SCROLL_BOTTOM_6E = this.MAX_VIRTUAL_SCROLL_HEIGHT_6E;
    const MAX_VIRTUAL_SCROLL_TOP_6E =
      MAX_VIRTUAL_SCROLL_BOTTOM_6E - to6eBn(scrollCtrlHeight);

    if (virtualScrollTop6e < 0n) {
      virtualScrollTop6e = 0n;
    } else if (virtualScrollTop6e > MAX_VIRTUAL_SCROLL_TOP_6E) {
      virtualScrollTop6e = MAX_VIRTUAL_SCROLL_TOP_6E;
    }

    this.scrollProcess =
      Number((virtualScrollTop6e * 100000000n) / MAX_VIRTUAL_SCROLL_TOP_6E) /
      100000000;

    this.virtualScrollTop6e = virtualScrollTop6e;

    /// 开始进行safeArea的渲染空间计算
    let safeRenderTop6e = to6eBn(this.safeRenderTop);
    let safeRenderScrollTop6e = virtualScrollTop6e - safeRenderTop6e;

    let safeRenderScrollBottom6e =
      safeRenderScrollTop6e + to6eBn(virtualListViewHeight);
    if (safeRenderScrollBottom6e > MAX_VIRTUAL_SCROLL_BOTTOM_6E) {
      safeRenderScrollBottom6e = MAX_VIRTUAL_SCROLL_BOTTOM_6E;
    }

    const itemSize6e = to6eBn(this.itemSize);

    const viewStartIndex =
      (safeRenderScrollTop6e < 0n ? 0n : safeRenderScrollTop6e) / itemSize6e;
    const viewEndIndex = safeRenderScrollBottom6e / itemSize6e;
    /**坐标偏移 */
    const koordinatenverschiebung =
      Number(safeRenderScrollTop6e - viewStartIndex * itemSize6e) / 1e6;

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
