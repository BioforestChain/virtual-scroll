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
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      max-height: 100%;
      overflow: auto;
      box-sizing: border-box;
      scroll-snap-type: none;
      scroll-snap-type: y proximity;
      overflow: auto;
      scroll-behavior: smooth;
    }
    /* :host(.bounce-effect) {
      scroll-snap-type: y mandatory;
    }
    :host(.bounce-effect.touch-effect) {
      scroll-snap-type: y proximity;
    } */
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
