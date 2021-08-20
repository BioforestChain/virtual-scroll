// import { css } from "lit-element";
import type { ScrollViewportElement } from "./scroll-viewport";

const hostStyle = document.createElement("style");
hostStyle.innerHTML = `
:host {
  display: block;
  height: calc(var(--item-size) * var(--item-count));
  position: relative;
}
slot[name="template"] {
  display: none;
}
::slotted(*) {
  position: absolute;
  top: 0;
  transform: var(--virtual-transform)!important;
  display: var(--virtual-display)!important;
}
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
const toPixel = (val: unknown) => {
  if (typeof val === "number") {
    val = (val > 0 ? val : 0) + "px";
  }
  return val + "";
};

export class FixedSizeListBuilderElement<
  T extends HTMLElement = HTMLElement
> extends HTMLElement {
  static style = hostStyle;
  private _style = document.createElement("style");
  private _ob: MutationObserver;
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });
    /// 1. style
    shadowRoot.appendChild(FixedSizeListBuilderElement.style.cloneNode(true));
    shadowRoot.appendChild(this._style);

    /// 2. template for builder
    const tplSlot = document.createElement("slot");
    tplSlot.name = "template";
    shadowRoot.appendChild(tplSlot);

    /// 3. get slot=template as builder node
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

    /// 3. view slot
    const itemSlot = document.createElement("slot");
    itemSlot.name = "item";
    shadowRoot.appendChild(itemSlot);

    /// 4. bind custom events
    this.addEventListener("renderrangechange", (event) => {
      this._onrenderrangechange?.(event as RenderRangeChangeEvent);
    });

    /// *. bind global
    Reflect.set(self, "l", this);
  }
  private _viewPort: ScrollViewportElement | null = null;
  private _onScrollInViewPort = () => {
    this._renderItems();
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

  public itemCount = 0;
  public itemSize = "0px";

  private _tplEle?: Element;
  private _templateFactory?: () => T;

  attributeChangedCallback(
    name: typeof observedAttributes[0],
    oldValue: unknown,
    newValue: unknown
  ) {
    if (name === "item-count") {
      this.itemCount = toInt(newValue);
      this._setStyle();
    } else if (name === "item-size") {
      this.itemSize = toPixel(newValue);
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
        --item-size: ${this.itemSize};
        --item-count: ${this.itemCount};
    }`;
    this._renderItems();
  }
  private _rangechange_event_collection?: Map<
    number,
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
        const entries = [...collection.values()].sort(
          (a, b) => a.index - b.index
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
  /**渲染滚动视图 */
  private _renderItems() {
    if (!this.viewPort || !this._templateFactory) {
      return;
    }
    // const viewPortBound = this.viewPort.getBoundingClientRect();
    const {
      scrollTop: viewPortScrollTop,
      offsetTop: viewPortOffsetTop,
      clientHeight: viewPortHeight,
    } = this.viewPort;
    const {
      offsetTop: selfOffsetTop,
      offsetHeight: selfOffsetHeight,
      shadowRoot,
    } = this;
    if (!shadowRoot) {
      return;
    }
    const itemHeight = selfOffsetHeight / this.itemCount;
    if (Number.isFinite(itemHeight) === false) {
      return;
    }
    // const safeArea = itemHeight * 5;

    /**相对viewPort的位置 */
    const relatedOffsetTop = selfOffsetTop - viewPortOffsetTop;
    // const scrollTop = viewPortScrollTop + relatedOffsetTop;

    /// 这里包含border
    const viewTop = viewPortScrollTop - relatedOffsetTop; /* - safeArea */
    /// 这里包含border
    const viewBottom = viewTop + viewPortHeight; /* + safeArea */

    const viewStartIndex = Math.floor(viewTop / itemHeight);
    const viewEndIndex = Math.min(
      Math.floor(viewBottom / itemHeight),
      this.itemCount - 1
    );

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
    for (
      let index = Math.max(viewStartIndex, 0);
      index <= viewEndIndex;
      index++
    ) {
      let node = this._inViewItems.get(index);
      if (!node) {
        node = this._pool.pop();
        this._inViewItems.set(index, node);
        if (rms.delete(node) === false && node.parentElement !== this) {
          this.appendChild(node);
        }
        /// 触发事件
        this._emitRanderItem({ index, node, type: "visible" });
      }
      /// 设置偏移量
      node.style.setProperty(
        "--virtual-transform",
        `translateY(${index * itemHeight}px)`
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
  private _inViewItems = new Map</* index: */ number, T>();
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
  index: number;
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
