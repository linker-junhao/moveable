
<template>
  <el-form label-width="100px" label-align="right" v-if="dataActiveComponentConfig">
    <el-form-item label="配置字段名">
      <el-input v-model="dataActiveComponentConfig.config_field_name" />
    </el-form-item>
    <el-form-item label="锁定布局位置">
      <el-checkbox
        :model-value="dataActiveComponentConfig.editBehavior?.locked"
        @change="layoutLockChangeHandler"
      />
    </el-form-item>
    <el-form-item label="宽度">
      <el-input
        :model-value="dataActiveComponentConfig.style['width'] || 'auto'"
        @input="val => WHinputInputHandler('width', val)"
      />
    </el-form-item>
    <el-form-item label="宽度">
      <el-input
        :model-value="dataActiveComponentConfig.style['height'] || 'auto'"
        @input="val => WHinputInputHandler('height', val)"
      />
    </el-form-item>
    <el-form-item label="背景颜色" label-width="100px" label-align="right">
      <el-color-picker show-alpha v-model="dataActiveComponentConfig.style['background-color']" />
    </el-form-item>
    <el-form-item label="透明度">
      <el-slider :min="0" :max="1" :step="0.01" :model-value="+(dataActiveComponentConfig.style['opacity'] || 1)" 
       @input="opacityChangeHandler"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { Arrayable } from 'element-plus/es/utils';
import { useStoreElsInEditor } from '../../../store/storeElsInEditor';

const storeElsInEditor = useStoreElsInEditor();
const { dataActiveComponentConfig } = storeElsInEditor;

const opacityChangeHandler = (val: Arrayable<number>) => {
  if(dataActiveComponentConfig) {
    dataActiveComponentConfig.style['opacity'] = val.toString()
  }
}

const WHinputInputHandler = (type: 'width'|'height', val: string) => {
  if(dataActiveComponentConfig) {
    dataActiveComponentConfig.style[type] = val.toString()
  }
}

const layoutLockChangeHandler = (val: boolean) => {
  console.log(val)
  if(dataActiveComponentConfig!.editBehavior) {
    dataActiveComponentConfig!.editBehavior.locked = val
  } else {
    dataActiveComponentConfig!.editBehavior = {
      locked: val
    }
  }
  
}

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

