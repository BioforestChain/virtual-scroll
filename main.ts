import type {} from "./src";
const _l = document.getElementById(
  "l"
) as FixedSizeVirtualListS1Element<HTMLDivElement>;
const l = _l.customItemCountStateManager((index) => {
  const height = _l.itemCount - index;
  return {
    id: `h-${height}`,
    state: { enter: "height", leave: "height" },
    endTime: Infinity,
  };
});
// const l = _l
const movingDuration = 200;
l.addEventListener("renderrangechange", function rangeChange(event) {
  const { entries, time } = event.detail;
  for (const { node, index, stateInfoList, isIntersecting } of entries) {
    const viewClass = event.target.className;
    if (isIntersecting) {
      // console.log("%s %c%s", viewClass, "color:green", type, index);
      const height = l.itemCount - index;
      const heightEle = node.querySelector("[name=height]");
      (heightEle.firstChild || heightEle).textContent = String(height);
      const stateEle = node.querySelector("[name=state]");
      (stateEle.firstChild || stateEle).textContent = stateInfoList
        .map(
          (stateInfo) =>
            `${stateInfo.state}-${stateInfo.id}-${stateInfo.endTime.toFixed(2)}`
        )
        .join("\n");
      {
        let createScale = 0;
        let createTime = 0;
        let movingOffset = 0;
        let movingTime = 0;
        for (const stateInfo of stateInfoList) {
          if (stateInfo.state === "moving") {
            const diffTime = stateInfo.endTime - time;
            movingOffset += (diffTime / movingDuration) * l.itemSize;
            movingTime = Math.max(diffTime, movingTime);
          } else if (stateInfo.state === "create") {
            const diffTime = stateInfo.endTime - time;
            createScale = diffTime / movingDuration;
            createTime = diffTime;
          }
        }

        /**@TODO use replaceable animations */
        for (const ani of node.contentNode.getAnimations()) {
          ani.cancel();
        }
        const movingAniOptions =
          movingOffset !== 0 && movingTime > 0
            ? {
                from: -movingOffset, //`translateY(${-movingOffset}px)`,
                to: 0, //`translateY(0px)`,
                duration: movingTime,
              }
            : undefined;
        const createAniOptions =
          createScale !== 0 && createTime > 0
            ? {
                from: 1 - createScale, //`scale(${1 - createScale})`,
                to: 1, //`scale(1)`,
                duration: createTime,
              }
            : undefined;

        if (movingAniOptions && createAniOptions) {
          const framekeys = [
            {
              transform: `translateY(${movingAniOptions.from}px) scale(${createAniOptions.from})`,
              offset: 0,
            },
          ];
          let aniDuration;
          if (createAniOptions.duration > movingAniOptions.duration) {
            aniDuration = createAniOptions.duration;
            const offset = movingAniOptions.duration / aniDuration;
            framekeys.push(
              {
                transform: `translateY(${movingAniOptions.to}px) scale(${
                  createAniOptions.from +
                  (createAniOptions.to - createAniOptions.from) * offset
                })`,
                offset: offset,
              },
              {
                transform: `scale(${createAniOptions.to})`,
                offset: 1,
              }
            );
          } else {
            aniDuration = movingAniOptions.duration;
            const offset = createAniOptions.duration / aniDuration;
            framekeys.push(
              {
                transform: `translateY(${
                  movingAniOptions.from +
                  (movingAniOptions.to - movingAniOptions.from) * offset
                }px) scale(${createAniOptions.to})`,
                offset: offset,
              },
              {
                transform: `translateY(${movingAniOptions.to}px)`,
                offset: 1,
              }
            );
          }
          node.contentNode.animate(framekeys, aniDuration);
        } else if (movingAniOptions) {
          node.contentNode.animate(
            [
              { transform: `translateY(${movingAniOptions.from}px)` },
              { transform: `translateY(${movingAniOptions.to}px)` },
            ],
            movingAniOptions.duration
          );
        } else if (createAniOptions) {
          node.contentNode.animate(
            [
              { transform: `scale(${createAniOptions.from})` },
              { transform: `scale(${createAniOptions.to})` },
            ],
            createAniOptions.duration
          );
        }
      }

      node.contentNode.classList.toggle("first", index === 0n);
      // node.contentNode.classList.toggle(
      //   "hide",
      //   node.contentNode.getAnimations().length === 0 && index === 2n
      // );

      // node.querySelector("[name=offsetTop]").innerHTML = node.offsetTop;
    } else {
      // console.log("%s %c%s", viewClass, "color:orange", type, index);
    }
  }
});
function rangeChange(event) {
  const { entries, time } = event.detail;
  for (const { node, index, stateInfoList, isIntersecting } of entries) {
    const viewClass = event.target.className;
    if (isIntersecting) {
      // console.log("%s %c%s", viewClass, "color:green", type, index);
      const height = l.itemCount - index;
      const heightEle = node.querySelector("[name=height]");
      (heightEle.firstChild || heightEle).textContent = height;
      const stateEle = node.querySelector("[name=state]");
      (stateEle.firstChild || stateEle).textContent = stateInfoList
        .map(
          (stateInfo) =>
            `${stateInfo.state}-${stateInfo.id}-${stateInfo.endTime.toFixed(2)}`
        )
        .join("\n");
      {
        let createScale = 0;
        let createTime = 0;
        let movingOffset = 0;
        let movingTime = 0;
        for (const stateInfo of stateInfoList) {
          if (stateInfo.state === "moving") {
            const diffTime = stateInfo.endTime - time;
            movingOffset += (diffTime / movingDuration) * l.itemSize;
            movingTime = Math.max(diffTime, movingTime);
          } else if (stateInfo.state === "create") {
            const diffTime = stateInfo.endTime - time;
            createScale = diffTime / movingDuration;
            createTime = diffTime;
          }
        }

        /**@TODO use replaceable animations */
        for (const ani of node.contentNode.getAnimations()) {
          ani.cancel();
        }
        const movingAniOptions =
          movingOffset !== 0 && movingTime > 0
            ? {
                from: -movingOffset, //`translateY(${-movingOffset}px)`,
                to: 0, //`translateY(0px)`,
                duration: movingTime,
              }
            : undefined;
        const createAniOptions =
          createScale !== 0 && createTime > 0
            ? {
                from: 1 - createScale, //`scale(${1 - createScale})`,
                to: 1, //`scale(1)`,
                duration: createTime,
              }
            : undefined;

        if (movingAniOptions && createAniOptions) {
          const framekeys = [
            {
              transform: `translateY(${movingAniOptions.from}px) scale(${createAniOptions.from})`,
              offset: 0,
            },
          ];
          let aniDuration;
          if (createAniOptions.duration > movingAniOptions.duration) {
            aniDuration = createAniOptions.duration;
            const offset = movingAniOptions.duration / aniDuration;
            framekeys.push(
              {
                transform: `translateY(${movingAniOptions.to}px) scale(${
                  createAniOptions.from +
                  (createAniOptions.to - createAniOptions.from) * offset
                })`,
                offset: offset,
              },
              {
                transform: `scale(${createAniOptions.to})`,
                offset: 1,
              }
            );
          } else {
            aniDuration = movingAniOptions.duration;
            const offset = createAniOptions.duration / aniDuration;
            framekeys.push(
              {
                transform: `translateY(${
                  movingAniOptions.from +
                  (movingAniOptions.to - movingAniOptions.from) * offset
                }px) scale(${createAniOptions.to})`,
                offset: offset,
              },
              {
                transform: `translateY(${movingAniOptions.to}px)`,
                offset: 1,
              }
            );
          }
          node.contentNode.animate(framekeys, aniDuration);
        } else if (movingAniOptions) {
          node.contentNode.animate(
            [
              { transform: `translateY(${movingAniOptions.from}px)` },
              { transform: `translateY(${movingAniOptions.to}px)` },
            ],
            movingAniOptions.duration
          );
        } else if (createAniOptions) {
          node.contentNode.animate(
            [
              { transform: `scale(${createAniOptions.from})` },
              { transform: `scale(${createAniOptions.to})` },
            ],
            createAniOptions.duration
          );
        }
        if (l._debug_) {
          console.log(index, "do ani", stateEle.textContent);
          console.log(movingAniOptions, createAniOptions);
          for (const ani of node.contentNode.getAnimations()) {
            console.log(ani.effect.getKeyframes());
          }
        }
      }

      node.contentNode.classList.toggle("first", index === 0n);
      // node.contentNode.classList.toggle(
      //   "hide",
      //   node.contentNode.getAnimations().length === 0 && index === 2n
      // );

      // node.querySelector("[name=offsetTop]").innerHTML = node.offsetTop;
    } else {
      // console.log("%s %c%s", viewClass, "color:orange", type, index);
    }
  }
}
// self.rangeChange = rangeChange;
function gotoTop() {
  l.virtualScrollTo(0);
}
Reflect.set(self, "gotoTop", gotoTop);
function insertItem() {
  l.itemCountStateManager.insertBefore(1n, 0n, {
    // state: create
    duration: movingDuration,
  });
}
Reflect.set(self, "insertItem", insertItem);
function insertAndScroll() {
  const count = 0; // (5 * Math.random()) | 0;
  if (count > 0) {
    l.itemCountStateManager.insertBefore(BigInt(count), 0n, {
      state: { enter: "moving", leave: "moving" },
    });
  }
  let need_ani = l.virtualScrollTop <= l.itemSize * 2.5;

  /// 新区快在视野范围内，不进行滚动，让区块自然下落
  if (need_ani) {
    l.itemCountStateManager.insertBefore(1n, 0n, {
      duration: movingDuration,
    });
    return;
  }
  /// 新区快在视野范围外，整个链保持静止不动，避免无意义的画面抖动
  else {
    l.itemCountStateManager.insertBefore(1n, 0n, {
      duration: 0,
    });
    console.log(
      "size:%s, count:%s, total:%s",
      BigInt(l.itemSize * (count + 1)),
      count + 1,
      l.itemCount
    );
    l.virtualScrollTop = l.virtualScrollTop + BigInt(l.itemSize * (count + 1));
  }
}
Reflect.set(self, "insertAndScroll", insertAndScroll);
