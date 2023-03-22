<template>
  <div class="avatar-control-panel">
    <div class="avatar-control-panel__item">
      <span class="avatar-control-panel__label">图片地址:</span>
      <input v-model="dataActiveComponentConfig['value']" class="avatar-control-panel__input" />
    </div>
    <div class="avatar-control-panel__item">
      <span class="avatar-control-panel__label">圆角:</span>
      <input v-model="dataActiveComponentConfig.style['border-radius']" class="avatar-control-panel__input" />
    </div>
    <div class="avatar-control-panel__item">
      <span class="avatar-control-panel__label">填充方式:</span>
      <select v-model="dataActiveComponentConfig.style['object-fit']" class="avatar-control-panel__select">
        <option value="fill">填充</option>
        <option value="contain">包含</option>
        <option value="cover">覆盖</option>
        <option value="none">无</option>
        <option value="scale-down">缩小</option>
      </select>
    </div>
    <div class="avatar-control-panel__item">
      <span class="avatar-control-panel__label">边框样式:</span>
      <select v-model="dataActiveComponentConfig.style['border-style']" class="avatar-control-panel__select">
        <option value="none">无</option>
        <option value="hidden">隐藏</option>
        <option value="dotted">点线</option>
        <option value="dashed">虚线</option>
        <option value="solid">实线</option>
        <option value="double">双线</option>
        <option value="groove">3D沟槽</option>
        <option value="ridge">3D脊</option>
        <option value="inset">3D内嵌</option>
        <option value="outset">3D外嵌</option>
      </select>
    </div>
    <div class="avatar-control-panel__item">
      <span class="avatar-control-panel__label">边框宽度:</span>
      <select v-model="dataActiveComponentConfig.style['border-width']" class="avatar-control-panel__select">
        <option value="thin">细</option>
        <option value="medium">中</option>
        <option value="thick">粗</option>
        <option value="1px">1像素</option>
        <option value="2px">2像素</option>
        <option value="3px">3像素</option>
        <option value="4px">4像素</option>
        <option value="5px">5像素</option>
      </select>
    </div>
    <div class="avatar-control-panel__item">
      <span class="avatar-control-panel__label">边框颜色:</span>
      <input type="color" v-model="dataActiveComponentConfig.style['border-color']" class="avatar-control-panel__input" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../../storeElsInEditor';

export default defineComponent({
  name: 'AvatarControlPanelView',
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
.avatar-control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.avatar-control-panel__item {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

