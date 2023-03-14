<template>
  <template v-if="Array.isArray(props.componentConfig)">
    <component
      v-for="configItem in props.componentConfig"
      :key="configItem.uuid"
      @click.stop="(e) => setActiveElRef(e, configItem)"
      :is="components[configItem.name]"
      :component-config="configItem"
      v-slot="slotProps"
    >
      <template v-if="configItem.dataType === 'branch'">
        <CardElGenerator :container="slotProps.container" :component-config="configItem.children" />
      </template>
    </component>
    <Moveable
      :container="props.container"
      :ref="setMoveableRef"
      :target="(storeElsInEditor.activeElRef === activeElRef) ? activeElRef : null"
      :draggable="draggable"
      :throttleDrag="throttleDrag"
      :edgeDraggable="edgeDraggable"
      :startDragRotate="startDragRotate"
      :throttleDragRotate="throttleDragRotate"
      :resizable="resizable" :keepRatio="keepRatio"
      :throttleResize="throttleResize"
      :renderDirections="renderDirections"
      :rotatable="rotatable"
      :throttleRotate="throttleRotate"
      :rotationPosition="rotationPosition"
      @drag="onDrag"
      @resize="onResize" @rotate="onRotate"
    />
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
import { ComponentConfig, useStoreElsInEditor } from '../../storeElsInEditor'
import CardElGenerator from './index.vue'
import Text from '../CardMetaEls/Text/EditorView/index.vue'
import GroupWrapper from '../CardMetaEls/GroupWrapper/EditorView/index.vue'
import Moveable from "../../../src/Moveable.vue";
import { ref } from 'vue';

const components: Record<string, any> = {
  Text,
  GroupWrapper
}

const props = defineProps<{
  componentConfig: ComponentConfig[] | ComponentConfig,
  container?: HTMLElement | SVGElement | null | undefined
}>()

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
  if(storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.transform;
  }
}
const onResize = e => {
  e.target.style.width = `${e.width}px`;
  e.target.style.height = `${e.height}px`;
  e.target.style.transform = e.drag.transform;
  if(storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.width = `${e.width}px`;
    storeElsInEditor.dataActiveComponentConfig.style.height = `${e.height}px`;
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.drag.transform;
  }

}
const onRotate = e => {
  if(storeElsInEditor.dataActiveComponentConfig) {
    storeElsInEditor.dataActiveComponentConfig.style.transform = e.drag.transform;
  }
}


const setActiveElRef = (e, activeConfigData) => {
  // console.log(e)
  activeElRef.value = e.target
  storeElsInEditor.setActiveElRef(e.target)
  storeElsInEditor.setActiveComponentConfig(activeConfigData)
}

</script>