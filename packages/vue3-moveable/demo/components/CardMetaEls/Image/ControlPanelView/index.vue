<template>
  <ImageControl />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImageControl from '../../../BaseStyleControlPane/ImageControl/index.vue'

export default defineComponent({
  name: 'ImageControlPanelView',
  components: { ImageControl }
});
</script>
