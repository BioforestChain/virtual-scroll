import {
  CommonFixedSizeListBuilder,
  ScrollAnimationInfo,
} from "./common-fixed-size-virtual-list-builder";
import { css, customElement, html, query, TemplateResult } from "lit-element";

const fixedNum = (num: number) => {
  return Math.floor(num * 100) / 100;
};

export const virtualListViewStyle = css`
  :host #virtual-list-view-wrapper {
    height: 0;

    position: sticky;
    top: 0;
    transform: translateY(calc(var(--cache-render-top) * -1));
    z-index: 1;
  }
  :host #virtual-list-view {
    padding-top: var(--cache-render-top);
    padding-bottom: var(--cache-render-bottom);
    height: var(--viewport-height);
    width: 100%;

    overflow: hidden;
    contain: strict;
    transform: translate3d(0, 0, 0);
  }
`;

@customElement("fixed-size-virtual-list-s1")
export class FixedSizeVirtualListS1Element extends CommonFixedSizeListBuilder {
  static get styles() {
    return [
      ...super.styles,
      css`
        :host > #scroll-ctrl {
          height: 100%;
          width: 100%;

          position: absolute;
          top: 0;
          z-index: 1;
          height: 100%;
          scroll-snap-type: y mandatory;
          overflow: overlay;
        }
        :host > #scroll-ctrl::-webkit-scrollbar {
          width: 4px;
          background-color: transparent;
        }
        :host > #scroll-ctrl::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        :host > #scroll-ctrl .top,
        :host > #scroll-ctrl .bottom {
          content: " ";
          display: block;
          visibility: hidden;
          height: var(--ctrl-scroll-panel-height);
        }
        :host > #scroll-ctrl .center {
          scroll-snap-align: center;
          height: 0;
        }
      `,
      virtualListViewStyle,
    ];
  }
  render(): TemplateResult {
    return html`
      <slot name="template"></slot>
      <div id="scroll-ctrl" part="scroll-ctrl" @scroll=${this.requestRenderAni}>
        <div id="virtual-list-view-wrapper">
          <div id="virtual-list-view" part="virtual-list-view">
            <slot></slot>
            <slot name="item"></slot>
          </div>
        </div>
        <div class="top"></div>
        <div class="center"></div>
        <div class="bottom"></div>
      </div>
    `;
  }

  @query(":host #scroll-ctrl", true)
  private _scrollCtrl!: HTMLDivElement;

  @query('slot[name="template"]', true)
  private _tplSlot!: HTMLSlotElement;
  protected _getTemplateElement() {
    const tplEles = this._tplSlot.assignedElements();
    return tplEles[0];
  }

  private _preScrollTop = -1;
  private _preScrollDiff = 0;

  protected _renderItems(now: number, ani: ScrollAnimationInfo) {
    if (!this.viewPort || !this._templateFactory) {
      return;
    }
    const scrollHeight = this._ctrlScrollPanelHeight * 2;
    const scrollCtrlHeight = this.viewPort.viewportHeight;

    const scrollTop = fixedNum(this._scrollCtrl.scrollTop);
    const _centerScrollTop = fixedNum((scrollHeight - scrollCtrlHeight) / 2);
    const preScrollTop =
      this._preScrollTop === -1 ? _centerScrollTop : this._preScrollTop;
    this._preScrollTop = scrollTop;

    let scrollDiff = 0;
    let scrollDiffChanged = true;
    /// 正在向下滚动
    if (
      scrollTop > _centerScrollTop &&
      (scrollTop > preScrollTop || this._intouch)
    ) {
      scrollDiff = scrollTop - preScrollTop;
    }
    /// 正在向上滚动
    else if (
      scrollTop < _centerScrollTop &&
      (scrollTop < preScrollTop || this._intouch)
    ) {
      scrollDiff = scrollTop - preScrollTop;
    } else {
      scrollDiffChanged = false;
    }

    /// 主动的滚动变化；同时改变滚动的时间
    if (scrollDiffChanged) {
      this._preScrollDiff = scrollDiff;
      ani.aniDuration = this._stretchScrollDuration(scrollDiff);
    }
    /// 阻尼动画缓动
    else {
      scrollDiff = this._preScrollDiff * this._dampingScrollDiff(now, ani);
    }

    this._doScroll(scrollDiff);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fixed-size-virtual-list-s1": FixedSizeVirtualListS1Element;
  }
}
