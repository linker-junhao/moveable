<template>
  <div v-if="dataActiveComponentConfig">
    <el-form>
      <el-form-item label="值" label-width="100px" label-align="right">
        <el-input type="textarea" v-model="dataActiveComponentConfig['value']" />
      </el-form-item>
      <template v-if="dataActiveComponentConfig.style">
        <el-form-item label="字体大小" label-width="100px" label-align="right">
          <el-slider
            :model-value="parseInt(dataActiveComponentConfig.style['font-size']?.toString()?.replace(/px$/, '') || '0')"
            @input="fontSizeChanged"
            :min="10" :max="100"
          />
        </el-form-item>
        <el-form-item label="颜色" label-width="100px" label-align="right">
          <el-color-picker v-model="dataActiveComponentConfig.style['color']" />
        </el-form-item>
        <el-form-item label="字体样式" label-width="100px" label-align="right">
          <el-select v-model="dataActiveComponentConfig.style['font-style']">
            <el-option value="normal" style="font-style: normal">正常</el-option>
            <el-option value="italic" style="font-style: italic">斜体</el-option>
            <el-option value="oblique" style="font-style: oblique">倾斜</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字体粗细" label-width="100px" label-align="right">
          <el-select v-model="dataActiveComponentConfig.style['font-weight']">
            <el-option value="normal" style="font-weight: normal">正常</el-option>
            <el-option value="bold" style="font-weight: bold">粗体</el-option>
            <el-option value="lighter" style="font-weight: lighter">较轻</el-option>
            <el-option value="bolder" style="font-weight: bolder">较重</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字体" label-width="100px" label-align="right">
          <el-select v-model="dataActiveComponentConfig.style['font-family']">
            <el-option value="Arial" style="font-family: Arial">Arial</el-option>
            <el-option value="Helvetica" style="font-family: Helvetica">Helvetica</el-option>
            <el-option value="Times New Roman" style="font-family: 'Times New Roman'">Times New Roman</el-option>
            <el-option value="Times" style="font-family: Times">Times</el-option>
            <el-option value="Courier New" style="font-family: 'Courier New'">Courier New</el-option>
            <el-option value="Courier" style="font-family: Courier">Courier</el-option>
            <el-option value="Verdana" style="font-family: Verdana">Verdana</el-option>
            <el-option value="Georgia" style="font-family: Georgia">Georgia</el-option>
            <el-option value="Palatino" style="font-family: Palatino">Palatino</el-option>
            <el-option value="Garamond" style="font-family: Garamond">Garamond</el-option>
            <el-option value="Bookman" style="font-family: Bookman">Bookman</el-option>
            <el-option value="Comic Sans MS" style="font-family: 'Comic Sans MS'">Comic Sans MS</el-option>
            <el-option value="Trebuchet MS" style="font-family: 'Trebuchet MS'">Trebuchet MS</el-option>
            <el-option value="Arial Black" style="font-family: 'Arial Black'">Arial Black</el-option>
            <el-option value="Impact" style="font-family: Impact">Impact</el-option>
            <el-option value="Lucida Sans Unicode" style="font-family: 'Lucida Sans Unicode'">Lucida Sans Unicode</el-option>
            <el-option value="Tahoma" style="font-family: Tahoma">Tahoma</el-option>
            <el-option value="Lucida Console" style="font-family: 'Lucida Console'">Lucida Console</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文本对齐" label-width="100px" label-align="right">
          <el-select v-model="dataActiveComponentConfig.style['text-align']">
            <el-option value="left">左对齐</el-option>
            <el-option value="center">居中对齐</el-option>
            <el-option value="right">右对齐</el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useStoreElsInEditor } from '../../../store/storeElsInEditor';

export default defineComponent({
  name: 'TextControl',
  setup() {
    const storeElsInEditor = useStoreElsInEditor();
    const { dataActiveComponentConfig } = storeElsInEditor;

    const fontSizeChanged = (val) => {
      dataActiveComponentConfig!.style['font-size'] = val+'px'
    }

    return {
      dataActiveComponentConfig,
      fontSizeChanged
    };
  },
});
</script>

