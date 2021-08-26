var t=Object.defineProperty,e=Object.defineProperties,i=Object.getOwnPropertyDescriptors,r=Object.getOwnPropertySymbols,s=Object.prototype.hasOwnProperty,o=Object.prototype.propertyIsEnumerable,n=(e,i,r)=>i in e?t(e,i,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[i]=r,l=(t,e)=>{for(var i in e||(e={}))s.call(e,i)&&n(t,i,e[i]);if(r)for(var i of r(e))o.call(e,i)&&n(t,i,e[i]);return t},a=(t,r)=>e(t,i(r));import{c as h,L as c,h as d,a as u,s as p,p as _,q as m}from"./vendor.7f148f7f.js";!function(){const t=document.createElement("link").relList;if(!(t&&t.supports&&t.supports("modulepreload"))){for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver((t=>{for(const i of t)if("childList"===i.type)for(const t of i.addedNodes)"LINK"===t.tagName&&"modulepreload"===t.rel&&e(t)})).observe(document,{childList:!0,subtree:!0})}function e(t){if(t.ep)return;t.ep=!0;const e=function(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerpolicy&&(e.referrerPolicy=t.referrerpolicy),"use-credentials"===t.crossorigin?e.credentials="include":"anonymous"===t.crossorigin?e.credentials="omit":e.credentials="same-origin",e}(t);fetch(t.href,e)}}();var v=Object.defineProperty,g=Object.getOwnPropertyDescriptor;let f=class extends c{constructor(){super(...arguments),this.viewportHeight=0,this.viewportWidth=0,this._resize_ob=new ResizeObserver((t=>{for(const e of t)e.target===this&&(this.style.setProperty("--viewport-height",(this.viewportHeight=e.contentRect.height)+"px"),this.style.setProperty("--viewport-width",(this.viewportWidth=e.contentRect.width)+"px"),this.dispatchEvent(new CustomEvent("viewportreisze",{detail:e.contentRect})))}))}connectedCallback(){super.connectedCallback(),this._resize_ob.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resize_ob.disconnect()}render(){return d`
      <aside id="top" part="bounce-top">
        <slot name="bounce-top"></slot>
      </aside>
      <slot></slot>
      <aside id="bottom" part="bounce-bottom">
        <slot name="bounce-bottom"></slot>
      </aside>
    `}};f.styles=h`
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
  `,f=((t,e,i,r)=>{for(var s,o=r>1?void 0:r?g(e,i):e,n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r?s(e,i,o):s(o))||o);return r&&o&&v(e,i,o),o})([u("scroll-viewport")],f);const b=t=>{const e=parseFloat(t+"")||0;return isFinite(e)?e:0},S=t=>{const e=b(t);return e<0?0:e},w=t=>{try{return BigInt(parseInt(t+""))||0n}catch{return 0n}},y=1000000n,T=t=>BigInt(Math.floor(1e6*t));class I extends c{constructor(){super(...arguments),this._virtualTransformTop=0,this._virtualVisible=!1,this._virtualIndex=0,this._updating=!1,this._doUpdateStyles=p?(()=>{const t=new CSSStyleSheet;return this.shadowRoot.adoptedStyleSheets=[this.constructor.styles.styleSheet,t],()=>{this._updating=!1,t.replace(`:host{${this._getHostCssText()}}`)}})():()=>{this._updating=!1,this.style.cssText=this._getHostCssText()}}get virtualTransformTop(){return this._virtualTransformTop}set virtualTransformTop(t){this._virtualTransformTop=t,this._updateStyles()}get virtualVisible(){return this._virtualVisible}set virtualVisible(t){this._virtualVisible=t,this._updateStyles()}get virtualIndex(){return this._virtualIndex}set virtualIndex(t){this._virtualIndex=t,this._updateStyles()}_updateStyles(){this._updating||(this._updating=!0,queueMicrotask(this._doUpdateStyles))}_getHostCssText(){let t;return t=this._virtualVisible?`--virtual-transform:translateY(${this._virtualTransformTop}px);--virtual-index:${this._virtualIndex}`:"--virtual-display:none",t}render(){return d`<slot></slot>`}}I.styles=h`
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
  `;var C=Object.defineProperty,R=Object.getOwnPropertyDescriptor;let x=class extends I{constructor(t){super(),this.contentNode=t,this.appendChild(t)}};x=((t,e,i,r)=>{for(var s,o=r>1?void 0:r?R(e,i):e,n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r?s(e,i,o):s(o))||o);return r&&o&&C(e,i,o),o})([u("virtual-list-default-item")],x);class L{constructor(t,e,i,r){this.onItemCountChanged=t,this.defaultState=e,this.operateState=i,this.movementState=r,this._stateIdAcc=1,this._itemCount=0n,this._stateRangeList=[]}get uniqueStateId(){return this._stateIdAcc++}get itemCount(){return this._itemCount}set itemCount(t){this._itemCount=t,this.onItemCountChanged(t)}getStateInfoListByIndex(t){const e=[];for(const i of this._stateRangeList)i.startIndex<=t&&t<=i.endIndex&&e.push({id:i.id,state:i.status,endTime:i.endTime});return e.push({id:0,state:this.defaultState,endTime:1/0}),e}setState(t,e,i={}){const r={id:this.uniqueStateId,startIndex:t,endIndex:e,status:i.status||this.operateState,endTime:i.duration?performance.now()+i.duration:0};return this._stateRangeList.unshift(r),r}clearState(t){this._stateRangeList=this._stateRangeList.filter((e=>e.endTime>t))}_checkCount(t){if(t<=0n)throw new RangeError("count less then or equal to zero")}push(t,e={}){this._checkCount(t);const i=this.itemCount,r=i+t-1n;return this.setState(i,r,e),this.itemCount+=t}unshift(t,e={}){this._checkCount(t);const i=t;for(const r of this._stateRangeList)r.startIndex+=t,r.endIndex+=t;return this.setState(0n,i,e),0n!==this.itemCount&&this.setState(i+1n,this.itemCount+t-1n,a(l({},e),{status:this.movementState})),this.itemCount+=t}insertBefore(t,e,i={}){if(this._checkCount(t),void 0===e||e>=this.itemCount)return this.push(t,i);let r=e+t-1n;if(r<0n)throw new RangeError(`no items for insert ${t} before ${e}`);let s=e;if(s<0n)return s=0n,this.unshift(r+1n,i);for(const o of this._stateRangeList)o.startIndex>=e?(o.startIndex+=t,o.endIndex+=t):o.startIndex<e&&o.endIndex<=e&&(o.endIndex+=e-o.startIndex);return this.setState(s,r,i),this.setState(r+1n,this.itemCount+t-1n,a(l({},i),{status:this.movementState})),this.itemCount+=t}pop(t){if(this._checkCount(t),t>=this.itemCount)return this._stateRangeList.length=0,this.itemCount=0n;const e=this.itemCount-1n,i=new Set;for(const r of this._stateRangeList)r.endIndex>e&&(r.endIndex=e,r.endIndex>r.startIndex&&i.add(r));return i.size>0&&(this._stateRangeList=this._stateRangeList.filter((t=>!i.has(t)))),this.itemCount-=t}shift(t){if(this._checkCount(t),t>=this.itemCount)return this._stateRangeList.length=0,this.itemCount=0n;const e=new Set;for(const i of this._stateRangeList)i.endIndex-=t,i.endIndex<0n?e.add(i):(i.startIndex-=t,i.startIndex<0n&&(i.startIndex=0n));return e.size>0&&(this._stateRangeList=this._stateRangeList.filter((t=>!e.has(t)))),this.itemCount-=t}deleteAfter(t,e){if(this._checkCount(t),void 0===e)return this.pop(t);if(e<0n)return this.shift(t+e+1n);const i=this.itemCount-e-1n;if(0n===i)throw new RangeError(`no deletable count after index:${e}`);if(t>i)return this.pop(i);const r=new Set;for(const s of this._stateRangeList)s.endIndex>e&&(s.startIndex<e?s.endIndex-=e-s.startIndex:(s.endIndex-=t,s.endIndex<0n?r.add(s):(s.startIndex-=t,s.startIndex<0n&&(s.startIndex=0n))));return r.size>0&&(this._stateRangeList=this._stateRangeList.filter((t=>!r.has(t)))),this.itemCount-=t}}var A=Object.defineProperty,E=Object.getOwnPropertyDescriptor,P=(t,e,i,r)=>{for(var s,o=r>1?void 0:r?E(e,i):e,n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r?s(e,i,o):s(o))||o);return r&&o&&A(e,i,o),o};class D extends c{constructor(){super(),this._style=document.createElement("style"),this._dev=!1,this._intouch=!1,this._resetTemplateFactory=async()=>{await this.updateComplete;const t=this._getTemplateElement();this._tplEle!==t&&(this._tplEle=t,this._templateFactory=t?()=>{const e=t.cloneNode(!0);e.removeAttribute("slot");const i=new x(e);return i.appendChild(e),i.setAttribute("slot","item"),i}:void 0,this.refresh())},this._ob=new MutationObserver(this._resetTemplateFactory),this._viewPort=null,this.itemCountStateManager=new L((t=>{this.setAttribute("item-count",t.toString()),this._setStyle()}),{enter:"visible",leave:"hidden"},{enter:"create",leave:"destroy"},{enter:"moving",leave:"moving"}),this._itemSize=0,this._ctrlScrollPanelHeight=0,this._totalScrollHeight6e=0n,this._scrollProgress=0,this._stateInfoListEqual=(t,e)=>{if(t.length!==e.length)return!1;for(let i=0;i<t.length;++i)if(t[i].id!==e[i].id)return!1;return!0},this._DEFAULT_ANI_DURACTION=500,this.requestRenderAni=()=>{let t;t=this._intouch?performance.now():this._ani?this._ani.startTime:performance.now(),this._requestRenderAni(t,!1)},this._requestRenderAni=(t,e)=>{if(void 0===this._ani||e){const e=this._ani||(this._ani={reqFrameId:0,aniDuration:this._DEFAULT_ANI_DURACTION,startTime:t});this.itemCountStateManager.clearState(t),this._renderItems(t,e),e.reqFrameId=requestAnimationFrame((()=>{const t=performance.now();e.startTime+e.aniDuration>t?this._requestRenderAni(t,!0):(this._ani=void 0,this._clearAniState())}))}else this._ani.startTime=t},this._stretchScrollDuration=t=>{const e=(1+10*Math.abs(t)/this._ctrlScrollPanelHeight)**2;return this._DEFAULT_ANI_DURACTION*e},this._dampingScrollDiff=(t,e)=>{const i=(t-e.startTime)/e.aniDuration;return i<=0?1:i>=1?0:1-this._dampingTimingFunction(i)},this._dampingTimingFunction=function(t){return Math.sqrt(1-Math.pow(t-1,2))},this.virtualScrollTop6e=0n,this.SAFE_RENDER_TOP_6E=0n,this.MAX_VIRTUAL_SCROLL_HEIGHT_6E=0n,this._safeAreaInsetTop=0,this._safeAreaInsetBottom=0,this._inViewItems=new Map,this._pool=new O((()=>{if(!this._templateFactory)throw new Error("no found template slot");return this._templateFactory()})),this.addEventListener("renderrangechange",(t=>{var e;null==(e=this._onrenderrangechange)||e.call(this,t)})),this.__initInTouch()}static get styles(){return[h`
        :host {
          display: block;
          height: var(--viewport-height);
          overflow: hidden;
          position: relative;

          --controlbar-color: rgba(0, 0, 0, 0.1);
          --controlbar-bg-color: transparent;
          --controlbar-width: 4px;
        }

        slot[name="template"] {
          display: none;
        }
      `]}performUpdate(){const t=super.performUpdate();return this.renderRoot.appendChild(this._style),t}__initInTouch(){for(const t of["touchstart","mousedown"])this.addEventListener(t,(()=>{this._dev&&console.log(t),this._intouch=!0}),{passive:!0});for(const t of["touchcancel","touchend","mouseup"])this.addEventListener(t,(()=>{this._dev&&console.log(t),this._intouch=!1}),{passive:!0})}get viewPort(){return this._viewPort}set viewPort(t){const e=this._viewPort;e&&e.removeEventListener("viewportreisze",this.requestRenderAni),(this._viewPort=t)?(t.addEventListener("viewportreisze",this.requestRenderAni),this.requestRenderAni()):this._destroyItems()}connectedCallback(){super.connectedCallback();const t=this.viewPort=this.closest("scroll-viewport");t!==this.parentElement&&console.warn(`<${this.tagName.toLowerCase()}> should be children of <scroll-viewport>`),t||console.error(`<${this.tagName.toLowerCase()}> should be children of <scroll-viewport>`),this._ob.observe(this,{childList:!0}),this._resetTemplateFactory()}disconnectedCallback(){super.disconnectedCallback(),this.viewPort=null,this._ob.disconnect()}adoptedCallback(){this.viewPort=this.closest("scroll-viewport")}get onrenderrangechange(){return this._onrenderrangechange||null}set onrenderrangechange(t){"string"==typeof t&&(t=Function("event",`(${t})&&event.preventDefault()`)),"function"!=typeof t&&(t=void 0),this._onrenderrangechange=t}get itemCount(){return this.itemCountStateManager.itemCount}set itemCount(t){const e=(t=>{const e=w(t);return e<0n?0n:e})(t),i=this.itemCountStateManager;e!==i.itemCount&&(e>i.itemCount?i.push(e-i.itemCount):i.pop(i.itemCount-e))}get itemSize(){return this._itemSize}set itemSize(t){this._itemSize=S(t),this._setStyle()}_setStyle(){var t;this._totalScrollHeight6e=this.itemCount*T(this.itemSize),this._ctrlScrollPanelHeight=Math.min(window.screen.availHeight+((null==(t=this.viewPort)?void 0:t.viewportHeight)||window.screen.availHeight),Number(this._totalScrollHeight6e)/1e6),this._style.innerHTML=`:host {\n        --item-size: ${this.itemSize}px;\n        --item-count: ${this.itemCount};\n        --ctrl-scroll-panel-height: ${this._ctrlScrollPanelHeight}px;\n        --cache-render-top: ${this.cacheRenderTop}px;\n        --cache-render-bottom: ${this.cacheRenderBottom}px;\n    }`,this.SAFE_RENDER_TOP_6E=T(this.safeAreaInsetTop),this.MAX_VIRTUAL_SCROLL_HEIGHT_6E=T(this.itemSize)*this.itemCount+T(this.safeAreaInsetBottom)+this.SAFE_RENDER_TOP_6E,this.requestRenderAni()}get scrollProgress(){return this._scrollProgress}set scrollProgress(t){this._scrollProgress=t,this.MAX_VIRTUAL_SCROLL_HEIGHT_6E}_emitRanderItem(t,e){if(!this._rangechange_event){this._rangechange_event={collection:new Map,time:e,emitter:()=>{if(this._rangechange_event!==t)return;this._rangechange_event=void 0;const e=this._pre_rangechange_event_collection;this._pre_rangechange_event_collection=i;const r=[...i.values()].sort(((t,e)=>t.index-e.index>0n?1:-1)),s=e?r.filter((t=>{const i=e.get(t.index);return!(i&&i.isIntersecting===t.isIntersecting&&this._stateInfoListEqual(i.stateInfoList,t.stateInfoList)&&i.node===t.node)})):r;if(0===s.length)return;const o={entries:s,time:t.time};this._emitRenderRangeChange(o)}};const t=this._rangechange_event,i=this._rangechange_event.collection;queueMicrotask(t.emitter)}this._rangechange_event.collection.set(t.index,t),this._rangechange_event.time=e}_emitRenderRangeChange(t){const e=new z("renderrangechange",{detail:t,cancelable:!0,bubbles:!1,composed:!0});this.dispatchEvent(e)}get virtualScrollTop(){return this.virtualScrollTop6e/y}set virtualScrollTop(t){this.virtualScrollTop6e="number"==typeof t?T(t):t*y,this.refresh()}get virtualScrollHeight(){return this.MAX_VIRTUAL_SCROLL_HEIGHT_6E/y}get cacheRenderTop(){var t;return null!=(t=this._cacheRenderTop)?t:this.itemSize/2}set cacheRenderTop(t){this._cacheRenderTop=b(t),this._setStyle()}get cacheRenderBottom(){var t;return null!=(t=this._cacheRenderBottom)?t:this.itemSize/2}set cacheRenderBottom(t){this._cacheRenderBottom=b(t),this._setStyle()}get safeAreaInsetTop(){return this._safeAreaInsetTop}set safeAreaInsetTop(t){this._safeAreaInsetTop=b(t),this._setStyle()}get safeAreaInsetBottom(){return this._safeAreaInsetBottom}set safeAreaInsetBottom(t){this._safeAreaInsetBottom=b(t),this._setStyle()}_doScroll(t,e){const i=this.viewPort.viewportHeight,r=i+this.cacheRenderBottom+this.cacheRenderTop,s=T(r);let o=this.virtualScrollTop6e+T(t);this._dev&&console.log("virtualScrollTop6e",o);const n=0n,l=this.MAX_VIRTUAL_SCROLL_HEIGHT_6E,a=l-T(i);o<n?o=n:o>a&&(o=a),this.scrollProgress=Number(100000000n*o/a)/1e8,this.virtualScrollTop6e=o;const h=T(this.cacheRenderTop),c=o-h;let d=c-this.SAFE_RENDER_TOP_6E,u=d+s;u>l&&(u=l);const p=T(this.itemSize);let _=d/p;_<0n&&(_=0n);let m=u/p;m>=this.itemCount&&(m=this.itemCount-1n);const v=Number(d-_*p)/1e6,g=new Set;for(const[b,S]of this._inViewItems)(b<_||b>m)&&(this._emitRanderItem({index:b,node:S,stateInfoList:this.itemCountStateManager.getStateInfoListByIndex(b).map((t=>({id:t.id,state:t.state.leave,endTime:t.endTime}))),isIntersecting:!1},e),this._inViewItems.delete(b),this._pool.push(S),g.add(S));for(let b=_;b<=m;b++){let t=this._inViewItems.get(b);t||(t=this._pool.pop(),this._inViewItems.set(b,t),!1===g.delete(t)&&t.parentElement!==this&&this.appendChild(t)),this._emitRanderItem({index:b,node:t,stateInfoList:this.itemCountStateManager.getStateInfoListByIndex(b).map((t=>({id:t.id,state:t.state.enter,endTime:t.endTime}))),isIntersecting:!0},e),t.virtualTransformTop=Number(b-_)*this.itemSize-v,t.virtualVisible=!0,t.virtualIndex=Number(b-_)}if(g.size>1)for(const b of g)this.removeChild(b);else for(const b of g)b.virtualVisible=!1;const f=c+s;for(const b of this.querySelectorAll(":scope > virtual-list-custom-item")){const t=b.virtualPositionTop*y;t+T(b.itemSize)<c||t>f?b.virtualVisible=!1:(b.virtualVisible=!0,b.virtualTransformTop=Number((t+h-o)/y))}return{virtualScrollTop6e:o,MIN_VIRTUAL_SCROLL_TOP_6E:n,MAX_VIRTUAL_SCROLL_TOP_6E:a}}_destroyItems(){const t=performance.now();for(const[e,i]of this._inViewItems)this._emitRanderItem({index:e,node:i,stateInfoList:[{id:this.itemCountStateManager.uniqueStateId,state:this.itemCountStateManager.operateState.leave,endTime:0}],isIntersecting:!1},t),this._inViewItems.delete(e),this._pool.push(i),this.removeChild(i)}refresh(){this._destroyItems();for(const t of this._pool.clear())t.remove();this._setStyle()}}P([_({attribute:"onrenderrangechange"})],D.prototype,"onrenderrangechange",1),P([_({attribute:"item-count"})],D.prototype,"itemCount",1),P([_({attribute:"item-size"})],D.prototype,"itemSize",1),P([_({attribute:"cache-render-top"})],D.prototype,"cacheRenderTop",1),P([_({attribute:"cache-render-bottom"})],D.prototype,"cacheRenderBottom",1),P([_({attribute:"safe-area-inset-top"})],D.prototype,"safeAreaInsetTop",1),P([_({attribute:"safe-area-inset-bttom"})],D.prototype,"safeAreaInsetBottom",1);class O{constructor(t){this._builder=t,this._pool=[]}pop(){return this._pool.pop()||this._builder()}push(t){this._pool.push(t)}clear(){const t=this._pool;return this._pool=[],t}}class z extends CustomEvent{}var k=Object.defineProperty,H=Object.getOwnPropertyDescriptor,M=(t,e,i,r)=>{for(var s,o=r>1?void 0:r?H(e,i):e,n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r?s(e,i,o):s(o))||o);return r&&o&&k(e,i,o),o};const U=h`
  :host #virtual-list-view-wrapper {
    height: 0;

    position: sticky;
    top: 0;
    transform: translateY(calc(var(--cache-render-top) * -1));
    z-index: 1;
  }
  :host #virtual-list-view {
    padding-top: var(--cache-render-top);
    padding-bottom: var(--cache-render-bottom);
    height: var(--viewport-height);
    width: 100%;

    overflow: hidden;
    contain: strict;
    transform: translate3d(0, 0, 0);
  }
`;let V=class extends D{constructor(){super(...arguments),this._preScrollTop=-1,this._preScrollDiff=0}static get styles(){return[...super.styles,h`
        :host > #scroll-ctrl {
          height: 100%;
          width: 100%;

          position: absolute;
          top: 0;
          z-index: 1;
          height: 100%;
          scroll-snap-type: y mandatory;
          overflow: auto; /**对于不支持overlay的需要回退到使用auto */
          overflow: overlay;
          scrollbar-color: var(--controlbar-color) var(--controlbar-bg-color);
          scrollbar-width: thin;

          scroll-behavior: smooth;
        }
        :host > #scroll-ctrl::-webkit-scrollbar {
          width: var(--controlbar-width);
          background-color: var(--controlbar-bg-color);
        }
        :host > #scroll-ctrl::-webkit-scrollbar-thumb {
          background-color: var(--controlbar-color);
          border-radius: calc(var(--controlbar-width) * 0.5);
        }
        :host > #scroll-ctrl .top,
        :host > #scroll-ctrl .bottom {
          content: " ";
          display: block;
          visibility: hidden;
          height: var(--ctrl-scroll-panel-height);
        }
        :host > #scroll-ctrl .center {
          scroll-snap-align: center;
          /* height: 0; */
          height: var(--viewport-height);
        }
      `,U]}render(){return d`
      <slot name="template"></slot>
      <div id="scroll-ctrl" part="scroll-ctrl" @scroll=${this.requestRenderAni}>
        <div id="virtual-list-view-wrapper">
          <div id="virtual-list-view" part="virtual-list-view">
            <slot></slot>
            <slot name="item"></slot>
          </div>
        </div>
        <div class="top"></div>
        <div class="center"></div>
        <div class="bottom"></div>
      </div>
    `}_getTemplateElement(){return this._tplSlot.assignedElements()[0]}_renderItems(t,e){if(!this.viewPort||!this._templateFactory)return;const i=(r=this._scrollCtrl.scrollTop,Math.floor(100*r)/100);var r;const s=this._ctrlScrollPanelHeight,o=-1===this._preScrollTop?s:this._preScrollTop;this._preScrollTop=i;let n=0,l=!0;i>s&&(i>o||this._intouch)||i<s&&(i<o||this._intouch)?n=i-o:l=!1,l?(this._preScrollDiff=n,e.aniDuration=this._stretchScrollDuration(n)):n=this._preScrollDiff*this._dampingScrollDiff(t,e),this._doScroll(n,t)}_clearAniState(){this._preScrollDiff=0}};M([m(":host #scroll-ctrl",!0)],V.prototype,"_scrollCtrl",2),M([m('slot[name="template"]',!0)],V.prototype,"_tplSlot",2),V=M([u("fixed-size-virtual-list-s1")],V);var q=Object.defineProperty,N=Object.getOwnPropertyDescriptor,F=(t,e,i,r)=>{for(var s,o=r>1?void 0:r?N(e,i):e,n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r?s(e,i,o):s(o))||o);return r&&o&&q(e,i,o),o};let B=class extends D{constructor(){super(...arguments),this._preScrollDiff=0,this._preScrollUpTop=0,this._preScrollDownTop=0}static get styles(){return[...super.styles,h`
        :host > #scroll-ctrl {
          height: 100%;
          width: 100%;

          position: absolute;
          top: 0;
          z-index: 1;
        }
        :host .scroll-dir .top,
        :host .scroll-dir .bottom {
          content: " ";
          display: block;
          visibility: hidden;
          height: var(--ctrl-scroll-panel-height);
        }
        :host .scroll-dir .center {
          scroll-snap-align: center;
          height: 0;
        }
        :host .scroll-dir {
          height: 100%;
          scroll-snap-type: y mandatory;
          overflow: auto; /**对于不支持overlay的需要回退到使用auto */
          overflow: overlay;
          scrollbar-color: var(--controlbar-color) var(--controlbar-bg-color);
          scrollbar-width: thin;
        }
        :host .scroll-dir.unscroll {
          overflow: hidden;
        }
        :host #scroll-down {
          position: sticky;
          left: 0;
          top: 0;
        }
        :host .scroll-dir::-webkit-scrollbar {
          width: var(--controlbar-width);
          background-color: var(--controlbar-bg-color);
        }
        :host .scroll-dir::-webkit-scrollbar-thumb {
          background-color: var(--controlbar-color);
          border-radius: calc(var(--controlbar-width) * 0.5);
        }
      `,U]}render(){return d`
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
    `}_getTemplateElement(){return this._tplSlot.assignedElements()[0]}_renderItems(t,e){if(!this.viewPort||!this._templateFactory)return;const i=this._scrollCtrlUp.scrollTop,r=this._scrollCtrlDown.scrollTop,s=i-this._preScrollUpTop,o=r-this._preScrollDownTop;this._preScrollUpTop=i,this._preScrollDownTop=r;let n=0,l=!0;o>0||o<0&&this._intouch?(n=o,this._scrollCtrlUp.scrollTop=0,this._preScrollUpTop=this._scrollCtrlUp.scrollTop,this.viewPort.scrollTop=0):s<0||s>0&&this._intouch?(n=s,this._scrollCtrlDown.scrollTop=0,this._preScrollDownTop=this._scrollCtrlDown.scrollTop,this.viewPort.scrollTop=0):l=!1,l?(this._preScrollDiff=n,e.aniDuration=this._stretchScrollDuration(n)):n=this._preScrollDiff*this._dampingScrollDiff(t,e),this._dev&&console.log("scrollUpDiff",s,"scrollDownDiff",o,"scrollDiff",n);const{virtualScrollTop6e:a,MIN_VIRTUAL_SCROLL_TOP_6E:h,MAX_VIRTUAL_SCROLL_TOP_6E:c}=this._doScroll(n,t);this._scrollCtrlUp.classList.toggle("unscroll",a===h),this._scrollCtrlDown.classList.toggle("unscroll",a===c)}_clearAniState(){this._preScrollDiff=0}};F([m(":host #scroll-up",!0)],B.prototype,"_scrollCtrlUp",2),F([m(":host #scroll-down",!0)],B.prototype,"_scrollCtrlDown",2),F([m('slot[name="template"]',!0)],B.prototype,"_tplSlot",2),B=F([u("fixed-size-virtual-list-s2")],B);var j=Object.defineProperty,$=Object.getOwnPropertyDescriptor,X=(t,e,i,r)=>{for(var s,o=r>1?void 0:r?$(e,i):e,n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r?s(e,i,o):s(o))||o);return r&&o&&j(e,i,o),o};let G=class extends I{constructor(){super(...arguments),this._virtualPositionTop=0n,this._itemSize=0}get virtualPositionTop(){return this._virtualPositionTop}set virtualPositionTop(t){this._virtualPositionTop=w(t),this._updateVirtualScrollRender()}get itemSize(){return this._itemSize}set itemSize(t){this._itemSize=S(t),this._updateStyles(),this._updateVirtualScrollRender()}_getHostCssText(){return`--item-size:${this._itemSize}px;${super._getHostCssText()}`}_updateVirtualScrollRender(){var t,e;null==(e=null==(t=this.parentElement)?void 0:t.requestRenderAni)||e.call(t)}};X([_({attribute:"position-top"})],G.prototype,"virtualPositionTop",1),X([_({attribute:"item-size"})],G.prototype,"itemSize",1),G=X([u("virtual-list-custom-item")],G);
