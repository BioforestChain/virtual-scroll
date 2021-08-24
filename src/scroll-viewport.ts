import { LitElement, html, customElement, css } from "lit-element";

/**
 * viewport for virtual scroll.
 *
 * @slot - This element has a slot
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
  private _resize_ob = new ResizeObserver((entries) => {
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
  connectedCallback() {
    super.connectedCallback();
    this._resize_ob.observe(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._resize_ob.disconnect();
  }

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
