import { defineStore } from 'pinia';
import { ref } from 'vue';

const useMoveableStuffRefs = defineStore('moveableStuffRefs', () => {
  
  // 目前活跃的元素
  const activeElRef = ref<HTMLElement>()
  const setActiveElRef = (el) => {
    activeElRef.value = el
  }

  // 目前活跃的元素
  const activeElContainerRef = ref<HTMLElement>()
  const setActiveElContainerRef = (el) => {
    activeElContainerRef.value = el
  }

  // moveable ref
  const moveableRef = ref()
  const setMoveableRef = (moveableInstance) => {
    moveableRef.value = moveableInstance
  }

  return {
    activeElRef,
    setActiveElRef,
    activeElContainerRef,
    setActiveElContainerRef,
    moveableRef,
    setMoveableRef
  }
})

export {
  useMoveableStuffRefs
}