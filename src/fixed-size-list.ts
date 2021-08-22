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
    height: min(10000px, calc(var(--item-size) * var(--item-count) / 2));
    background-image: linear-gradient(45deg, black, transparent);
    background-size: 100px 100px;
    background-repeat: repeat;
    background-color: rebeccapurple;
    display: block;
    opacity: 0.1;
  }
  :host > #scroll-ctrl > .bottom {
    background-color: orange;
  }
  :host > #scroll-ctrl > .center {
    scroll-snap-align: center;
    height: 0;
  }
  :host > #scroll-ctrl > #virtual-list-view {
    height: var(--viewport-height);
    width: 100%;

    position: sticky;
    top: 0;
    z-index: 1;

    overflow: hidden;
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
  <div id="scroll-ctrl">
    <div id="virtual-list-view">
      <slot name="item"></slot>
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
  // "onbuilditem",
  // "ondestroyitem",
];
const toInt = (val: unknown) => {
  const numVal = parseInt(val + "") || 0;
  return numVal < 0 ? 0 : numVal;
};
const toFloat = (val: unknown) => {
  const numVal = parseFloat(val + "") || 0;
  return numVal < 0 ? 0 : numVal;
};
const toBigInt = (val: unknown) => {
  try {
    const numVal = BigInt(parseInt(val + "")) || 0n;
    return numVal < 0n ? 0n : numVal;
  } catch {
    return 0n;
  }
};
const toPixel = (val: unknown) => {
  if (typeof val === "number") {
    val = (val > 0 ? val : 0) + "px";
  }
  return val + "";
};

let frame_id = 0;
const updateFrameId = () => {
  frame_id++;
  requestAnimationFrame(updateFrameId);
};
updateFrameId();

export class FixedSizeListBuilderElement<
  T extends HTMLElement = HTMLElement
