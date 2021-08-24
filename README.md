# Virtual Scroll - WebComponent

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/owner/my-element)

<!--
```html
<custom-element-demo>
  <template>
    <script type="importmap">
    {
        "imports": {
        "lit-element": "//unpkg.com/lit-element@2.4.0/lit-element.js",
        "lit-html/": "//unpkg.com/lit-html@1.4.1/"
        }
    }
    </script>
    <script type="module" src="./dist/virtual-scroll.es.js"></script>
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
    .list-1 .block-card-item {
        --card-color: #2196f3;
        /* background: linear-gradient(45deg, #2196f3, transparent); */
    }
    .list-2 .block-card-item {
        --card-color: #e91e63;
        /* background: linear-gradient(45deg, #e91e63, transparent); */
    }
    .block-card-item {
        height: 200px;
        width: 100%;
        box-sizing: border-box;
        --card-color: #2196f3;
        /* border: 1px solid rgba(0, 0, 0, 0.2); */
        height: 240px;
        padding: 20px 45px;
    }
    .block-card-item [name="height"] {
        contain: strict;
    }
    .block-content {
        height: 185px;
        padding: 30px;
        box-sizing: border-box;
        background: linear-gradient(180deg, var(--card-color), #fff);
        border-radius: 20px;
        /* box-shadow: -4px -4px 8px rgba(255, 255, 255, 0.2),
            4px 4px 8px rgba(0, 0, 0, 0.2); */
        /* filter: drop-shadow(-4px -4px 8px rgba(255, 255, 255, 0.2)) drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.2)); */
    }
    .block-card-item.last .chain-link {
        display: none;
    }
    .block-card-item.hide {
        display: none;
    }
    .chain-link {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 2;
        height: 60px;
        width: 100%;
        /* opacity: 0.9; */
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
    .chain-link::before,
    .chain-link::after {
        content: " ";
        width: 10px;
        background: #fff;
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
        for (const { node, index, type } of entries) {
        if (type == "create" || type == "visible") {
            // console.log("%s %c%s", viewClass, "color:green", type, index);
            const height = (this.l.itemCount - index).toString();
            const heightEle = node.querySelector("[name=height]");
            if (heightEle.textContent != height) {
            (heightEle.firstChild || heightEle).textContent = height;
            node.style.setProperty("z-index", height);
            }
            node.classList.toggle("last", height === "1" || index === 1n);
            console.log(index);
            node.classList.toggle("hide", index === 2n);
            // node.querySelector("[name=offsetTop]").innerHTML = node.offsetTop;
        }
        }
    }
    </script>
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->

## DEMO

```html
<scroll-viewport>
  <fixed-size-list
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
    <custom-list-item item-size="400">
      <div class="my-sliders">
        <div class="slider-item">This is Banner!</div>
      </div>
    </custom-list-item>
    <custom-list-item position-top="812" item-size="200">
      <div class="my-sliders">
        <div class="slider-item">rethink, this is grid.</div>
      </div>
    </custom-list-item>
  </fixed-size-list>
</scroll-viewport>
```

## Document

1. `<scroll-viewport>`
   > viewport for virtual scroll.
   - `@slot` - This element has a slot
2. `<fixed-size-list>`
   > virtual scroll list with fixed size.
   - `@slot` - for custom list item
   - `@slot` `template` - for buildable item
   - `@csspart` `scroll-up` - the scroll up controller
   - `@csspart` `scroll-up` - the scroll up controller
   - `@csspart` virtual-list-view- the scroll item containre
   - `@fires` `renderrangechange` - when scroll, the item will need render changed
   - `@attr` `{bigint} item-count` -
   - `@attr` `{number} item-size` -
   - `@attr` `{number} safe-area-inset-top` - like padding-top
   - `@attr` `{number} safe-area-inset-bottom` - like padding-bottom
   - `@attr` `{number} cache-render-top` - will make list-view higher, for render more item. if item content overflow, you may need change this to make it render correctly
   - `@attr` `{number} cache-render-bottom` - will make list-view higher, for render more item. like {cache-render-top}
   - `@method` `refresh()` - if you change the attr directly by set property. you may need call the method
   - `@prop` `{bigint} virtualScrollTop` - change the scroll top. without animation
3. `<custom-list-item>`
   > custom item in virtual scroll list
   - `@slot` - for custom list item
   - `@attr` `{bigint} position-top` - the posiction in virtual scroll list
   - `@attr` `{number} item-size` - the item height
