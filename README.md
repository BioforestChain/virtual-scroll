# Virtual Scroll - WebComponent

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/owner/my-element)

<!--
```html
<custom-element-demo>
  <template>
    <script type="module" src="/dist/virtual-scroll.js"></script>
    <script>
      function rangeChange(event) {
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
        <div class="slider-item"></div>
      </div>
    </custom-list-item>
    <custom-list-item position-top="812" item-size="200">
      <div class="my-sliders">
        <div class="slider-item"></div>
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
