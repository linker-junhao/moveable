<template>
  <img class="card-el" :style="props.componentConfig.style" :src="props.componentConfig.value" />
</template>

<script setup lang="ts">
import { BranchComponentConfig } from '../../../../store/storeElsInEditor';

const props = defineProps<{
  componentConfig: BranchComponentConfig
}>()

</script>