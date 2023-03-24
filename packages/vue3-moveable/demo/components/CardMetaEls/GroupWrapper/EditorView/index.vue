<template>
  <div class="card-el" :ref="setContainerRef" :style="{ ...props.componentConfig.style, 'background-image': props.componentConfig.value }">
    <slot :container="containerRef"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BranchComponentConfig } from '../../../../store/storeElsInEditor';

const props = defineProps<{
  componentConfig: BranchComponentConfig
}>()

const containerRef = ref<HTMLElement>()
const setContainerRef = (e) => {
  containerRef.value = e
}

</script>