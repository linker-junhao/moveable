<template>
  <div style="">
    <div @click="() => changeCardType('horizontal')">横板名片</div>
    <div @click="() => changeCardType('vertical')">竖板名片</div>
    <hr />
    <div>
      <GroupWrapper @click="addItem" />
      <Text @click="addItem" />
      <Name @click="addItem" />
      <Title @click="addItem" />
      <Avatar @click="addItem" />
      <Company @click="addItem" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from '../CardMetaEls/Text/BeOptionPreview/index.vue'
import GroupWrapper from '../CardMetaEls/GroupWrapper/BeOptionPreview/index.vue'
import Name from '../CardMetaEls/Name/BeOptionPreview/index.vue'
import Title from '../CardMetaEls/Title/BeOptionPreview/index.vue'
import Avatar from '../CardMetaEls/Avatar/BeOptionPreview/index.vue'
import Company from '../CardMetaEls/Company/BeOptionPreview/index.vue'
import { useStoreElsInEditor, ComponentConfig } from '../../storeElsInEditor';
import { reactive } from 'vue'

const changeCardType = (type: 'vertical'|'horizontal') => {
  const storeElsInEditor = useStoreElsInEditor()
  if (type === 'horizontal') {
    storeElsInEditor.dataConfig[0].style.width = '345px'
    storeElsInEditor.dataConfig[0].style.height = '200px'
  }
  if (type === 'vertical') {
    storeElsInEditor.setDataConfig(reactive<ComponentConfig[]>([{
      "style": {
        "position": "absolute",
        "width": "375px",
        "height": "500px",
        "background-color": "#e6e6e6"
      },
      "uuid": "v",
      "config_field_name": "background",
      "name": "GroupWrapper",
      "dataType": "branch",
      "value": "url('https://ss-static.intsig.net/10000_7995f223aaf104c2856cfb109bc5757a.png')",
      "children": [
        {
          "name": "GroupWrapper",
          "style": {
            "height": "124px",
            "position": "absolute",
            "transform": " translate(28px, 58px) ",
            "width": "325px"
          },
          "config_field_name": "name_title_company_wrapper",
          "editBehavior": {
            "locked": false
          },
          "children": [
            {
              "dataType": "leaf",
              "name": "Name",
              "config_field_name": "name",
              "style": {
                "width": "284px",
                "height": "38px",
                "font-size": "36px",
                "font-family": "'Baloo 2-Bold', 'Baloo 2'",
                "font-weight": "bold",
                "color": "#FFFFFF",
                "line-height": "38px",
                "margin-bottom": "20px",
                "transform": " translate(0px, 0px) "
              },
              "uuid": "f589f9ae-a85b-4e19-8ac8-885c377270ed",
              "value": "Jessica Brown"
            },
            {
              "dataType": "leaf",
              "name": "Title",
              "config_field_name": "title",
              "style": {
                "width": "240px",
                "height": "18px",
                "font-size": "16px",
                "font-family": "'OPlusSans 3.0-Regular', 'OPlusSans 30'",
                "font-weight": "400",
                "color": "#FFFFFF",
                "line-height": "18px",
                "margin-bottom": "5px",
                "transform": " translate(0px, 0px) "
              },
              "uuid": "77d82c15-e66c-4a40-9c4d-2479c2af353d",
              "value": "Marketing Manager"
            },
            {
              "dataType": "leaf",
              "name": "Company",
              "config_field_name": "company",
              "style": {
                "width": "229px",
                "height": "18px",
                "font-size": "16px",
                "font-family": "'OPlusSans 3.0-Regular', 'OPlusSans 30'",
                "font-weight": "400",
                "color": "#FFFFFF",
                "line-height": "18px",
                "transform": " translate(0px, 0px) "
              },
              "uuid": "55c1e6ad-064d-49b2-8bca-68e24cd9c5c4",
              "value": "IntSig Information Co.,Ltd."
            }
          ],
          "dataType": "branch",
          "uuid": "99700339-a636-480f-a5aa-aa838bd8e3ca",
          "value": ""
        },
        {
          "name": "Avatar",
          "config_field_name": "avatar",
          "dataType": "leaf",
          "style": {
            "position": "absolute",
            "width": "233px",
            "height": "233px",
            "border-radius": "50%",
            "transform": " translate(71px, 223px) ",
            "object-fit": "cover"
          },
          "uuid": "6dcb430d-4348-4340-9b55-66296656ca57",
          "value": "https://ccpre1.intsig.net/sync/download_multimedia?url=1222931086_8f87f59ad372d4d58b0a52ddcd9fbb4b"
        },
        {
          "name": "Logo",
          "config_field_name": "logo",
          "dataType": "leaf",
          "style": {
            "position": "absolute",
            "width": "56px",
            "height": "56px",
            "border-radius": "12px",
            "object-fit": "cover",
            "background-color": "white",
            "transform": " translate(281px, 99px) "
          },
          "uuid": "587038f5-6b36-4607-ae4e-05a9d7c51e73",
          "value": "https://www.intsig.com/static/images/common_new/index_kehu_09.png"
        }
      ]
    }]))
  }
}

const addItem = (configData) => {
  const storeElsInEditor = useStoreElsInEditor()
  storeElsInEditor.addComponent(configData)
}

</script>