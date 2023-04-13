<template>
  <div
    :class="{
      'card-el': true,
      'active-card-el': isActive,
      'show-outline': isShowOutline
    }"
    :ref="setContainerRef"
    :style="{ ...props.componentConfig.style, 'background-image': props.componentConfig.value }"
  >
    <slot :container="containerRef"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watchEffect } from 'vue';
import { BranchComponentConfig } from '../../../../store/storeElsInEditor';
import { useMoveableStuffRefs } from '../../../../store/moveableStuffRefs';
import { useCanvasConfig } from '../../../../store/editorConfigs/canvasConfig';

const curInstance = getCurrentInstance()

const props = defineProps<{
  componentConfig: BranchComponentConfig
}>()

const containerRef = ref<HTMLElement>()
const setContainerRef = (e) => {
  containerRef.value = e
}

const moveableStuffRefs = useMoveableStuffRefs()
const isActive = computed(() => {
  return moveableStuffRefs.activeElRef === curInstance?.vnode.el
})

const canvasConfig = useCanvasConfig()
const isShowOutline = computed(() => {
  return canvasConfig.showOutletLineOfSubEl
})

</script>

<style>
.active-card-el.show-outline > .card-el::before {
  display: 'block';
  content: ' ';
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border-color: rgb(255, 89, 116) !important;
  border-width: 0.5px;
  border-style:  dotted!important;
  position: absolute;
  box-sizing: border-box;
}
.active-card-el.show-outline > img.card-el {
  box-shadow: 0px 0px 0 0.5px rgb(255, 89, 116) !important;
}
</style>