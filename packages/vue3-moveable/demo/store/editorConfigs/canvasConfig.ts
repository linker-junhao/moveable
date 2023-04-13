import { defineStore } from "pinia";
import { ref } from "vue";

const useCanvasConfig = defineStore('canvasConfig', () => {
  const showOutletLineOfSubEl = ref(true)
  const toggleShowOutletLineOfSubEl = () => {
    showOutletLineOfSubEl.value = !showOutletLineOfSubEl.value
  }

  const scale = ref<number>(1)
  const setScale = (set: (scale: number) => number) => {
    scale.value = set(scale.value)
  }

  return {
    showOutletLineOfSubEl,
    toggleShowOutletLineOfSubEl,
    scale,
    setScale
  }
})

export {
  useCanvasConfig
}