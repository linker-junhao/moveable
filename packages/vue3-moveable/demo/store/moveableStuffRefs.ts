import Moveable from 'moveable';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const useMoveableStuffRefs = defineStore('moveableStuffRefs', () => {
  
  // 目前活跃的元素
  const activeElRef = ref<HTMLElement|null>()
  const setActiveElRef = (el: HTMLElement|null) => {
    activeElRef.value = el
  }

  // 目前活跃的元素
  const activeElContainerRef = ref<HTMLElement>()
  const setActiveElContainerRef = (el: HTMLElement) => {
    activeElContainerRef.value = el
  }

  // moveable ref
  const moveableRef = ref<Moveable|null>()
  const setMoveableRef = (moveableInstance: Moveable|null) => {
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