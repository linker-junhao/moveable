<template>
  <div style="">
    <Text />
  </div>
</template>

<script>
import Text from '../CardMetaEls/Text/BeOptionPreview/index.vue'

export default defineComponent({
  name: 'CardMetaElList',
  components: {
    Text
  },
  data() {
    return {
      list: ['Text', 'GroupWrapper']
    }
  },
  mounted() {
    this.data
  },
})

</script>