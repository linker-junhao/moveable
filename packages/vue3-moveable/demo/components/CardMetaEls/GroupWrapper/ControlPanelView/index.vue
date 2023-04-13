<template>
  <Base />
  <el-form v-if="dataActiveComponentConfig" label-width="100px" label-align="right">
    <el-form-item label="开启弹性布局">
      <el-switch :model-value="dataActiveComponentConfig.style['display'] === 'flex'" active-color="#13ce66"
        inactive-color="#ff4949" active-text="开启" inactive-text="关闭" @change="flexOnOffChangeHandler" />
    </el-form-item>
    <template v-if="dataActiveComponentConfig.style['display'] === 'flex'">
      <el-form-item label="弹性方向">
        <el-select v-model="dataActiveComponentConfig.style['flex-direction']">
          <el-option label="行" value="row"></el-option>
          <el-option label="行反转" value="row-reverse"></el-option>
          <el-option label="列" value="column"></el-option>
          <el-option label="列反转" value="column-reverse"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="弹性换行">
        <el-select v-model="dataActiveComponentConfig.style['flex-wrap']">
          <el-option label="不换行" value="nowrap"></el-option>
          <el-option label="换行" value="wrap"></el-option>
          <el-option label="换行反转" value="wrap-reverse"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="对齐方式">
        <el-select v-model="dataActiveComponentConfig.style['justify-content']">
          <el-option label="弹性开始" value="flex-start"></el-option>
          <el-option label="弹性结束" value="flex-end"></el-option>
          <el-option label="居中" value="center"></el-option>
          <el-option label="两端对齐" value="space-between"></el-option>
          <el-option label="环绕对齐" value="space-around"></el-option>
          <el-option label="均匀分布" value="space-evenly"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="对齐项目">
        <el-select v-model="dataActiveComponentConfig.style['align-items']">
          <el-option label="拉伸" value="stretch"></el-option>
          <el-option label="弹性开始" value="flex-start"></el-option>
          <el-option label="弹性结束" value="flex-end"></el-option>
          <el-option label="居中" value="center"></el-option>
          <el-option label="基线" value="baseline"></el-option>
        </el-select>
      </el-form-item>
    </template>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../../store/storeElsInEditor';
import Base from '../../../BaseStyleControlPane/Base/index.vue'

export default defineComponent({
  name: 'FlexControlPanelView',
  components: { Base },
  setup() {
    const storeElsInEditor = useStoreElsInEditor();
    const { dataActiveComponentConfig } = storeElsInEditor;

    const flexOnOffChangeHandler = (isOn: boolean) => {
      if (isOn) {
        dataActiveComponentConfig!.style['display'] = 'flex'
      } else {
        dataActiveComponentConfig!.style['display'] = 'block'
      }
    }

    return {
      dataActiveComponentConfig,
      flexOnOffChangeHandler
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

