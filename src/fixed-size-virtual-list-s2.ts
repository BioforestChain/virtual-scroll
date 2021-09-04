import {
  CommonFixedSizeListBuilder,
  ScrollAnimationInfo,
} from "./common-fixed-size-virtual-list-builder";
import { css, customElement, html, query, TemplateResult } from "lit-element";
import { virtualListViewStyle } from "./fixed-size-virtual-list-s1";

@customElement("fixed-size-virtual-list-s2")
export class FixedSizeVirtualListS2Element extends CommonFixedSizeListBuilder {
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
        }
        :host .scroll-dir .top,
        :host .scroll-dir .bottom {
          content: " ";
          display: block;
          visibility: hidden;
          height: var(--ctrl-scroll-panel-height);
        }
        :host .scroll-dir .center {
          scroll-snap-align: center;
          height: 0;
        }
        :host .scroll-dir {
          height: 100%;
          scroll-snap-type: y mandatory;
          overflow: auto; /**对于不支持overlay的需要回退到使用auto */
          overflow: overlay;
          scrollbar-color: var(--controlbar-color) var(--controlbar-bg-color);
          scrollbar-width: thin;
        }
        :host .scroll-dir.unscroll {
          overflow: hidden;
        }
        :host #scroll-down {
          position: sticky;
          left: 0;
          top: 0;
        }
        :host .scroll-dir::-webkit-scrollbar {
          width: var(--controlbar-width);
          background-color: var(--controlbar-bg-color);
        }
        :host .scroll-dir::-webkit-scrollbar-thumb {
          background-color: var(--controlbar-color);
          border-radius: calc(var(--controlbar-width) * 0.5);
        }
      `,
      virtualListViewStyle,
    ];
  }
  render(): TemplateResult {
    return html`
      <slot name="template"></slot>
      <div id="scroll-ctrl">
        <div
          id="scroll-up"
          class="scroll-dir"
          part="scroll-up"
          @scroll=${this.requestRenderAni}
        >
          <div
            id="scroll-down"
            class="scroll-dir"
            part="scroll-down"
            @scroll=${this.requestRenderAni}
          >
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
  }

  @query(":host #scroll-up", true)
  private _scrollCtrlUp!: HTMLDivElement;
  @query(":host #scroll-down", true)
  private _scrollCtrlDown!: HTMLDivElement;

  @query('slot[name="template"]', true)
  private _tplSlot!: HTMLSlotElement;
  protected _getTemplateElement() {
    const tplEles = this._tplSlot.assignedElements();
    return tplEles[0];
  }

  private _preScrollDiff = 0;

  private _preScrollUpTop = 0;
  private _preScrollDownTop = 0;

  protected _renderItems(now: number, ani: ScrollAnimationInfo) {
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
    let scrollDiffChanged = true;
    if (scrollDownDiff > 0 || (scrollDownDiff < 0 && this._intouch)) {
      scrollDiff = scrollDownDiff;
      /// 重置其它滚动的 scrollTop；因为scroll-snap，所以使用0即可强制触发位置重置
      this._scrollCtrlUp.scrollTop = 0;
      this._preScrollUpTop = this._scrollCtrlUp.scrollTop;
      this.viewPort.scrollTop = 0;
    } else if (scrollUpDiff < 0 || (scrollUpDiff > 0 && this._intouch)) {
      scrollDiff = scrollUpDiff;
      /// 重置其它滚动的 scrollTop；因为scroll-snap，所以使用0即可强制触发位置重置
      this._scrollCtrlDown.scrollTop = 0;
      this._preScrollDownTop = this._scrollCtrlDown.scrollTop;
      this.viewPort.scrollTop = 0;
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
      scrollDiff =
        this._preScrollDiff * this._dampingScrollDiff(now, ani).forward;
    }

    this._dev &&
      console.log(
        "scrollUpDiff",
        scrollUpDiff,
        "scrollDownDiff",
        scrollDownDiff,
        "scrollDiff",
        scrollDiff
      );

    const {
      virtualScrollTop6e,
      MIN_VIRTUAL_SCROLL_TOP_6E,
      MAX_VIRTUAL_SCROLL_TOP_6E,
    } = this._doScroll(scrollDiff, now);

    this._scrollCtrlUp.classList.toggle(
      "unscroll",
      virtualScrollTop6e === MIN_VIRTUAL_SCROLL_TOP_6E
    );
    this._scrollCtrlDown.classList.toggle(
      "unscroll",
      virtualScrollTop6e === MAX_VIRTUAL_SCROLL_TOP_6E
    );
  }
  protected _clearAniState() {
    this._preScrollDiff = 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fixed-size-virtual-list-s2": FixedSizeVirtualListS2Element;
  }
}
