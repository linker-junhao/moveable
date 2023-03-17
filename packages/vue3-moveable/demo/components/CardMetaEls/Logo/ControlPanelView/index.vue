<template>
  <div v-if="dataActiveComponentConfig?.name === 'Logo'">
    src: <input v-model="dataActiveComponentConfig.value" />
  </div>
</template>

<script setup lang="ts">
import { useStoreElsInEditor } from '../../../../storeElsInEditor';

const storeElsInEditor = useStoreElsInEditor()
const { dataActiveComponentConfig } = storeElsInEditor

</script>