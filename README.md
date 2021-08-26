# Virtual Scroll - WebComponent

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/owner/my-element)

## DEMO

- [example 1](https://bioforestchain.github.io/virtual-scroll/)

## Usage

**Install Dep**

```bash
npm i @bfchain/virtual-scroll --save
yarn add @bfchain/virtual-scroll
```

**moderns web dev**

> For Angular/React/Vue/Preact etc.

```ts
import "@bfchain/virtual-scroll";
```

**or include directly**

> For vanillajs

```html
<script src="./node_modules/@bfchain/virtual-scroll/dist/vitrual-scroll.iife.js"></script>
```

**then you can use the component in your html**

<!--
```html
<custom-element-demo height="640">
  <template>
    <script type="module" src="./iife/virtual-scroll.iife.js"></script>
    <style>
    html,
    body {
        width: 100%;
        height: 100%;
        margin: 0;
        background-color: #ddd;
    }
    body {
        box-sizing: border-box;
        padding: 10px 20px;
        align-items: center;
        justify-content: stretch;
    }
    scroll-viewport {
        width: 100%;
        height: 100%;
        background-color: #999;
        position: relative;
    }
    .block-card-item {
        height: 200px;
        width: 100%;
        box-sizing: border-box;
        --card-color: #2196f3;
        height: 100%;
        padding: 10px 25px;
    }
    .block-card-item [name="height"] {
        contain: strict;
    }
    .block-content {
        height: 100%;
        padding: 30px;
        box-sizing: border-box;
        background: linear-gradient(180deg, var(--card-color), #fff);
        border-radius: 20px;
        /* box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.2),
            4px 4px 8px rgba(0, 0, 0, 0.2); */
    }
    .block-card-item.first .chain-link {
        display: none;
    }
    .block-card-item.hide {
        display: none;
    }
    .chain-link {
        position: absolute;
        top: -30px;
        left: 0;
        z-index: 2;
        height: 60px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
    .chain-link::before,
    .chain-link::after {
        content: " ";
        width: 10px;
        background: #81c784;
        /* box-shadow: -1px -1px 2px rgba(255, 255, 255, 0.2),
            1px 1px 2px rgba(0, 0, 0, 0.2); */
        border-radius: 5px;
    }
    .top-button {
        width: 100%;
    }
    .my-sliders {
        width: 100%;
        height: 100%;
        padding: 10px;
        box-sizing: border-box;
    }
    .my-sliders .slider-item {
        background-color: #e91e63;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    </style>
    <script>
    function rangeChange(event) {
        const { entries } = event.detail;
        for (const { node, index, isIntersecting } of entries) {
        const viewClass = event.target.className;
        if (isIntersecting) {
            const height = l.itemCount - index;
            const heightEle = node.querySelector("[name=height]");
            if (heightEle.textContent != height) {
            (heightEle.firstChild || heightEle).textContent = height;
            }
            node.contentNode.classList.toggle(
            "first",
            index === 0n || index === 3n
            );
            node.contentNode.classList.toggle("hide", index === 2n);
        }
        }
    }
    function gotoTop() {
        l.virtualScrollTop = 0;
    }
    </script>
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->

```html
<scroll-viewport>
  <fixed-size-virtual-list-s1
    id="l"
    item-size="200"
    item-count="1000000"
    safe-area-inset-top="400"
    safe-area-inset-bottom="100"
    onrenderrangechange="rangeChange(event)"
  >
    <div class="block-card-item" slot="template">
      <div class="block-content">
        <div class="height">Height: <span name="height"></span></div>
      </div>
      <div class="chain-link"></div>
    </div>
    <virtual-list-custom-item item-size="400">
      <div class="my-sliders">
        <div class="slider-item">This is Banner!</div>
      </div>
    </virtual-list-custom-item>
    <virtual-list-custom-item position-top="800" item-size="200">
      <div class="my-sliders">
        <div class="slider-item">rethink, this is grid.</div>
      </div>
    </virtual-list-custom-item>
  </fixed-size-virtual-list-s1>
</scroll-viewport>
```

## Document

1. `<scroll-viewport>`
   > viewport for virtual scroll.
   - `@slot` - This element has a slot
2. `<fixed-size-virtual-list-s1>`/`<fixed-size-virtual-list-s2>`
   > virtual scroll list with fixed size.
   >
   > - `s1` means has only one scrollbar to capture two direction scroll.
   > - `s2` means has two scrollbar for two direction scroll (maybe you will need it).
   - `@slot` - for custom list item
   - `@slot` `template` - for buildable item
   - `@csspart` `scroll-ctrl` - (s1) the scroll controller
   - `@csspart` `scroll-up` - (s2) the scroll up controller
   - `@csspart` `scroll-down` - (s2) the scroll down controller
   - `@csspart` `virtual-list-view` - the scroll item container
   - `@fires` `renderrangechange` - when scroll, the item will need render changed
   - `@attr` `{bigint} item-count` -
   - `@attr` `{number} item-size` -
   - `@attr` `{number} safe-area-inset-top` - like padding-top
   - `@attr` `{number} safe-area-inset-bottom` - like padding-bottom
   - `@attr` `{number} cache-render-top` - will make list-view higher, for render more item. if item content overflow, you may need change this to make it render correctly
   - `@attr` `{number} cache-render-bottom` - will make list-view higher, for render more item. like {cache-render-top}
   - `@method` `refresh()` - if you change the attr directly by set property. you may need call the method
   - `@prop` `{bigint} virtualScrollTop` - change the scroll top. without animation
3. `<virtual-list-custom-item>`
   > custom item in virtual scroll list
   - `@slot` - for custom list item
   - `@attr` `{bigint} position-top` - the posiction in virtual scroll list
   - `@attr` `{number} item-size` - the item height

## ISSUES

1. because of `scroll-ctrl` behavior base on scroll-snap, but Firefox and WebKit don't behave the same. so in firebox you need use controlbar but no mousewheel.

## TODO

- [x] fixed-size-virtual-list 重构成 LitElement
- [x] 抽象出 common-fixed-size-virtual-list-builder 以扩展多种不同滚动策略
- [ ] fixed-size-virtual-list 需要正确区分 create / visible / hidden / destroy 四种状态
- [ ] create 与 destroy 发生的时候，如果该元素不在页面中，不应该发生滚动
- [ ] 实现 `pushCount(newCount:bigint)`, `insertCount(newCount:bigint, refIndex = 0n)`
- [ ] 实现 `scrollToIndex(index:bigint)`
- [ ] 支持 `scroll-behavior: smooth`
- [x] 滚动的平滑衰减应该基于帧时间而不是基于帧数
