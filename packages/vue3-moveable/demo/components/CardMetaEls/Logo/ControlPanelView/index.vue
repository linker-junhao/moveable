<template>
  <ImageControl />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import ImageControl from '../../../BaseStyleControlPane/ImageControl/index.vue'

export default defineComponent({
  name: 'LogoControlPanelView',
  components: { ImageControl }
});
</script>
