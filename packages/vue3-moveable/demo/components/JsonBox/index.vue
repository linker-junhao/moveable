<template>
  <div class="json-box" style="position: relative;">
    <pre v-html="prettyJson"></pre>
    <button class="copy-button" style="position: sticky; bottom: 0; right: 0;" @click="copyJson">{{buttonText}}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { prettyPrintJson } from 'pretty-print-json';

export default defineComponent({
  name: 'JsonBox',
  props: {
    json: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const prettyJson = ref('');
    const buttonText = ref('复制 JSON');

    watch(
      () => props.json,
      (newVal) => {
        prettyJson.value = prettyPrintJson.toHtml(newVal || {});
      },
      { immediate: true }
    );

    const copyJson = () => {
      const jsonText = JSON.stringify(props.json, null, 2);
      navigator.clipboard.writeText(jsonText);
      buttonText.value = '复制成功';
      setTimeout(() => {
        buttonText.value = '复制 JSON';
      }, 2000);
    };

    return {
      prettyJson,
      copyJson,
      buttonText,
    };
  },
});
</script>

<style scoped>
.json-box {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  height: 100%;
  box-sizing: border-box;
}

.copy-button {
  right: 10px;
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 4px;
  background-color: #007aff;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
