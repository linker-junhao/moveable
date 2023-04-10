<template>
  <Moveable :ref="setMoveableRef" :rootContainer="moveableStuffRefs.activeElContainerRef"
    :target="moveableStuffRefs.activeElRef" :draggable="draggable" :throttleDrag="throttleDrag"
    :edgeDraggable="edgeDraggable" :startDragRotate="startDragRotate" :throttleDragRotate="throttleDragRotate"
    :resizable="resizable" :keepRatio="keepRatio" :throttleResize="throttleResize" :renderDirections="renderDirections"
    :rotatable="rotatable" :throttleRotate="throttleRotate" :rotationPosition="rotationPosition" @drag="onDrag"
    @resize="onResize" @rotate="onRotate" :snappable="snappable" :isDisplaySnapDigit="isDisplaySnapDigit"
    :isDisplayInnerSnapDigit="isDisplayInnerSnapDigit" :snapDirections="snapDirections"
    :elementSnapDirections="elementSnapDirections" :snapThreshold="snapThreshold"
    :maxSnapElementGuidelineDistance="maxSnapElementGuidelineDistance" :elementGuidelines="elementGuidelines"
  />
</template>

<script setup lang="ts">
import Moveable from '../../../src/Moveable.vue'
import { BoundType, RotationPosition } from 'moveable';
import { computed, ref } from 'vue';
import { useStoreElsInEditor } from '../../store/storeElsInEditor';
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs';

const props = defineProps<{
  rootContainer: HTMLElement
}>()

const storeElsInEditor = useStoreElsInEditor()
const moveableStuffRefs = useMoveableStuffRefs()

const snappable = true;
const isDisplaySnapDigit = true;
const isDisplayInnerSnapDigit = true;
const snapDirections = { "top": true, "left": true, "bottom": true, "right": true, "center": true, "middle": true };
const elementSnapDirections = { "top": true, "left": true, "bottom": true, "right": true, "center": true, "middle": true };
const snapThreshold = 2;
const maxSnapElementGuidelineDistance = Infinity;

const bounds: BoundType = {"left":0,"top":0,"right":0,"bottom":0,"position":"css"}
const draggable = true;
const throttleDrag = 0;
const edgeDraggable = false;
const startDragRotate = 0;
const throttleDragRotate = 0;
const resizable = true;
const keepRatio = false;
const throttleResize = 0;
const renderDirections = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];
const rotatable = true;
const throttleRotate = 0;
const rotationPosition: RotationPosition = "top";
const moveableRef = ref(null);
const setMoveableRef = (el) => {
  moveableRef.value = el
  moveableStuffRefs.setMoveableRef(el)
}
const isCurElLocked = computed(() => {
  return storeElsInEditor.dataActiveComponentConfig?.editBehavior?.locked === true
})
const onDrag = e => {
  if (isCurElLocked.value) {
    return
  }
  if (storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.transform;
  }
}
const onResize = e => {
  if (isCurElLocked.value) {
    return
  }
  e.target.style.width = `${e.width}px`;
  e.target.style.height = `${e.height}px`;
  e.target.style.transform = e.drag.transform;
  if (storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.width = `${e.width}px`;
    storeElsInEditor.dataActiveComponentConfig.style.height = `${e.height}px`;
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.drag.transform;
  }

}
const onRotate = e => {
  if (isCurElLocked.value) {
    return
  }
  if (storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.drag.transform;
  }
}

const elementGuidelines = computed(() => {
  return Array.from(moveableStuffRefs.activeElContainerRef?.querySelectorAll('.card-el') || [])
})

</script>