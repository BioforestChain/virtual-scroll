// import { css } from "lit-element";
import type { ScrollViewportElement } from "./scroll-viewport";

const hostStyle = document.createElement("style");
hostStyle.innerHTML = `
:host {
  display: block;
  height: calc(var(--item-size) * var(--item-count));
  overflow: hidden;
  position: relative;
}
slot[name="template"] {
  display: none;
}
::slotted(*) {
  position: absolute;
  top: 0;
}
`;

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
    this.addEventListener("builditem", (event) => {
      this._itemBuilder?.(event as BuildItemEvent);
    });
    this.addEventListener("destroyitem", (event) => {
      this._itemDestroyer?.(event as DestroyItemEvent);
    });

    /// *. bind global
    Reflect.set(self, "l", this);
  }
  private _viewPort: ScrollViewportElement | null = null;
  private _onScrollInViewPort = (event: Event) => {
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

  static get observedAttributes() {
    return ["item-count", "item-size", "onbuilditem", "ondestroyitem"];
  }
  /// 自定义事件 builditem
  private _itemBuilder?: ItemBuilder;
  public get itemBuilder(): null | ItemBuilder {
    return this._itemBuilder || null;
  }
  public set itemBuilder(value: null | ItemBuilder) {
    this._itemBuilder = value || undefined;
  }

  /// 自定义事件 destroyitem
  private _itemDestroyer?: ItemDestroyer;
  public get itemDestroyer(): null | ItemDestroyer {
    return this._itemDestroyer || null;
  }
  public set itemDestroyer(value: null | ItemDestroyer) {
    this._itemDestroyer = value || undefined;
  }

  public itemCount = 0;
  public itemSize = "0px";

  private _tplEle?: Element;
  private _templateFactory?: () => T;

  attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
    if (name === "item-count") {
      const itemCount = parseInt(newValue + "") || 0;
      this.itemCount = itemCount < 0 ? 0 : itemCount;
      this._setStyle();
    } else if (name === "item-size") {
      if (typeof newValue === "number") {
        newValue = (newValue > 0 ? newValue : 0) + "px";
      }
      this.itemSize = newValue + "";
      this._setStyle();
    } else if (name === "onbuilditem") {
      if (newValue) {
        this.itemBuilder = Function(
          "event",
          `(${newValue})&&event.preventDefault()`
        ) as never;
      } else {
        this.itemBuilder = null;
      }
    } else if (name === "ondestroyitem") {
      if (newValue) {
        this.itemDestroyer = Function(
          "event",
          `(${newValue})&&event.preventDefault()`
        ) as never;
      } else {
        this.itemDestroyer = null;
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
  private _emitBuildItem(info: BuildItemDetail<T>) {
    const event = new BuildItemEvent("builditem", {
      detail: info,
      cancelable: true,
      bubbles: false,
      composed: true,
    });

    this.dispatchEvent(event);
  }
  private _emitDestroyItem(info: DestroyItemDetail<T>) {
    const event = new DestroyItemEvent("destroyitem", {
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
      scrollHeight: selfScrollHeight,
      shadowRoot,
    } = this;
    if (!shadowRoot) {
      return;
    }
    const itemHeight = selfScrollHeight / this.itemCount;
    if (Number.isFinite(itemHeight) === false) {
      return;
    }

    /**相对viewPort的位置 */
    const relatedOffsetTop = selfOffsetTop - viewPortOffsetTop;
    // const scrollTop = viewPortScrollTop + relatedOffsetTop;

    /// 这里包含border
    const viewTop = viewPortScrollTop - relatedOffsetTop;
    /// 这里包含border
    const viewBottom = viewTop + viewPortHeight;

    const MAX = this.itemCount - 1;
    const MIN = 0;
    const clamp = (min: number, v: number, max: number) =>
      Math.min(Math.max(v, min), max);

    const viewStartIndex = Math.floor(viewTop / itemHeight);
    const viewEndIndex = Math.min(
      Math.floor(viewBottom / itemHeight),
      this.itemCount - 1
    );

    /// 先标记回收
    const rms = new Set<T>();
    for (const [i, item] of this._inViewItems) {
      if (i < viewStartIndex || i > viewEndIndex) {
        this._emitDestroyItem({ index: i, node: item });
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
        this._emitBuildItem({ index, node });
      }
      /// 设置偏移量
      node.style.setProperty(
        "transform",
        `translateY(${index * itemHeight}px)`
      );
    }

    /// 移除剩余的没有被重复利用的元素；（使用挪动到视图之外来替代移除，避免过度抖动）
    if (rms.size > 1) {
      for (const node of rms) {
        this.removeChild(node);
      }
    } else {
      for (const node of rms) {
        node.style.setProperty("transform", `translateY(${-itemHeight}px)`);
      }
    }
  }
  /**销毁滚动视图 */
  private _destroyItems() {
    for (const [i, item] of this._inViewItems) {
      this._emitDestroyItem({ index: i, node: item });
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

interface BuildItemDetail<T extends HTMLElement = HTMLElement> {
  node: T;
  index: number;
}
export class BuildItemEvent<
  T extends HTMLElement = HTMLElement
> extends CustomEvent<BuildItemDetail<T>> {}
type ItemBuilder = <T extends HTMLElement = HTMLElement>(
  event: BuildItemEvent<T>
) => unknown;

interface BuildItemDetail<T extends HTMLElement = HTMLElement> {
  node: T;
  index: number;
}
interface DestroyItemDetail<T extends HTMLElement = HTMLElement> {
  node: T;
  index: number;
}
export class DestroyItemEvent<
  T extends HTMLElement = HTMLElement
> extends CustomEvent<DestroyItemDetail<T>> {}
type ItemDestroyer = <T extends HTMLElement = HTMLElement>(
  event: DestroyItemEvent<T>
) => unknown;

customElements.define("fixed-size-list", FixedSizeListBuilderElement);

declare global {
  interface HTMLElementTagNameMap {
    "fixed-size-list": FixedSizeListBuilderElement;
  }
}
