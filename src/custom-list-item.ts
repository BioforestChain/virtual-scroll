import { LitElement, html, customElement, property, css } from "lit-element";
import { anyToBigInt, anyToNaturalFloat } from "./helper";
import type { FixedSizeListBuilderElement } from "./fixed-size-list";

/**
 * custom item in virtual scroll list
 * @slot - for custom list item
 * @attr {bigint} position-top - the posiction in virtual scroll list
 * @attr {number} item-size - the item height
 */
@customElement("custom-list-item")
export class CustomListItemElement extends LitElement {
  static styles = css`
    :host {
      height: var(--item-size);
    }
  `;
  private _virtualPositionTop = 0n;
  @property({ attribute: "position-top" })
  public get virtualPositionTop(): bigint {
    return this._virtualPositionTop;
  }
  public set virtualPositionTop(value: unknown) {
    this._virtualPositionTop = anyToBigInt(value);
    this.updateRender();
  }
  private _itemSize = 0;
  @property({ attribute: "item-size" })
  public get itemSize(): number {
    return this._itemSize;
  }
  public set itemSize(value: unknown) {
    this._itemSize = anyToNaturalFloat(value);
    this.style.setProperty("--item-size", `${this.itemSize}px`);
    this.updateRender();
  }
  render() {
    return html`<slot></slot>`;
  }
  private updateRender() {
    (this.parentElement as FixedSizeListBuilderElement)?.requestRenderAni?.();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "custom-list-item": CustomListItemElement;
  }
}
