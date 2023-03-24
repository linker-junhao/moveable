<template>
  <div v-if="dataActiveComponentConfig">
    <input placeholder="宽" v-model="dataActiveComponentConfig.style.width" />
    x
    <input placeholder="高"  v-model="dataActiveComponentConfig.style.height" />
  </div>
</template>

<script setup lang="ts">
import { useStoreElsInEditor } from '../../../../store/storeElsInEditor';

const storeElsInEditor = useStoreElsInEditor()
const { dataActiveComponentConfig } = storeElsInEditor
</script>