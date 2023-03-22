<template>
  <div class="text-control-panel">
    <div class="text-control-panel__input">
      <span>文本内容:</span>
      <input v-model="dataActiveComponentConfig['value']" />
    </div>
    <div class="text-control-panel__input">
      <span>字体大小:</span>
      <input v-model="dataActiveComponentConfig.style['font-size']" />
    </div>
    <div class="text-control-panel__input">
      <span>字体颜色:</span>
      <input type="color" v-model="dataActiveComponentConfig.style['color']" />
    </div>
    <div class="text-control-panel__input">
      <span>字体样式:</span>
      <select v-model="dataActiveComponentConfig.style['font-style']">
        <option value="normal">正常</option>
        <option value="italic">斜体</option>
        <option value="oblique">倾斜</option>
      </select>
    </div>
    <div class="text-control-panel__input">
      <span>字体粗细:</span>
      <select v-model="dataActiveComponentConfig.style['font-weight']">
        <option value="normal">正常</option>
        <option value="bold">粗体</option>
        <option value="lighter">较轻</option>
        <option value="bolder">较重</option>
      </select>
    </div>
    <div class="text-control-panel__input">
      <span>字体:</span>
      <select v-model="dataActiveComponentConfig.style['font-family']">
        <option value="Arial">Arial</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Times">Times</option>
        <option value="Courier New">Courier New</option>
        <option value="Courier">Courier</option>
        <option value="Verdana">Verdana</option>
        <option value="Georgia">Georgia</option>
        <option value="Palatino">Palatino</option>
        <option value="Garamond">Garamond</option>
        <option value="Bookman">Bookman</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Trebuchet MS">Trebuchet MS</option>
        <option value="Arial Black">Arial Black</option>
        <option value="Impact">Impact</option>
        <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Lucida Console">Lucida Console</option>
      </select>
    </div>
    <div class="text-control-panel__input">
      <span>文本对齐:</span>
      <select v-model="dataActiveComponentConfig.style['text-align']">
        <option value="left">左对齐</option>
        <option value="center">居中对齐</option>
        <option value="right">右对齐</option>
      </select>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../../storeElsInEditor';

export default defineComponent({
  name: 'TextControlPanelView',
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
