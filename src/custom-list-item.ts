import { LitElement, html, customElement, property } from "lit-element";

@customElement("custom-list-item")
class CustomListItemElement extends LitElement {
  // static styles = css`
  //   :host {
  //     display: block;
  //   }
  // `;
  @property({ attribute: "position-top" })
  virtualPositionTop = 0n;
  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "custom-list-item": CustomListItemElement;
  }
}
