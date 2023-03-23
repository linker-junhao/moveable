<template>
  <el-form class="avatar-control-panel" v-if="dataActiveComponentConfig">
    <el-form-item label="图片地址" label-width="100px">
      <el-input v-model="dataActiveComponentConfig['value']" />
    </el-form-item>
    <el-form-item label="圆角" label-width="100px">
      <div style="width: 100%;">
        <el-slider :model-value="borderRadiusValueFormatter(dataActiveComponentConfig.style['border-top-left-radius'])" @input="onBorderRadiusChange('border-top-left-radius', $event)" :min="0" :max="100" />
        <el-slider :model-value="borderRadiusValueFormatter(dataActiveComponentConfig.style['border-top-right-radius'])" @input="onBorderRadiusChange('border-top-right-radius', $event)" :min="0" :max="100" />
        <el-slider :model-value="borderRadiusValueFormatter(dataActiveComponentConfig.style['border-bottom-right-radius'])" @input="onBorderRadiusChange('border-bottom-right-radius', $event)" :min="0" :max="100" />
        <el-slider :model-value="borderRadiusValueFormatter(dataActiveComponentConfig.style['border-bottom-left-radius'])" @input="onBorderRadiusChange('border-bottom-left-radius', $event)" :min="0" :max="100" />
      </div>
    </el-form-item>
    <el-form-item label="填充方式" label-width="100px">
      <el-select v-model="dataActiveComponentConfig.style['object-fit']">
        <el-option label="填充" value="fill"></el-option>
        <el-option label="包含" value="contain"></el-option>
        <el-option label="覆盖" value="cover"></el-option>
        <el-option label="无" value="none"></el-option>
        <el-option label="缩小" value="scale-down"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="边框样式" label-width="100px">
      <el-select v-model="dataActiveComponentConfig.style['border-style']">
        <el-option label="无" value="none"></el-option>
        <el-option label="隐藏" value="hidden"></el-option>
        <el-option label="点线" value="dotted"></el-option>
        <el-option label="虚线" value="dashed"></el-option>
        <el-option label="实线" value="solid"></el-option>
        <el-option label="双线" value="double"></el-option>
        <el-option label="3D沟槽" value="groove"></el-option>
        <el-option label="3D脊" value="ridge"></el-option>
        <el-option label="3D内嵌" value="inset"></el-option>
        <el-option label="3D外嵌" value="outset"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="边框宽度" label-width="100px">
      <el-select v-model="dataActiveComponentConfig.style['border-width']">
        <el-option label="细" value="thin"></el-option>
        <el-option label="中" value="medium"></el-option>
        <el-option label="粗" value="thick"></el-option>
        <el-option label="1像素" value="1px"></el-option>
        <el-option label="2像素" value="2px"></el-option>
        <el-option label="3像素" value="3px"></el-option>
        <el-option label="4像素" value="4px"></el-option>
        <el-option label="5像素" value="5px"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="边框颜色" label-width="100px">
      <el-color-picker v-model="dataActiveComponentConfig.style['border-color']" />
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStoreElsInEditor } from '../../../storeElsInEditor';

export default defineComponent({
  name: 'ImageControl',
  setup() {
    const storeElsInEditor = useStoreElsInEditor();
    const { dataActiveComponentConfig } = storeElsInEditor;

    const onBorderRadiusChange = (type: string, val: number) => {
      if (dataActiveComponentConfig) {
        dataActiveComponentConfig.style[type] = `${val}%`;
      }
    };

    const borderRadiusValueFormatter = (val) => {
      return parseInt(val?.toString().replace(/%$/, '') || '0')
    }

    return {
      dataActiveComponentConfig,
      onBorderRadiusChange,
      borderRadiusValueFormatter
    };
  },
});
</script>

<style scoped>
.avatar-control-panel {
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 20px;
}
</style>
