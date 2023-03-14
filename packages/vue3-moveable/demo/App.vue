<template>
    <div class="root">
        <div class="editor-page-box">
            <!-- 组件选择栏 -->
            <div>
                <CardMetaElList />
            </div>
            <!-- 渲染预览 -->
            <div class="render-area">
                <TransparentBackground />
                <div :ref="setRootContainer" class="place-ground" style="z-index: 1; position: relative;">
                    <CardElGenerator :container="rootContainerRef" :componentConfig="storeElsInEditor.dataConfig"/>
                </div>
            </div>
            <!-- 组件控制栏 -->
            <div>

            </div>
        </div>
    </div>
</template>
<script>
import { defineComponent, ref } from "vue";
import Moveable from "../src/Moveable.vue";
import { useStoreElsInEditor } from './storeElsInEditor'
import TransparentBackground from './components/TransparentBackground'
import CardElGenerator from './components/CardElGenerator/index.vue'
import CardMetaElList from './components/CardMetaElList/index.vue'

export default defineComponent({
    components: {
        Moveable,
        TransparentBackground,
        CardElGenerator,
        CardMetaElList
    },
    setup() {
        const storeElsInEditor = useStoreElsInEditor()
        const rootContainerRef = ref()
        const setRootContainer = (el) => {
            rootContainerRef.value = el
        }
        return {
            storeElsInEditor,
            setRootContainer,
            rootContainerRef
        };
    },
    data() {}
});
</script>

<style>
.editor-page-box {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
}

.render-area {
    position: relative;
}

.target {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 150px;
    left: 100px;
    line-height: 100px;
    text-align: center;
    background: rgb(43, 74, 253);
    color: #333;
    font-weight: bold;
    border: 1px solid #333;
    box-sizing: border-box;
}

.target1 {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 150px;
    left: 100px;
    line-height: 100px;
    text-align: center;
    background: #ee8;
    color: #333;
    font-weight: bold;
    border: 1px solid #333;
    box-sizing: border-box;
}

.target2 {
    position: absolute;
    width: 100px;
    height: 100px;
    top: 150px;
    left: 100px;
    line-height: 100px;
    text-align: center;
    background: #ee8;
    color: #333;
    font-weight: bold;
    border: 1px solid #333;
    box-sizing: border-box;
}
</style>