> extends HTMLElement {
  static style = hostStyle;
  private _style = document.createElement("style");
  private _fragment = fixedSizeListTemplate.content.cloneNode(
    true
  ) as DocumentFragment;
  private _srollCtrl: HTMLDivElement;
  private _ob: MutationObserver;
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });
    /// 1. style
    shadowRoot.appendChild(FixedSizeListBuilderElement.style.cloneNode(true));
    shadowRoot.appendChild(this._style);

    /// 2. create content dom
    shadowRoot.appendChild(this._fragment);
    /// 3. scroll controll dom
    this._srollCtrl = shadowRoot.querySelector(
      "#scroll-ctrl"
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
    this._srollCtrl.addEventListener("scroll", () => {
      this._onScrollInViewPort();
    });
    this._srollCtrl.addEventListener("touchstart", () => {
      this._intouch = true;
    });
    for (const en of ["touchcancel", "touchend"]) {
      this._srollCtrl.addEventListener(en, () => {
        console.log(en);
        this._intouch = false;
      });
    }

    /// *. bind global
    Reflect.set(self, "l", this);
  }
  private _viewPort: ScrollViewportElement | null = null;
  private _onScrollInViewPort = () => {
    this._renderItemsAni();
  };
  public get viewPort(): ScrollViewportElement | null {
    return this._viewPort;
  }
  public set viewPort(value: ScrollViewportElement | null) {
    const oldViewPort = this._viewPort;
    if (oldViewPort) {
      oldViewPort.removeEventListener("scroll", this._onScrollInViewPort);
    }
    if ((this._viewPort = value)) {
      value.addEventListener("scroll", this._onScrollInViewPort);
      value.addEventListener("resize", this._onScrollInViewPort);
      this._renderItems();
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
      this.itemCount = toBigInt(newValue);
      this._setStyle();
    } else if (name === "item-size") {
      this.itemSize = toFloat(newValue);
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
    }
  }
  private _setStyle() {
    this._style.innerHTML = `:host {
        --item-size: ${this.itemSize}px;
        --item-count: ${this.itemCount};
    }`;
    this.MAX_VIRTUAL_SCROLL_HEIGHT_6E =
      BigInt(Math.floor(this.itemSize * 1e6)) * this.itemCount;

    this._renderItems();
  }
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

  private _ani_ti?: number;
  _renderItemsAni = (force?: boolean) => {
    if (this._ani_ti === undefined || force) {
      const scrollTop = this._srollCtrl.scrollTop;
      this._ani_ti = requestAnimationFrame(() => {
        if (scrollTop !== this._srollCtrl.scrollTop) {
          this._renderItemsAni(true);
        } else {
          this._ani_ti = undefined;
        }
      });
      this._renderItems();
    }
  };

  // scrollTopLowBit = 0
  // scrollTopHighBit = 0
  // get scrollTopBn (){
  //   return
  // }
  // scrollTopBn =
  /**
   * 这里是放大了1e6的精度
   */
  virtualScrollTop6e = 0n;
  MAX_VIRTUAL_SCROLL_HEIGHT_6E = 0n;

  // private _centerScrollTop = -1;
  private _preScrollTop = -1;
  private _preScrollDiff = 0;
  private _safeAreaTop = 100;
  private _safeAreaBottom = 100;

  private _intouch = false;
  /**渲染滚动视图 */
  private _renderItems() {
    if (!this.viewPort || !this._templateFactory) {
      return;
    }
    // const viewPortBound = this.viewPort.getBoundingClientRect();
    const { clientHeight, scrollHeight } = this._srollCtrl; //.viewPort;
    const scrollTop = this._srollCtrl.scrollTop - clientHeight;
    const _centerScrollTop = (scrollHeight - clientHeight - clientHeight) / 2;
    const preScrollTop =
      this._preScrollTop === -1 ? _centerScrollTop : this._preScrollTop;
    let scrollDiff = 0;
    /// 正在向下滚动
    if (scrollTop > _centerScrollTop) {
      /// 正在向下滚动
      if (scrollTop > preScrollTop || this._intouch) {
        scrollDiff = this._preScrollDiff = scrollTop - preScrollTop;
        this._preScrollDiff = scrollDiff;
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
        this._preScrollDiff = scrollDiff;
      }
      /// 正在弹回滚动
      else {
        scrollDiff = this._preScrollDiff;
      }
    }
    console.log(
      `scrollTop:${scrollTop}; center:${_centerScrollTop}; direction:${
        scrollTop > _centerScrollTop ? "down" : "up"
      }; diff:${scrollDiff}`
    );
    this._preScrollTop = scrollTop;
    // if (scrollDiff === 0) {
    //   return;
    // }

    let virtualScrollTop6e =
      this.virtualScrollTop6e + BigInt(Math.floor(scrollDiff * 1e6)); /* -
      BigInt(Math.floor(this._safeAreaTop * 1e6)) */

    const MAX_VIRTUAL_SCROLL_BOTTOM_6E = this.MAX_VIRTUAL_SCROLL_HEIGHT_6E;
    const MAX_VIRTUAL_SCROLL_TOP_6E =
      MAX_VIRTUAL_SCROLL_BOTTOM_6E - BigInt(Math.floor(clientHeight * 1e6));

    if (virtualScrollTop6e < 0n) {
      virtualScrollTop6e = 0n;
    } else if (virtualScrollTop6e > MAX_VIRTUAL_SCROLL_TOP_6E) {
      virtualScrollTop6e = MAX_VIRTUAL_SCROLL_TOP_6E;
    }
    this.virtualScrollTop6e = virtualScrollTop6e;
    let virtualScrollBottom6e =
      virtualScrollTop6e + BigInt(Math.floor(clientHeight * 1e6)); /* +
      BigInt(Math.floor(this._safeAreaBottom * 1e6)) */
    if (virtualScrollBottom6e > MAX_VIRTUAL_SCROLL_BOTTOM_6E) {
      virtualScrollBottom6e = MAX_VIRTUAL_SCROLL_BOTTOM_6E;
    }

    const itemSize6e = BigInt(Math.floor(this.itemSize * 1e6));

    const viewStartIndex = virtualScrollTop6e / itemSize6e;
    const viewEndIndex = virtualScrollBottom6e / itemSize6e;
    /**坐标偏移 */
    const koordinatenverschiebung =
      Number(virtualScrollTop6e - viewStartIndex * itemSize6e) / 1e6;

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
      // node.style.setProperty("transition-duration", ani ? ".1s" : "0s");
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
    this._renderItems();
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
