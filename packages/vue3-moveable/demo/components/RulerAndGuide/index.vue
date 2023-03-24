<template>
  <div :ref="setRulerBoxRef" class="ruler-box"></div>
  <div :ref="setVerticalRulerRef" class="ruler vertical"></div>
  <div :ref="setHorizontalRulerRef" class="ruler horizontal"></div>
</template>

<script setup lang="ts">
import Guides from "@scena/guides"
import Gesto from 'gesto'
import { ref, watchEffect } from "vue";

const props = defineProps<{
  renderAreaRef: HTMLElement
}>()

const verticalRulerRef = ref()
  const setVerticalRulerRef = (e) => {
      verticalRulerRef.value = e
  }

  const horizontalRulerRef = ref()
  const setHorizontalRulerRef = (e) => {
      horizontalRulerRef.value = e
  }

  const rulerBoxRef = ref()
  const setRulerBoxRef = (e) => {
      rulerBoxRef.value = e
  }

  watchEffect(() => {
    if(horizontalRulerRef.value && verticalRulerRef.value && rulerBoxRef.value && props.renderAreaRef) {
        const guides1 = new Guides(horizontalRulerRef.value, {
            type: "horizontal",
            displayDragPos: true,
            rulerStyle: { left: "30px", width: "calc(100% - 30px)", height: "100%" },
            useResizeObserver: true,
        });
        const guides2 = new Guides(verticalRulerRef.value, {
            type: "vertical",
            displayDragPos: true,
            rulerStyle: { top: "30px", height: "calc(100% - 30px)", width: "100%" },
            useResizeObserver: true,
        });

        let scrollX = 0;
        let scrollY = 0;

        const box = rulerBoxRef.value;

        new Gesto(props.renderAreaRef).on("dragStart", e => {
            if (e.inputEvent.target === box || e.inputEvent.target.nodeName === "A") {
                return false;
            }
        }).on("drag", e => {
            if([...e.inputEvent.target.classList].includes('card-el')) {
                return
            }
            scrollX -= e.deltaX;
            scrollY -= e.deltaY;

            guides1.scroll(scrollX);
            guides1.scrollGuides(scrollY);
            guides2.scroll(scrollY);
            guides2.scrollGuides(scrollX);
        });
        box.addEventListener("click", () => {
            scrollX = 0;
            scrollY = 0;
            guides1.scroll(0);
            guides1.scrollGuides(0);
            guides2.scroll(0);
            guides2.scrollGuides(0);
        });
    }
  })
</script>

<style>
.ruler-box {
    height: 30px;
    width: 30px;
    top: 0;
    left: 0;
    position: absolute;
    background: #444;
    box-sizing: border-box;
    z-index: 21;
}

.ruler {
    position: absolute;
    top: 0;
    left: 0;
}
.ruler.vertical {
    width: 30px;
    height: 100%;
}
.ruler.horizontal {
    width: 100%;
    height: 30px;
}
</style>