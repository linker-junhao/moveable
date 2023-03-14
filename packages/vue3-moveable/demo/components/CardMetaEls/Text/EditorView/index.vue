<template>
  <div :style="props.componentConfig.style">
    {{ props.componentConfig.value }}
  </div>
</template>

<script setup lang="ts">
import { LeafComponentConfig } from '../../../../storeElsInEditor';

const props = defineProps<{
  componentConfig: LeafComponentConfig
}>()
</script>