import { LitElement, html, customElement, property, css } from "lit-element";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("scroll-viewport")
export class ScrollViewportElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow: auto;
      box-sizing: border-box;
      scroll-snap-type: none;
      scroll-snap-type: y mandatory;
      overflow: auto;
      scroll-behavior: smooth;
    }
    :host > #top::after {
      content: " ";
      display: block;
      scroll-snap-align: start;
    }
    :host > #bottom::before {
      content: " ";
      display: block;
      scroll-snap-align: end;
    }
  `;
  viewportHeight = 0;
  viewportWidth = 0;
  private _resize_ob = (() => {
    const ob = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target !== this) {
          continue;
        }
        this.style.setProperty(
          "--viewport-height",
          (this.viewportHeight = entry.contentRect.height) + "px"
        );
        this.style.setProperty(
          "--viewport-width",
          (this.viewportWidth = entry.contentRect.width) + "px"
        );
        this.dispatchEvent(
          new CustomEvent("viewportreisze", { detail: entry.contentRect })
        );
        //  entry.contentRect.width
      }
    });
    ob.observe(this);
    return ob;
  })();

  // constructor(){
  //   this._resize_ob
  // }

  // constructor() {
  //   super();
  //   this.addEventListener("scroll", (event) => {
  //     const bounceTopEle = this.renderRoot.querySelector(
  //       ":host>#top"
  //     ) as HTMLElement;

  //     if (
  //       bounceTopEle &&
  //       this.scrollTop === 0 /*  < bounceTopEle.offsetHeight */
  //     ) {
  //       console.log("in top bounce");
  //       this.classList.add("bounce-effect");
  //     } else {
  //       const bounceBottomEle = this.renderRoot.querySelector(
  //         ":host>#bottom"
  //       ) as HTMLElement;
  //       if (
  //         bounceBottomEle &&
  //         this.scrollHeight - this.clientHeight - this.scrollTop === 0 /*  <
  //           bounceBottomEle.offsetHeight */
  //       ) {
  //         console.log("in bottom bounce");
  //         this.classList.add("bounce-effect");
  //       } else {
  //         console.log("in content no bounce");
  //         this.classList.remove("bounce-effect");
  //       }
  //     }
  //   });
  //   this.addEventListener("touchstart", () =>
  //     this.classList.add("touch-effect")
  //   );
  //   this.addEventListener("touchcancel", () =>
  //     this.classList.remove("touch-effect")
  //   );
  //   this.addEventListener("touchend", () =>
  //     this.classList.remove("touch-effect")
  //   );
  // }

  scrollTopHigh = 0;
  render() {
    return html`
      <aside id="top" part="bounce-top">
        <slot name="bounce-top"></slot>
      </aside>
      <slot></slot>
      <aside id="bottom" part="bounce-bottom">
        <slot name="bounce-bottom"></slot>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "scroll-viewport": ScrollViewportElement;
  }
}
