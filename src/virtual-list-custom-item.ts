import { customElement, property } from "lit-element";
import { anyToBigInt, anyToNaturalFloat } from "./helper";
import type { CommonFixedSizeListBuilder } from "./common-fixed-size-virtual-list-builder";
import { VirtualListCommonItemElement } from "./virtual-list-common-item";

/**
 * custom item in virtual scroll list
 * @slot - for custom list item
 * @attr {bigint} position-top - the posiction in virtual scroll list
 * @attr {number} item-size - the item height
 */
@customElement("virtual-list-custom-item")
export class VirtualListCustomItemElement extends VirtualListCommonItemElement {
  private _virtualPositionTop = 0n;
  @property({ attribute: "position-top" })
  public get virtualPositionTop(): bigint {
    return this._virtualPositionTop;
  }
  public set virtualPositionTop(value: unknown) {
    this._virtualPositionTop = anyToBigInt(value);
    this._updateVirtualScrollRender();
  }
  private _itemSize = 0;
  @property({ attribute: "item-size" })
  public get itemSize(): number {
    return this._itemSize;
  }
  public set itemSize(value: unknown) {
    this._itemSize = anyToNaturalFloat(value);
    this._updateStyles();
    this._updateVirtualScrollRender();
  }
  protected _getHostCssText() {
    return `--item-size:${this._itemSize}px;${super._getHostCssText()}`;
  }
  private _updateVirtualScrollRender() {
    (this.parentElement as CommonFixedSizeListBuilder)?.requestRenderAni?.();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "virtual-list-custom-item": VirtualListCustomItemElement;
  }
}
