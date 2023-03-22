<template>
  <div class="control-panel">
    <div class="control-panel__input">
      <span>宽度:</span>
      <input v-model="dataActiveComponentConfig.style['width']" />
    </div>
    <div class="control-panel__input">
      <span>高度:</span>
      <input v-model="dataActiveComponentConfig.style['height']" />
    </div>
    <div class="control-panel__input">
      <span>透明度:</span>
      <input v-model="dataActiveComponentConfig.style['opacity']" />
    </div>
    <div class="control-panel__input">
      <span>位置:</span>
      <select v-model="dataActiveComponentConfig.style['position']">
        <option value="static">静态</option>
        <option value="relative">相对</option>
        <option value="absolute">绝对</option>
        <option value="fixed">固定</option>
        <option value="sticky">粘性</option>
      </select>
    </div>
    <div class="control-panel__input">
      <span>布局位置:</span>
      <select v-model="dataActiveComponentConfig.style['transform']">
        <option value="translateX(0)">无</option>
        <option value="translateX(-100%)">左</option>
        <option value="translateX(100%)">右</option>
        <option value="translateY(-100%)">上</option>
        <option value="translateY(100%)">下</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../../storeElsInEditor';

export default defineComponent({
  name: 'ControlPanelView',
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
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-panel__input {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
