import { LitElement, html, css } from "lit-element";

export abstract class VirtualListCommonItemElement extends LitElement {
  static styles = css`
    :host {
      height: var(--item-size);
      position: absolute;
      top: 0;
      transform: var(--virtual-transform);
      display: var(--virtual-display);
      will-change: transform;
      --virtual-display: block;
      width: 100%;
    }
  `;

  private _virtualTransformTop = 0;
  public get virtualTransformTop(): number {
    return this._virtualTransformTop;
  }
  public set virtualTransformTop(value: number) {
    this._virtualTransformTop = value;
    this._updateStyles();
  }
  private _virtualVisible = false;
  public get virtualVisible(): boolean {
    return this._virtualVisible;
  }
  public set virtualVisible(value: boolean) {
    this._virtualVisible = value;
    this._updateStyles();
  }
  private _updating = false;
  protected _updateStyles() {
    if (this._updating) {
      return;
    }
    this._updating = true;
    queueMicrotask(() => {
      this._updating = false;
      this.style.cssText = this._getHostCssText();
    });
  }
  protected _getHostCssText() {
    let cssText: string;
    if (this._virtualVisible) {
      cssText = `--virtual-transform:translateY(${this._virtualTransformTop}px)`;
    } else {
      cssText = `--virtual-display:none`;
    }
    return cssText;
  }
  render() {
    return html`<slot></slot>`;
  }
}
