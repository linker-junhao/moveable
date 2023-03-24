<template>
  <div @click="handleClick">布局容器</div>
</template>

<script setup lang="ts">
import { ComponentConfig } from '../../../../store/storeElsInEditor';
import { genInitialConfig } from '../exUtils';

const emit = defineEmits<{
  (e: 'click', componentConfig: ComponentConfig): void
}>()

const handleClick = () => {
  emit('click', genInitialConfig([]))
}

</script>