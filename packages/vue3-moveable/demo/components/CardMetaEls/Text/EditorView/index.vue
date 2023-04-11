<template>
  <div :class="`card-el ${props.componentConfig.class || ''}`" :style="props.componentConfig.style">
    <span
      v-if="props.componentConfig.icon?.class"
      :class="`${props.componentConfig.icon.class}`"
      :style="`${props.componentConfig.icon.style}`"
    >
      {{ props.componentConfig.icon.value }}
    </span>
    <span>
      {{ props.componentConfig.value }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { LeafComponentConfig } from '../../../../store/storeElsInEditor';

const props = defineProps<{
  componentConfig: LeafComponentConfig
}>()
</script>