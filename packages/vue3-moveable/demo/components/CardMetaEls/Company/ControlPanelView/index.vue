<template>
  <div class="text-control-panel" v-if="dataActiveComponentConfig">
    <el-input v-model="dataActiveComponentConfig['value']" />
    <template v-if="dataActiveComponentConfig.style">
      <el-input v-model="dataActiveComponentConfig.style['font-size']" />
      <el-color-picker v-model="dataActiveComponentConfig.style['color']" />
      <el-select v-model="dataActiveComponentConfig.style['font-style']">
        <el-option value="normal">正常</el-option>
        <el-option value="italic">斜体</el-option>
        <el-option value="oblique">倾斜</el-option>
      </el-select>
      <el-select v-model="dataActiveComponentConfig.style['font-weight']">
        <el-option value="normal">正常</el-option>
        <el-option value="bold">粗体</el-option>
        <el-option value="lighter">较轻</el-option>
        <el-option value="bolder">较重</el-option>
      </el-select>
      <el-select v-model="dataActiveComponentConfig.style['font-family']">
        <el-option value="Arial">Arial</el-option>
        <el-option value="Helvetica">Helvetica</el-option>
        <el-option value="Times New Roman">Times New Roman</el-option>
        <el-option value="Times">Times</el-option>
        <el-option value="Courier New">Courier New</el-option>
        <el-option value="Courier">Courier</el-option>
        <el-option value="Verdana">Verdana</el-option>
        <el-option value="Georgia">Georgia</el-option>
        <el-option value="Palatino">Palatino</el-option>
        <el-option value="Garamond">Garamond</el-option>
        <el-option value="Bookman">Bookman</el-option>
        <el-option value="Comic Sans MS">Comic Sans MS</el-option>
        <el-option value="Trebuchet MS">Trebuchet MS</el-option>
        <el-option value="Arial Black">Arial Black</el-option>
        <el-option value="Impact">Impact</el-option>
        <el-option value="Lucida Sans Unicode">Lucida Sans Unicode</el-option>
        <el-option value="Tahoma">Tahoma</el-option>
        <el-option value="Lucida Console">Lucida Console</el-option>
      </el-select>
      <el-select v-model="dataActiveComponentConfig.style['text-align']">
        <el-option value="left">左对齐</el-option>
        <el-option value="center">居中对齐</el-option>
        <el-option value="right">右对齐</el-option>
      </el-select>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../../storeElsInEditor';
import { ElInput, ElSelect, ElOption, ElColorPicker } from 'element-plus';

export default defineComponent({
  name: 'TextControlPanelView',
  components: {
    'el-input': ElInput,
    'el-select': ElSelect,
    'el-option': ElOption,
    'el-color-picker': ElColorPicker
  },
  setup() {
    const storeElsInEditor = useStoreElsInEditor();
    const { dataActiveComponentConfig } = storeElsInEditor;

    return {
      dataActiveComponentConfig,
    };
  },
});
</script>

<style scoped>
.text-control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-control-panel__input {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
