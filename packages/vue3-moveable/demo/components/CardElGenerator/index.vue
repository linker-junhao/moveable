<template>
  <template v-if="Array.isArray(props.componentConfig)">
    <component v-for="(configItem, idx) in props.componentConfig" :class="`curlevel-${curLevelUUID}-${idx}`"
      :key="configItem.uuid" @click.stop="(e) => setActiveElRef(e, configItem)" :is="components[configItem.name]"
      :component-config="configItem" v-slot="slotProps">
      <template v-if="configItem.dataType === 'branch'">
        <CardElGenerator :container="slotProps.container" :component-config="configItem.children" />
      </template>
    </component>
    <Moveable :container="props.container" :ref="setMoveableRef"
      :target="(storeElsInEditor.activeElRef === activeElRef) ? activeElRef : null" :draggable="draggable"
      :throttleDrag="throttleDrag" :edgeDraggable="edgeDraggable" :startDragRotate="startDragRotate"
      :throttleDragRotate="throttleDragRotate" :resizable="resizable" :keepRatio="keepRatio"
      :throttleResize="throttleResize" :renderDirections="renderDirections" :rotatable="rotatable"
      :throttleRotate="throttleRotate" :rotationPosition="rotationPosition" @drag="onDrag" @resize="onResize"
      @rotate="onRotate" :snappable="snappable" :isDisplaySnapDigit="isDisplaySnapDigit"
      :isDisplayInnerSnapDigit="isDisplayInnerSnapDigit" :snapDirections="snapDirections"
      :elementSnapDirections="elementSnapDirections" :snapThreshold="snapThreshold"
      :maxSnapElementGuidelineDistance="maxSnapElementGuidelineDistance"
      :elementGuidelines="props.componentConfig.map((v, idx) => `.curlevel-${curLevelUUID}-${idx}`).concat(props.container)" />
  </template>
  <template v-else>
    <component :is="components[props.componentConfig.name]" :component-config="props.componentConfig">
      <template v-if="props.componentConfig.dataType === 'branch'">
        <CardElGenerator :key="props.componentConfig.uuid" :component-config="props.componentConfig.children" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig, useStoreElsInEditor } from '../../storeElsInEditor'
import CardElGenerator from './index.vue'
import Moveable from "../../../src/Moveable.vue";
import { ref } from 'vue';
import GroupWrapper from '../CardMetaEls/GroupWrapper/EditorView/index.vue'
import Text from '../CardMetaEls/Text/EditorView/index.vue'
import Name from '../CardMetaEls/Name/EditorView/index.vue'
import Title from '../CardMetaEls/Title/EditorView/index.vue'
import Avatar from '../CardMetaEls/Avatar/EditorView/index.vue'

const components: Record<string, any> = {
  GroupWrapper,
  Text,
  Name,
  Title,
  Avatar
}

const props = defineProps<{
  componentConfig: ComponentConfig[] | ComponentConfig,
  container?: HTMLElement | SVGElement | null | undefined
}>()

const curLevelUUID = uuidv4()

const storeElsInEditor = useStoreElsInEditor()
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
const rotationPosition = "top";
const moveableRef = ref(null);
const setMoveableRef = (el) => {
  moveableRef.value = el
}
const activeElRef = ref(null)

const onDrag = e => {
  if (storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.transform;
  }
}
const onResize = e => {
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
  if (storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.drag.transform;
  }
}


const setActiveElRef = (e, activeConfigData) => {
  // console.log(e)
  activeElRef.value = e.target
  storeElsInEditor.setActiveElRef(e.target)
  storeElsInEditor.setActiveComponentConfig(activeConfigData)
}


const snappable = true;
const isDisplaySnapDigit = true;
const isDisplayInnerSnapDigit = true;
const snapDirections = { "top": true, "left": true, "bottom": true, "right": true, "center": true, "middle": true };
const elementSnapDirections = { "top": true, "left": true, "bottom": true, "right": true, "center": true, "middle": true };
const snapThreshold = 5;
const maxSnapElementGuidelineDistance = undefined;

</script>