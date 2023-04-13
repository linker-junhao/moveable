<template>
  <el-menu
    class="el-menu-demo"
    mode="horizontal"
    @select="handleMenuAction"
    active-text-color="inherit"
  >
    <el-sub-menu index="2">
      <template #title>项目</template>
      <el-menu-item index="openFile">
        <input
          type="file"
          :ref="setFileInput"
          style="display:none"
          @change="handleFileUpload"
        />
        <div @click="openFile">打开项目</div>
      </el-menu-item>
      <el-menu-item index="saveFile">
        <div @click="saveFile">保存项目</div>
      </el-menu-item>
      <el-menu-item index="2-3">
        <ExportConfig />
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="3">
      <template #title>编辑</template>
      <el-menu-item index="3-1">
        <div @click="clearCanvas">清空画布</div>
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="4">
      <template #title>设置</template>
      <el-menu-item index="4-1">
        <el-checkbox :checked="showOutletLineOfSubEl" @change="toggleShowOutletLineOfSubEl">元素描边</el-checkbox>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { ref, reactive, VNodeRef } from 'vue';
import { ElButton } from 'element-plus';
import { useStoreElsInEditor } from '../../store/storeElsInEditor';
import { useMoveableStuffRefs } from '../../store/moveableStuffRefs';
import { useCanvasConfig } from '../../store/editorConfigs/canvasConfig';
import ExportConfig from './components/ExportConfig/index.vue'
import { saveJSONFile, filenameWithDate } from '../../utils/saveJson';


const storeElsInEditor = useStoreElsInEditor()
const moveableStuffRefs = useMoveableStuffRefs()
const fileInput = ref<any>()
const setFileInput: VNodeRef = (e) => fileInput.value = e

const openFile = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const contents = JSON.parse(e.target?.result as string);
    storeElsInEditor.setDataConfig(reactive(contents));
    moveableStuffRefs.setActiveElRef(null)
  };
  reader.readAsText(file as Blob);
};

const saveFile = () => {
  saveJSONFile(storeElsInEditor.dataConfig, filenameWithDate('project'))
};

const clearCanvas = () => {
  storeElsInEditor.setDataConfig([])
  moveableStuffRefs.setActiveElRef(null)
}

const { toggleShowOutletLineOfSubEl, showOutletLineOfSubEl } = useCanvasConfig()

const handleMenuAction = (...args) => {
  console.log(args)
}

</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: flex-start;
  padding: 10px;
}
</style>
