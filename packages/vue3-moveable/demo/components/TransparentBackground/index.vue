<template>
  <svg style="position: absolute; left: 0; top: 0;" version="1.1" viewBox="0 0 500 1000">
    <pattern x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" id="transparent" viewBox="0 -10 10 10"
      overflow="visible">
      <g>
        <polygon fill="none" points="0,-10 10,-10 10,0 0,0 		" />
        <polygon fill="#F2F2F2" points="5,-5 0,-5 0,-10 5,-10 		" />
        <polygon fill="#FFFFFF" points="10,-5 5,-5 5,-10 10,-10 		" />
        <polygon fill="#F2F2F2" points="5,0 10,0 10,-5 5,-5 		" />
        <polygon fill="#FFFFFF" points="0,0 5,0 5,-5 0,-5 		" />
      </g>
    </pattern>
    <g id="central-transparent">
      <rect x="0" y="0" display="inline" fill="url(#transparent)" width="1024" height="768" />
    </g>
  </svg>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TransparentBackground'
})
</script>