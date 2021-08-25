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
  T extends HTMLElement = HTMLElement
> extends LitElement {
  static get styles() {
    return [
      css`
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

        ::slotted(*) {
          position: absolute;
          top: 0;
          transform: var(--virtual-transform);
          display: var(--virtual-display);
          will-change: transform;
          --virtual-display: block;
          width: 100%;
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

  protected _dev = false;
  constructor() {
    super();

    // const shadowRoot = this.attachShadow({ mode: "open" });
    // /// 1. style
    // shadowRoot.appendChild(CommonFixedSizeListBuilder.style.cloneNode(true));

    // /// 2. create content dom
    // shadowRoot.appendChild((this._fragment = fragment));

    /// bind custom events
    this.addEventListener("renderrangechange", (event) => {
      this._onrenderrangechange?.(event as RenderRangeChangeEvent);
    });
    this.__initInTouch();

    /// *. bind global
    // Reflect.set(self, "l", this);
  }

  protected _intouch = false;
  private __initInTouch() {
    for (const en of ["touchstart", "mousedown"]) {
      this.addEventListener(
        en,
        () => {
          this._dev && console.log(en);
          this._intouch = true;
        },
        { passive: true }
      );
    }
    for (const en of ["touchcancel", "touchend", "mouseup"]) {
      this.addEventListener(
        en,
        () => {
          this._dev && console.log(en);
          this._intouch = false;
        },
        { passive: true }
      );
    }
  }

  abstract render(): TemplateResult;

  //#region 模板构造器

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
    /// 彻底更新滚动视图
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
      oldViewPort.removeEventListener("viewportreisze", this.requestRenderAni);
    }
    if ((this._viewPort = value)) {
      value.addEventListener("viewportreisze", this.requestRenderAni);
      this._requestRenderAni();
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

  protected _onrenderrangechange?: RenderRangeChangeHanlder;
  @property({ attribute: "onrenderrangechange" })
  public get onrenderrangechange(): null | RenderRangeChangeHanlder {
    return this._onrenderrangechange || null;
  }
  public set onrenderrangechange(value: unknown) {
    if (typeof value === "string") {
      value = Function(
        "event",
        `(${value})&&event.preventDefault()`
      ) as RenderRangeChangeHanlder;
    }
    if (typeof value !== "function") {
      value = undefined;
    }
    this._onrenderrangechange = value as RenderRangeChangeHanlder;
  }
  private _itemCount = 0n;
  @property({ attribute: "item-count" })
  public get itemCount(): bigint {
    return this._itemCount;
  }
  public set itemCount(value: unknown) {
    this._itemCount = anyToNaturalBigInt(value);
    this._setStyle();
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
  protected _rangechange_event_collection?: Map<
    bigint,
    RenderRangeChangeEntry<T>
  >;
  protected _emitRanderItem(item: RenderRangeChangeEntry<T>) {
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

  protected _emitRenderRangeChange(info: RenderRangeChangeDetail<T>) {
    const event = new RenderRangeChangeEvent("renderrangechange", {
      detail: info,
      cancelable: true,
      bubbles: false,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  protected _ani?: { reqFrameId: number; startTime: number };
  readonly requestRenderAni = () => this._requestRenderAni();
  protected _requestRenderAni = (force?: boolean) => {
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
  protected virtualScrollTop6e = 0n;
  get virtualScrollTop() {
    return this.virtualScrollTop6e / bi6e;
  }
  set virtualScrollTop(v: number | bigint) {
    if (typeof v === "number") {
      this.virtualScrollTop6e = to6eBn(v);
    } else {
      this.virtualScrollTop6e = v * bi6e;
    }
    this.refresh();
  }
  protected SAFE_RENDER_TOP_6E = 0n;
  protected MAX_VIRTUAL_SCROLL_HEIGHT_6E = 0n;
  get virtualScrollHeight() {
    return this.MAX_VIRTUAL_SCROLL_HEIGHT_6E / bi6e;
  }

  protected _cacheRenderTop?: number;
  @property({ attribute: "cache-render-top" })
  public get cacheRenderTop() {
    return this._cacheRenderTop ?? this.itemSize / 2;
  }
  public set cacheRenderTop(value) {
    this._cacheRenderTop = value;
    this._setStyle();
  }
  protected _cacheRenderBottom?: number;
  @property({ attribute: "cache-render-bottom" })
  public get cacheRenderBottom() {
    return this._cacheRenderBottom ?? this.itemSize / 2;
  }
  public set cacheRenderBottom(value) {
    this._cacheRenderBottom = value;
    this._setStyle();
  }

  /**渲染滚动视图 */
  protected abstract _renderItems(): unknown;

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
  @property({ attribute: "safe-area-inset-bttom" })
  public get safeAreaInsetBottom() {
    return this._safeAreaInsetBottom;
  }
  public set safeAreaInsetBottom(value) {
    this._safeAreaInsetBottom = anyToFloat(value);
    this._setStyle();
  }
  protected _doScroll(scrollDiff: number) {
    const scrollCtrlHeight = this.viewPort!.viewportHeight;
    const virtualListViewHeight =
      scrollCtrlHeight + this.cacheRenderBottom + this.cacheRenderTop;
    const virtualListViewHeight6e = to6eBn(virtualListViewHeight);

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

    this.scrollProgress =
      Number((virtualScrollTop6e * 100000000n) / MAX_VIRTUAL_SCROLL_TOP_6E) /
      100000000;

    this.virtualScrollTop6e = virtualScrollTop6e;

    /// 开始进行safeArea+cacheRender的渲染空间计算
    const cacheRenderTop6e = to6eBn(this.cacheRenderTop);
    /**实际高度比viewportHeight更高，所以这类需要扣去向上偏移的cacheRenderTop */
    const cacheRenderScrollTop6e = virtualScrollTop6e - cacheRenderTop6e;
    /**safeArea的存在使得我们需要额外进行渲染偏移，它就是默认的scrollTop偏移量 */
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
    /**坐标偏移 */
    const koordinatenverschiebung =
      Number(renderScrollTop6e - viewStartIndex * itemSize6e) / 1e6;

    /// 先标记回收
    const rms = new Set<VirtualListDefaultItemElement<T>>();
    for (const [i, item] of this._inViewItems) {
      if (i < viewStartIndex || i > viewEndIndex) {
        this._emitRanderItem({
          index: i,
          node: item,
          type: "hidden",
          isIntersecting: false,
        });
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
        this._emitRanderItem({
          index,
          node,
          type: "visible",
          isIntersecting: true,
        });
      }

      /// 设置偏移量
      node.virtualTransformTop =
        Number(index - viewStartIndex) * this.itemSize -
        koordinatenverschiebung;
      node.virtualVisible = true;
      node.virtualIndex = Number(index - viewStartIndex);
    }

    /// 移除剩余的没有被重复利用的元素；（使用挪动到视图之外来替代移除，避免过度抖动）
    if (rms.size > 1) {
      for (const node of rms) {
        this.removeChild(node);
      }
    } else {
      for (const node of rms) {
        node.virtualVisible = false;
      }
    }

    /// 最后对自定义元素进行偏移
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
  /**销毁滚动视图 */
  protected _destroyItems() {
    for (const [i, item] of this._inViewItems) {
      this._emitRanderItem({
        index: i,
        node: item,
        type: "hidden",
        isIntersecting: false,
      });
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

interface RenderRangeChangeEntry<T extends HTMLElement = HTMLElement> {
  node: VirtualListDefaultItemElement<T>;
  index: bigint;
  type: "visible" | "hidden" | "create" | "destroy";
  isIntersecting: boolean;
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
