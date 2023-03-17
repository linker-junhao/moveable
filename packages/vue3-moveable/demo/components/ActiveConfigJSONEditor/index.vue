<template>
  <div style="width: 100%; height: 80vh;" :ref="setJSONEditorElRef"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import JSONEditor from 'jsoneditor'
import { useStoreElsInEditor } from '../../storeElsInEditor';

const storeElsInEditor = useStoreElsInEditor()

const jsonEditorElRef = ref<HTMLElement>()
const setJSONEditorElRef = (e) => {
  jsonEditorElRef.value = e
}

let jsonEditorInstance: any = null
const setJSONEditorInstance = (instance) => {
  jsonEditorInstance = instance
}

const saveJSONToStore = (config) => {
  const activeConfigData = storeElsInEditor.dataActiveComponentConfig
  if(!activeConfigData) {
    return
  }
  if(config.style) {
    activeConfigData.style = config.style
  }
  if(config.value) {
    activeConfigData.value = config.value
  }
  if(config.children && activeConfigData.dataType === 'branch') {
    activeConfigData.children = config.children
  }
}

watchEffect(() => {
  if (!jsonEditorElRef.value) {
    return
  }
  const editor = new JSONEditor(jsonEditorElRef.value, {
    autocomplete: {
      getOptions (text: string, path: string[], input: string, editor) {
        if(path[path.length - 1] === 'position') {
          return ['relative', 'absolute']
        }
        return text
      }
    },
    onChangeText(text) {
      try {
        const json = JSON.parse(text)
        saveJSONToStore(json)
      } catch (e) {
        console.log(e)
      }
    },
    mode: 'tree',
    modes: ['tree', 'view', 'code'],
    enableSort: false,
    sortObjectKeys: true,
    enableTransform: false,
    limitDragging: true,
    onCreateMenu(items, node) {
      const needCut = items.filter(i => {
        return ['jsoneditor-insert', 'jsoneditor-append'].includes(i.className)
      })
      if(needCut && needCut.length) {
        needCut.forEach(i => {
          if(i.submenu && i.submenu.length) {
            i.submenu = i.submenu.filter(ci => {
              return ci.className === 'jsoneditor-type-string'
            })
          }
        });
      }
      return items.filter(i => {
        return !(
          /^jsoneditor-type/.test(i.className) ||
          /^jsoneditor-extract/.test(i.className)
        )
      })
    }
  })
  setJSONEditorInstance(editor)
  // set json
  const initialJson = {}
  editor.set(initialJson)
  editor.expandAll()
})

let currentJsonEditorBindActiveConfigUUid: string|null = null
watchEffect(() => {
  const activeConfigData = storeElsInEditor.dataActiveComponentConfig
  if (!activeConfigData || !jsonEditorInstance) {
    return
  }
  if(currentJsonEditorBindActiveConfigUUid !== activeConfigData.uuid) {
    currentJsonEditorBindActiveConfigUUid = activeConfigData.uuid
    jsonEditorInstance.set(activeConfigData.dataType === 'branch' ? {
      style: activeConfigData.style,
      value: activeConfigData.value,
      children: activeConfigData.children
    } : {
      style: activeConfigData.style,
      value: activeConfigData.value
    })
  }
})

</script>

<style>
@import '~jsoneditor/dist/jsoneditor.min.css';
</style>