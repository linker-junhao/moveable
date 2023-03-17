<template>
  <div @click="handleClick">Logo</div>
</template>

<script setup lang="ts">
import { ComponentConfig } from '../../../../storeElsInEditor';
import { genInitialConfig } from '../exUtils';

const emit = defineEmits<{
  (e: 'click', componentConfig: ComponentConfig): void
}>()

const handleClick = () => {
  emit('click', genInitialConfig())
}

</script>