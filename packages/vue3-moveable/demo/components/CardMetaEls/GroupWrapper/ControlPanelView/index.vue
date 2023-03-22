<template>
  <div class="flex-control-panel">
    <div class="flex-control-panel__input">
      <span>Flex Direction:</span>
      <select v-model="dataActiveComponentConfig.style['flex-direction']">
        <option value="row">Row</option>
        <option value="row-reverse">Row Reverse</option>
        <option value="column">Column</option>
        <option value="column-reverse">Column Reverse</option>
      </select>
    </div>
    <div class="flex-control-panel__input">
      <span>Flex Wrap:</span>
      <select v-model="dataActiveComponentConfig.style['flex-wrap']">
        <option value="nowrap">No Wrap</option>
        <option value="wrap">Wrap</option>
        <option value="wrap-reverse">Wrap Reverse</option>
      </select>
    </div>
    <div class="flex-control-panel__input">
      <span>Flex Justify:</span>
      <select v-model="dataActiveComponentConfig.style['justify-content']">
        <option value="flex-start">Flex Start</option>
        <option value="flex-end">Flex End</option>
        <option value="center">Center</option>
        <option value="space-between">Space Between</option>
        <option value="space-around">Space Around</option>
        <option value="space-evenly">Space Evenly</option>
      </select>
    </div>
    <div class="flex-control-panel__input">
      <span>Flex Align:</span>
      <select v-model="dataActiveComponentConfig.style['align-items']">
        <option value="stretch">Stretch</option>
        <option value="flex-start">Flex Start</option>
        <option value="flex-end">Flex End</option>
        <option value="center">Center</option>
        <option value="baseline">Baseline</option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../../storeElsInEditor';

export default defineComponent({
  name: 'FlexControlPanelView',
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
.flex-control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-control-panel__input {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
