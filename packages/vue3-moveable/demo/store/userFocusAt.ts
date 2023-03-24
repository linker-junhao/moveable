import { defineStore } from "pinia"
import { ref } from "vue"


const useUserFocusAt = defineStore('useFocusAt', () => {
  type UserFocusAt = ''|'Lib'|'MoveableView'|'ConfigPanel'
  const userFocusAt = ref<UserFocusAt>('')
  const setUserFocusAt = (at: UserFocusAt) => {
    userFocusAt.value = at
  }
  return {
    userFocusAt,
    setUserFocusAt
  }
})

export default useUserFocusAt