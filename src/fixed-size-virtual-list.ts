import { CommonFixedSizeListBuilder } from "./common-fixed-size-virtual-list-builder";
import { css, customElement, html, query, TemplateResult } from "lit-element";

@customElement("fixed-size-virtual-list")
export class FixedSizeVirtualListElement extends CommonFixedSizeListBuilder {
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
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
        }
      `,
    ];
  }
  render(): TemplateResult {
    console.log("render!!!");
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

  protected _renderItems() {
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

    const {
      virtualScrollTop6e,
      MIN_VIRTUAL_SCROLL_TOP_6E,
      MAX_VIRTUAL_SCROLL_TOP_6E,
    } = this._doScroll(scrollDiff);

    this._scrollCtrlUp.classList.toggle(
      "unscroll",
      virtualScrollTop6e === MIN_VIRTUAL_SCROLL_TOP_6E
    );
    this._scrollCtrlDown.classList.toggle(
      "unscroll",
      virtualScrollTop6e === MAX_VIRTUAL_SCROLL_TOP_6E
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "fixed-size-virtual-list": FixedSizeVirtualListElement;
  }
}
