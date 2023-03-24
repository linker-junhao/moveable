<template>
  <div class="card-el" :style="props.componentConfig.style">
    {{ props.componentConfig.value }}
  </div>
</template>

<script setup lang="ts">
import { LeafComponentConfig } from '../../../../store/storeElsInEditor';

const props = defineProps<{
  componentConfig: LeafComponentConfig
}>()
</script>