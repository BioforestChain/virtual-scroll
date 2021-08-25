import {
  LitElement,
  html,
  css,
  supportsAdoptingStyleSheets,
} from "lit-element";

export abstract class VirtualListCommonItemElement extends LitElement {
  static styles = css`
    :host {
      height: var(--item-size);
      position: absolute;
      top: 0;
      transform: var(--virtual-transform);
      display: var(--virtual-display);
      z-index: var(--virtual-index);
      will-change: transform, display, z-index;
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
  private _virtualIndex = 0;
  public get virtualIndex(): number {
    return this._virtualIndex;
  }
  public set virtualIndex(value: number) {
    this._virtualIndex = value;
    this._updateStyles();
  }
  private _updating = false;
  protected _updateStyles() {
    if (this._updating) {
      return;
    }
    this._updating = true;
    queueMicrotask(this._doUpdateStyles);
  }
  private _doUpdateStyles = supportsAdoptingStyleSheets
    ? (() => {
        const cssStyle = new CSSStyleSheet();
        (this.shadowRoot as any)!.adoptedStyleSheets = [
          (this.constructor as typeof VirtualListCommonItemElement).styles
            .styleSheet,
          cssStyle,
        ];
        return () => {
          this._updating = false;
          (cssStyle as any).replace(`:host{${this._getHostCssText()}}`);
        };
      })()
    : () => {
        this._updating = false;
        this.style.cssText = this._getHostCssText();
      };
  protected _getHostCssText() {
    let cssText: string;
    if (this._virtualVisible) {
      cssText = `--virtual-transform:translateY(${this._virtualTransformTop}px);--virtual-index:${this._virtualIndex}`;
    } else {
      cssText = `--virtual-display:none`;
    }
    return cssText;
  }
  render() {
    return html`<slot></slot>`;
  }
}
