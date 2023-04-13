<template>
  <ElButtonGroup class="ml-4">
    <ElButton type="primary" @click="scaleChange('zoomout')">
      <el-icon><i-ep-zoom-out /></el-icon>
    </ElButton>
    <ElButton type="primary" @click="scaleChange('reset')">
      <el-icon><i-ep-crop /></el-icon>
    </ElButton>
    <ElButton type="primary" @click="scaleChange('zoomin')">
      <el-icon><i-ep-zoom-in /></el-icon>
    </ElButton>
  </ElButtonGroup>
</template>

<script lang="ts" setup>
import { useStoreElsInEditor } from '../../store/storeElsInEditor';
import { useCanvasConfig } from '../../store/editorConfigs/canvasConfig';
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs';

const storeElsInEditor = useStoreElsInEditor()
const canvasConfig = useCanvasConfig()
const moveableStuffRefs = useMoveableStuffRefs()

const scaleChange = (type: 'zoomin'|'reset'|'zoomout') => {
  storeElsInEditor.setActiveComponentConfig(null)
  moveableStuffRefs.setActiveElRef(null)
  if(type === 'zoomin') {
    canvasConfig.setScale((originScale: number) => {
      const result = originScale + 0.1
      return result >= 8 ? 8 : result
    })
  }
  if(type === 'reset') {
    canvasConfig.setScale((originScale: number) => {
      return 1
    })
  }
  if(type === 'zoomout') {
    canvasConfig.setScale((originScale: number) => {
      const result = originScale - 0.1
      return result <= 0.2 ? 0.2 : result
    })
  }
}
</script>