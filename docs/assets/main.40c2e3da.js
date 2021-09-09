var t=Object.defineProperty,e=Object.defineProperties,r=Object.getOwnPropertyDescriptors,i=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,s=Object.prototype.propertyIsEnumerable,n=(e,r,i)=>r in e?t(e,r,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[r]=i,a=(t,e)=>{for(var r in e||(e={}))o.call(e,r)&&n(t,r,e[r]);if(i)for(var r of i(e))s.call(e,r)&&n(t,r,e[r]);return t},l=(t,i)=>e(t,r(i));import{c,L as h,h as d,a as u,s as p,p as _,q as m}from"./vendor.7f148f7f.js";!function(){const t=document.createElement("link").relList;if(!(t&&t.supports&&t.supports("modulepreload"))){for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver((t=>{for(const r of t)if("childList"===r.type)for(const t of r.addedNodes)"LINK"===t.tagName&&"modulepreload"===t.rel&&e(t)})).observe(document,{childList:!0,subtree:!0})}function e(t){if(t.ep)return;t.ep=!0;const e=function(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerpolicy&&(e.referrerPolicy=t.referrerpolicy),"use-credentials"===t.crossorigin?e.credentials="include":"anonymous"===t.crossorigin?e.credentials="omit":e.credentials="same-origin",e}(t);fetch(t.href,e)}}();var f=Object.defineProperty,g=Object.getOwnPropertyDescriptor;let v=class extends h{constructor(){super(...arguments),this.viewportHeight=0,this.viewportWidth=0,this._resize_ob=new ResizeObserver((t=>{for(const e of t)e.target===this&&(this.style.setProperty("--viewport-height",(this.viewportHeight=e.contentRect.height)+"px"),this.style.setProperty("--viewport-width",(this.viewportWidth=e.contentRect.width)+"px"),this.dispatchEvent(new CustomEvent("viewportreisze",{detail:e.contentRect})))}))}connectedCallback(){super.connectedCallback(),this._resize_ob.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._resize_ob.disconnect()}render(){return d`
      <aside id="top" part="bounce-top">
        <slot name="bounce-top"></slot>
      </aside>
      <slot></slot>
      <aside id="bottom" part="bounce-bottom">
        <slot name="bounce-bottom"></slot>
      </aside>
    `}};v.styles=c`
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
  `,v=((t,e,r,i)=>{for(var o,s=i>1?void 0:i?g(e,r):e,n=t.length-1;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&f(e,r,s),s})([u("scroll-viewport")],v);const S=t=>{const e=parseFloat(t+"")||0;return isFinite(e)?e:0},b=t=>{const e=S(t);return e<0?0:e},w=t=>{try{return BigInt(parseInt(t+""))||0n}catch{return 0n}},T=1000000n,I=t=>BigInt(Math.floor(1e6*t));class y extends h{constructor(){super(...arguments),this._virtualTransformTop=0,this._virtualVisible=!1,this._virtualIndex=0,this._updating=!1,this._doUpdateStyles=p?(()=>{const t=new CSSStyleSheet;return this.shadowRoot.adoptedStyleSheets=[this.constructor.styles.styleSheet,t],()=>{this._updating=!1,t.replace(`:host{${this._getHostCssText()}}`)}})():()=>{this._updating=!1,this.style.cssText=this._getHostCssText()}}get virtualTransformTop(){return this._virtualTransformTop}set virtualTransformTop(t){this._virtualTransformTop=t,this._updateStyles()}get virtualVisible(){return this._virtualVisible}set virtualVisible(t){this._virtualVisible=t,this._updateStyles()}get virtualIndex(){return this._virtualIndex}set virtualIndex(t){this._virtualIndex=t,this._updateStyles()}_updateStyles(){this._updating||(this._updating=!0,queueMicrotask(this._doUpdateStyles))}_getHostCssText(){let t;return t=this._virtualVisible?`--virtual-transform:translateY(${this._virtualTransformTop}px);--virtual-index:${this._virtualIndex}`:"--virtual-display:none",t}render(){return d`<slot></slot>`}}y.styles=c`
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
  `;var C=Object.defineProperty,R=Object.getOwnPropertyDescriptor;let x=class extends y{constructor(t){super(),this.contentNode=t,this.appendChild(t)}};x=((t,e,r,i)=>{for(var o,s=i>1?void 0:i?R(e,r):e,n=t.length-1;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&C(e,r,s),s})([u("virtual-list-default-item")],x);class L{constructor(t,e,r,i,o){this.onItemCountChanged=t,this.defaultState=e,this.operateState=r,this.movementState=i,this._customStateInfoGetter=o,this._stateIdAcc=1,this._itemCount=0n,this._stateRangeList=[]}get uniqueStateId(){return this._stateIdAcc++}get itemCount(){return this._itemCount}set itemCount(t){this._itemCount=t,this.onItemCountChanged(t)}getStateInfoListByIndex(t){const e=[];for(const r of this._stateRangeList)r.startIndex<=t&&t<=r.endIndex&&e.push({id:r.id,state:r.state,endTime:r.endTime});return e.push({id:0,state:this.defaultState,endTime:1/0}),this._customStateInfoGetter&&e.push(this._customStateInfoGetter(t)),e}setState(t,e,r={}){const i={id:this.uniqueStateId,startIndex:t,endIndex:e,state:r.state||this.operateState,endTime:r.duration?performance.now()+r.duration:0};return this._stateRangeList.unshift(i),i}clearState(t){this._stateRangeList=this._stateRangeList.filter((e=>e.endTime>t))}_checkCount(t){if(t<=0n)throw new RangeError("count less then or equal to zero")}push(t,e={}){this._checkCount(t);const r=this.itemCount,i=r+t-1n;return this.setState(r,i,e),this.itemCount+=t}unshift(t,e={}){this._checkCount(t);const r=t;for(const i of this._stateRangeList)i.startIndex+=t,i.endIndex+=t;return this.setState(0n,r,e),0n!==this.itemCount&&this.setState(r+1n,this.itemCount+t-1n,l(a({},e),{state:this.movementState})),this.itemCount+=t}insertBefore(t,e,r={}){if(this._checkCount(t),void 0===e||e>=this.itemCount)return this.push(t,r);let i=e+t-1n;if(i<0n)throw new RangeError(`no items for insert ${t} before ${e}`);let o=e;if(o<0n)return o=0n,this.unshift(i+1n,r);for(const s of this._stateRangeList)s.startIndex>=e?(s.startIndex+=t,s.endIndex+=t):s.startIndex<e&&s.endIndex<=e&&(s.endIndex+=e-s.startIndex);return this.setState(o,i,r),this.setState(i+1n,this.itemCount+t-1n,l(a({},r),{state:this.movementState})),this.itemCount+=t}pop(t){if(this._checkCount(t),t>=this.itemCount)return this._stateRangeList.length=0,this.itemCount=0n;const e=this.itemCount-1n,r=new Set;for(const i of this._stateRangeList)i.endIndex>e&&(i.endIndex=e,i.endIndex>i.startIndex&&r.add(i));return r.size>0&&(this._stateRangeList=this._stateRangeList.filter((t=>!r.has(t)))),this.itemCount-=t}shift(t){if(this._checkCount(t),t>=this.itemCount)return this._stateRangeList.length=0,this.itemCount=0n;const e=new Set;for(const r of this._stateRangeList)r.endIndex-=t,r.endIndex<0n?e.add(r):(r.startIndex-=t,r.startIndex<0n&&(r.startIndex=0n));return e.size>0&&(this._stateRangeList=this._stateRangeList.filter((t=>!e.has(t)))),this.itemCount-=t}deleteAfter(t,e){if(this._checkCount(t),void 0===e)return this.pop(t);if(e<0n)return this.shift(t+e+1n);const r=this.itemCount-e-1n;if(0n===r)throw new RangeError(`no deletable count after index:${e}`);if(t>r)return this.pop(r);const i=new Set;for(const o of this._stateRangeList)o.endIndex>e&&(o.startIndex<e?o.endIndex-=e-o.startIndex:(o.endIndex-=t,o.endIndex<0n?i.add(o):(o.startIndex-=t,o.startIndex<0n&&(o.startIndex=0n))));return i.size>0&&(this._stateRangeList=this._stateRangeList.filter((t=>!i.has(t)))),this.itemCount-=t}}var A=Object.defineProperty,E=Object.getOwnPropertyDescriptor,P=(t,e,r,i)=>{for(var o,s=i>1?void 0:i?E(e,r):e,n=t.length-1;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&A(e,r,s),s};class D extends h{constructor(){super(),this._style=document.createElement("style"),this._debug_=!1,this._intouch=!1,this._resetTemplateFactory=async()=>{await this.updateComplete;const t=this._getTemplateElement();this._tplEle!==t&&(this._tplEle=t,this._templateFactory=t?()=>{const e=t.cloneNode(!0);e.removeAttribute("slot");const r=new x(e);return r.appendChild(e),r.setAttribute("slot","item"),r}:void 0,this.refresh())},this._ob=new MutationObserver(this._resetTemplateFactory),this._viewPort=null,this._itemCountStateManager=new L((t=>{this.setAttribute("item-count",t.toString()),this._setStyle()}),{enter:"visible",leave:"hidden"},{enter:"create",leave:"destroy"},{enter:"moving",leave:"moving"}),this._itemSize=0,this._ctrlScrollPanelHeight=0,this._totalScrollHeight6e=0n,this._scrollProgress=0,this._stateInfoListEqual=(t,e)=>{if(t.length!==e.length)return!1;for(let r=0;r<t.length;++r)if(t[r].id!==e[r].id)return!1;return!0},this._DEFAULT_ANI_DURACTION=500,this._requestRenderAni0=()=>this.requestRenderAni(0),this.requestRenderAni=(t=0)=>{let e;e=this._intouch?performance.now():this._ani?this._ani.startTime:performance.now(),this._requestRenderAni(e,!1,t)},this._requestRenderAni=(t,e,r)=>{if(void 0===this._ani||e){const e=this._ani||(this._ani={reqFrameId:0,aniDuration:r||0,startTime:t});this._itemCountStateManager.clearState(t),e.reqFrameId=requestAnimationFrame((()=>{const t=performance.now();e.startTime+e.aniDuration>t?this._requestRenderAni(t,!0,0):(this._ani=void 0,this._clearAniState()),this._renderItems(t,e)}))}else r&&this._ani.aniDuration+this._ani.startTime<r+t&&(this._ani.aniDuration=r),this._ani.startTime=t},this._stretchScrollDuration=t=>{const e=(1+10*Math.abs(t)/this._ctrlScrollPanelHeight)**2;return this._DEFAULT_ANI_DURACTION*e},this._dampingScrollDiff=(t,e)=>{const r=0===e.aniDuration?1:(t-e.startTime)/e.aniDuration;if(r<=0)return{progress:0,forward:1,backward:0};if(r>=1)return{progress:1,forward:0,backward:1};return{progress:r,forward:1-this._dampingTimingFunction(r),backward:1}},this._dampingTimingFunction=function(t){return Math.sqrt(1-Math.pow(t-1,2))},this.virtualScrollTop6e=0n,this.SAFE_RENDER_TOP_6E=0n,this.MAX_VIRTUAL_SCROLL_HEIGHT_6E=0n,this._safeAreaInsetTop=0,this._safeAreaInsetBottom=0,this._inViewItems=new Map,this._pool=new z((()=>{if(!this._templateFactory)throw new Error("no found template slot");return this._templateFactory()})),this.addEventListener("renderrangechange",(t=>{var e;null==(e=this._onrenderrangechange)||e.call(this,t)})),this.__initInTouch()}static get styles(){return[c`
        :host {
          display: block;
          width: var(--viewport-width, 100%);
          height: var(--viewport-height, 100%);
          overflow: hidden;
          position: relative;

          --controlbar-color: rgba(0, 0, 0, 0.1);
          --controlbar-bg-color: transparent;
          --controlbar-width: 4px;
        }
        :host::after {
          content: "context error";
          text-transform: uppercase;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          position: absolute;
          backdrop-filter: blur(1em) brightness(0.3);
          z-index: 10;
        }
        :host-context(scroll-viewport)::after {
          content: none;
        }

        slot[name="template"] {
          display: none;
        }
      `]}performUpdate(){const t=super.performUpdate();return this.renderRoot.appendChild(this._style),t}__initInTouch(){for(const t of["touchstart","mousedown"])this.addEventListener(t,(()=>{this._debug_&&console.log(t),this._intouch=!0}),{passive:!0});for(const t of["touchcancel","touchend","mouseup"])this.addEventListener(t,(()=>{this._debug_&&console.log(t),this._intouch=!1}),{passive:!0})}get viewPort(){return this._viewPort}set viewPort(t){const e=this._viewPort;e&&e.removeEventListener("viewportreisze",this._requestRenderAni0),(this._viewPort=t)?(t.addEventListener("viewportreisze",this._requestRenderAni0),this.requestRenderAni()):this._destroyItems()}connectedCallback(){super.connectedCallback();const t=this.viewPort=this.closest("scroll-viewport");t!==this.parentElement&&console.warn(`<${this.tagName.toLowerCase()}> should be children of <scroll-viewport>`),t||console.error(`<${this.tagName.toLowerCase()}> should be children of <scroll-viewport>`),this._ob.observe(this,{childList:!0}),this._resetTemplateFactory()}disconnectedCallback(){super.disconnectedCallback(),this.viewPort=null,this._ob.disconnect()}adoptedCallback(){this.viewPort=this.closest("scroll-viewport")}get onrenderrangechange(){return this._onrenderrangechange||null}set onrenderrangechange(t){"string"==typeof t&&(t=Function("event",`(${t})&&event.preventDefault()`)),"function"!=typeof t&&(t=void 0),this._onrenderrangechange=t}get itemCount(){return this._itemCountStateManager.itemCount}set itemCount(t){const e=(t=>{const e=w(t);return e<0n?0n:e})(t),r=this._itemCountStateManager;e!==r.itemCount&&(e>r.itemCount?r.push(e-r.itemCount):r.pop(r.itemCount-e))}get itemCountStateManager(){return this._itemCountStateManager}static customItemCountStateManager(t,e){const r=t;return r._itemCountStateManager._customStateInfoGetter=e,r}get itemSize(){return this._itemSize}set itemSize(t){this._itemSize=b(t),this._setStyle()}_setStyle(){var t;this._totalScrollHeight6e=this.itemCount*I(this.itemSize),this._ctrlScrollPanelHeight=Math.min(window.screen.availHeight+((null==(t=this.viewPort)?void 0:t.viewportHeight)||window.screen.availHeight),Number(this._totalScrollHeight6e)/1e6),this._style.innerHTML=`:host {\n        --item-size: ${this.itemSize}px;\n        --item-count: ${this.itemCount};\n        --ctrl-scroll-panel-height: ${this._ctrlScrollPanelHeight}px;\n        --cache-render-top: ${this.cacheRenderTop}px;\n        --cache-render-bottom: ${this.cacheRenderBottom}px;\n    }`,this.SAFE_RENDER_TOP_6E=I(this.safeAreaInsetTop),this.MAX_VIRTUAL_SCROLL_HEIGHT_6E=I(this.itemSize)*this.itemCount+I(this.safeAreaInsetBottom)+this.SAFE_RENDER_TOP_6E,this.requestRenderAni()}get scrollProgress(){return this._scrollProgress}set scrollProgress(t){this._scrollProgress=t,this.MAX_VIRTUAL_SCROLL_HEIGHT_6E}_collectionRanderItem(t,e){if(this._debug_&&console.log("collection maybe change",t.index,t.stateInfoList),!this._rangechange_event){this._rangechange_event={collection:new Map,time:e,emitter:()=>{if(this._rangechange_event!==t)return;this._rangechange_event=void 0;const e=this._pre_rangechange_event_collection;this._pre_rangechange_event_collection=r;const i=[...r.values()].sort(((t,e)=>t.index-e.index>0n?1:-1)),o=e?i.filter((t=>{const r=e.get(t.index);return!(r&&r.isIntersecting===t.isIntersecting&&this._stateInfoListEqual(r.stateInfoList,t.stateInfoList)&&r.node===t.node)})):i;if(0===o.length)return;return{entries:o,time:t.time}}};const t=this._rangechange_event,r=this._rangechange_event.collection;queueMicrotask(t.emitter)}this._rangechange_event.collection.set(t.index,t),this._rangechange_event.time=e}_emitRenderRangeChange(){if(!this._rangechange_event)return;const t=this._rangechange_event.emitter();if(!t)return;this._debug_&&console.log("emit changes",t);const{updateComplete:e}=this;this._preCompletedUpdate!==e?e.then((()=>{this._preCompletedUpdate=e,this.__emitRenderRangeChange(t)})):this.__emitRenderRangeChange(t)}__emitRenderRangeChange(t){const e=new O("renderrangechange",{detail:t,cancelable:!0,bubbles:!1,composed:!0});this.dispatchEvent(e)}get virtualScrollTop(){return this.virtualScrollTop6e/T}set virtualScrollTop(t){"string"==typeof t&&(t=+t),this.virtualScrollTop6e="number"==typeof t?I(t):t*T,this.requestRenderAni()}get virtualScrollHeight(){return this.MAX_VIRTUAL_SCROLL_HEIGHT_6E/T}virtualScrollTo(t,e={}){var r;const i=I(S(t)),o=this.virtualScrollTop6e-i,s=null!=(r=e.duration)?r:50*Math.min(Math.max(0,Math.log2(Math.abs(Number(-o/T)))),50);if(0===s)return this.virtualScrollTop6e=i,void this.requestRenderAni();const n={reqFrameId:0,startTime:performance.now(),aniDuration:s},a=()=>{const{progress:t,forward:e}=this._dampingScrollDiff(performance.now(),n),r=o*I(e)/T;this.virtualScrollTop6e=r,this.requestRenderAni(),1!==t&&(n.reqFrameId=requestAnimationFrame(a))};a()}get cacheRenderTop(){var t;return null!=(t=this._cacheRenderTop)?t:this.itemSize/2}set cacheRenderTop(t){this._cacheRenderTop=S(t),this._setStyle()}get cacheRenderBottom(){var t;return null!=(t=this._cacheRenderBottom)?t:this.itemSize/2}set cacheRenderBottom(t){this._cacheRenderBottom=S(t),this._setStyle()}get safeAreaInsetTop(){return this._safeAreaInsetTop}set safeAreaInsetTop(t){this._safeAreaInsetTop=S(t),this._setStyle()}get safeAreaInsetBottom(){return this._safeAreaInsetBottom}set safeAreaInsetBottom(t){this._safeAreaInsetBottom=S(t),this._setStyle()}_doScroll(t,e){const r=this.viewPort.viewportHeight,i=r+this.cacheRenderBottom+this.cacheRenderTop,o=I(i);let s=this.virtualScrollTop6e+I(t);this._debug_&&console.log("virtualScrollTop6e",s);const n=0n,a=this.MAX_VIRTUAL_SCROLL_HEIGHT_6E,l=a-I(r);s<n?s=n:s>l&&(s=l),this.scrollProgress=Number(100000000n*s/l)/1e8,this.virtualScrollTop6e=s;const c=I(this.cacheRenderTop),h=s-c;let d=h-this.SAFE_RENDER_TOP_6E,u=d+o;u>a&&(u=a);const p=I(this.itemSize);let _=d/p;_<0n&&(_=0n);let m=u/p;m>=this.itemCount&&(m=this.itemCount-1n);const f=Number(d-_*p)/1e6,g=new Set;for(const[S,b]of this._inViewItems)(S<_||S>m)&&(this._collectionRanderItem({index:S,node:b,stateInfoList:this._itemCountStateManager.getStateInfoListByIndex(S).map((t=>({id:t.id,state:t.state.leave,endTime:t.endTime}))),isIntersecting:!1},e),this._inViewItems.delete(S),this._pool.push(b),g.add(b));for(let S=_;S<=m;S++){let t=this._inViewItems.get(S);t||(t=this._pool.pop(),this._inViewItems.set(S,t),!1===g.delete(t)&&t.parentElement!==this&&this.appendChild(t)),this._collectionRanderItem({index:S,node:t,stateInfoList:this._itemCountStateManager.getStateInfoListByIndex(S).map((t=>({id:t.id,state:t.state.enter,endTime:t.endTime}))),isIntersecting:!0},e),t.virtualTransformTop=Number(S-_)*this.itemSize-f,t.virtualVisible=!0,t.virtualIndex=Number(S-_)}if(g.size>1)for(const S of g)this.removeChild(S);else for(const S of g)S.virtualVisible=!1;const v=h+o;for(const S of this.querySelectorAll(":scope > virtual-list-custom-item")){const t=S.virtualPositionTop*T;t+I(S.itemSize)<h||t>v?S.virtualVisible=!1:(S.virtualVisible=!0,S.virtualTransformTop=Number((t+c-s)/T))}return{virtualScrollTop6e:s,MIN_VIRTUAL_SCROLL_TOP_6E:n,MAX_VIRTUAL_SCROLL_TOP_6E:l}}_destroyItems(){const t=performance.now();for(const[e,r]of this._inViewItems)this._collectionRanderItem({index:e,node:r,stateInfoList:[{id:this._itemCountStateManager.uniqueStateId,state:this._itemCountStateManager.operateState.leave,endTime:0}],isIntersecting:!1},t),this._inViewItems.delete(e),this._pool.push(r),this.removeChild(r)}refresh(){this._destroyItems();for(const t of this._pool.clear())t.remove();this._setStyle()}}P([_({attribute:"onrenderrangechange"})],D.prototype,"onrenderrangechange",1),P([_({attribute:"item-count"})],D.prototype,"itemCount",1),P([_({attribute:"item-size"})],D.prototype,"itemSize",1),P([_({attribute:"cache-render-top"})],D.prototype,"cacheRenderTop",1),P([_({attribute:"cache-render-bottom"})],D.prototype,"cacheRenderBottom",1),P([_({attribute:"safe-area-inset-top"})],D.prototype,"safeAreaInsetTop",1),P([_({attribute:"safe-area-inset-bottom"})],D.prototype,"safeAreaInsetBottom",1);class z{constructor(t){this._builder=t,this._pool=[]}pop(){return this._pool.pop()||this._builder()}push(t){this._pool.push(t)}clear(){const t=this._pool;return this._pool=[],t}}class O extends CustomEvent{}var M=Object.defineProperty,k=Object.getOwnPropertyDescriptor,q=(t,e,r,i)=>{for(var o,s=i>1?void 0:i?k(e,r):e,n=t.length-1;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&M(e,r,s),s};const $=c`
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
`;let N=class extends D{constructor(){super(...arguments),this._preScrollTop=-1,this._preScrollDiff=0}static get styles(){return[...super.styles,c`
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
      `,$]}render(){return d`
      <slot name="template"></slot>
      <div
        id="scroll-ctrl"
        part="scroll-ctrl"
        @scroll=${()=>this.requestRenderAni(this._DEFAULT_ANI_DURACTION)}
      >
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
    `}_getTemplateElement(){return this._tplSlot.assignedElements()[0]}_renderItems(t,e){if(!this.viewPort||!this._templateFactory)return;const r=(i=this._scrollCtrl.scrollTop,Math.floor(100*i)/100);var i;const o=this._ctrlScrollPanelHeight,s=-1===this._preScrollTop?o:this._preScrollTop;this._preScrollTop=r;let n=0,a=!0;r>o&&(r>s||this._intouch)||r<o&&(r<s||this._intouch)?n=r-s:a=!1,a?(this._preScrollDiff=n,e.aniDuration=this._stretchScrollDuration(n)):n=this._preScrollDiff*this._dampingScrollDiff(t,e).forward,this._doScroll(n,t),this._emitRenderRangeChange()}_clearAniState(){this._preScrollDiff=0}customItemCountStateManager(t){return N.customItemCountStateManager(this,t)}};q([m(":host #scroll-ctrl",!0)],N.prototype,"_scrollCtrl",2),q([m('slot[name="template"]',!0)],N.prototype,"_tplSlot",2),N=q([u("fixed-size-virtual-list-s1")],N);var H=Object.defineProperty,U=Object.getOwnPropertyDescriptor,V=(t,e,r,i)=>{for(var o,s=i>1?void 0:i?U(e,r):e,n=t.length-1;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&H(e,r,s),s};let F=class extends D{constructor(){super(...arguments),this._preScrollDiff=0,this._preScrollUpTop=0,this._preScrollDownTop=0}static get styles(){return[...super.styles,c`
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
      `,$]}render(){return d`
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
    `}_getTemplateElement(){return this._tplSlot.assignedElements()[0]}_renderItems(t,e){if(!this.viewPort||!this._templateFactory)return;const r=this._scrollCtrlUp.scrollTop,i=this._scrollCtrlDown.scrollTop,o=r-this._preScrollUpTop,s=i-this._preScrollDownTop;this._preScrollUpTop=r,this._preScrollDownTop=i;let n=0,a=!0;s>0||s<0&&this._intouch?(n=s,this._scrollCtrlUp.scrollTop=0,this._preScrollUpTop=this._scrollCtrlUp.scrollTop,this.viewPort.scrollTop=0):o<0||o>0&&this._intouch?(n=o,this._scrollCtrlDown.scrollTop=0,this._preScrollDownTop=this._scrollCtrlDown.scrollTop,this.viewPort.scrollTop=0):a=!1,a?(this._preScrollDiff=n,e.aniDuration=this._stretchScrollDuration(n)):n=this._preScrollDiff*this._dampingScrollDiff(t,e).forward,this._debug_&&console.log("scrollUpDiff",o,"scrollDownDiff",s,"scrollDiff",n);const{virtualScrollTop6e:l,MIN_VIRTUAL_SCROLL_TOP_6E:c,MAX_VIRTUAL_SCROLL_TOP_6E:h}=this._doScroll(n,t);this._scrollCtrlUp.classList.toggle("unscroll",l===c),this._scrollCtrlDown.classList.toggle("unscroll",l===h),this._emitRenderRangeChange()}_clearAniState(){this._preScrollDiff=0}};V([m(":host #scroll-up",!0)],F.prototype,"_scrollCtrlUp",2),V([m(":host #scroll-down",!0)],F.prototype,"_scrollCtrlDown",2),V([m('slot[name="template"]',!0)],F.prototype,"_tplSlot",2),F=V([u("fixed-size-virtual-list-s2")],F);var B=Object.defineProperty,j=Object.getOwnPropertyDescriptor,G=(t,e,r,i)=>{for(var o,s=i>1?void 0:i?j(e,r):e,n=t.length-1;n>=0;n--)(o=t[n])&&(s=(i?o(e,r,s):o(s))||s);return i&&s&&B(e,r,s),s};let Y=class extends y{constructor(){super(...arguments),this._virtualPositionTop=0n,this._itemSize=0}get virtualPositionTop(){return this._virtualPositionTop}set virtualPositionTop(t){this._virtualPositionTop=w(t),this._updateVirtualScrollRender()}get itemSize(){return this._itemSize}set itemSize(t){this._itemSize=b(t),this._updateStyles(),this._updateVirtualScrollRender()}_getHostCssText(){return`--item-size:${this._itemSize}px;${super._getHostCssText()}`}_updateVirtualScrollRender(){var t,e;null==(e=null==(t=this.parentElement)?void 0:t.requestRenderAni)||e.call(t)}};G([_({attribute:"position-top"})],Y.prototype,"virtualPositionTop",1),G([_({attribute:"item-size"})],Y.prototype,"itemSize",1),Y=G([u("virtual-list-custom-item")],Y);const X=document.getElementById("l"),W=X.customItemCountStateManager((t=>({id:`h-${X.itemCount-t}`,state:{enter:"height",leave:"height"},endTime:1/0})));W.addEventListener("renderrangechange",(function(t){const{entries:e,time:r}=t.detail;for(const{node:i,index:o,stateInfoList:s,isIntersecting:n}of e)if(t.target.className,n){const t=W.itemCount-o,e=i.querySelector("[name=height]");(e.firstChild||e).textContent=String(t);const n=i.querySelector("[name=state]");(n.firstChild||n).textContent=s.map((t=>`${t.state}-${t.id}-${t.endTime.toFixed(2)}`)).join("\n");{let t=0,e=0,o=0,n=0;for(const i of s)if("moving"===i.state){const t=i.endTime-r;o+=t/200*W.itemSize,n=Math.max(t,n)}else if("create"===i.state){const o=i.endTime-r;t=o/200,e=o}for(const r of i.contentNode.getAnimations())r.cancel();const a=0!==o&&n>0?{from:-o,to:0,duration:n}:void 0,l=0!==t&&e>0?{from:1-t,to:1,duration:e}:void 0;if(a&&l){const t=[{transform:`translateY(${a.from}px) scale(${l.from})`,offset:0}];let e;if(l.duration>a.duration){e=l.duration;const r=a.duration/e;t.push({transform:`translateY(${a.to}px) scale(${l.from+(l.to-l.from)*r})`,offset:r},{transform:`scale(${l.to})`,offset:1})}else{e=a.duration;const r=l.duration/e;t.push({transform:`translateY(${a.from+(a.to-a.from)*r}px) scale(${l.to})`,offset:r},{transform:`translateY(${a.to}px)`,offset:1})}i.contentNode.animate(t,e)}else a?i.contentNode.animate([{transform:`translateY(${a.from}px)`},{transform:`translateY(${a.to}px)`}],a.duration):l&&i.contentNode.animate([{transform:`scale(${l.from})`},{transform:`scale(${l.to})`}],l.duration)}i.contentNode.classList.toggle("first",0n===o)}})),Reflect.set(self,"gotoTop",(function(){W.virtualScrollTo(0)})),Reflect.set(self,"insertItem",(function(){W.itemCountStateManager.insertBefore(1n,0n,{duration:200})})),Reflect.set(self,"insertAndScroll",(function(){W.virtualScrollTop<=2.5*W.itemSize?W.itemCountStateManager.insertBefore(1n,0n,{duration:200}):(W.itemCountStateManager.insertBefore(1n,0n,{duration:0}),console.log("size:%s, count:%s, total:%s",BigInt(1*W.itemSize),1,W.itemCount),W.virtualScrollTop=W.virtualScrollTop+BigInt(1*W.itemSize))}));
