import { customElement } from "lit-element";

import { VirtualListCommonItemElement } from "./virtual-list-common-item";

/**
 * default item in virtual scroll list
 * @slot - for custom list item
 * @attr {bigint} position-top - the posiction in virtual scroll list
 * @attr {number} item-size - the item height
 */
@customElement("virtual-list-default-item")
export class VirtualListDefaultItemElement<
  T extends HTMLElement = HTMLElement
> extends VirtualListCommonItemElement {
  constructor(public readonly contentNode: T) {
    super();
    this.appendChild(contentNode);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "virtual-list-default-item": VirtualListDefaultItemElement;
  }
}
