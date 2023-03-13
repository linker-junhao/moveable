import { ComponentConfig } from "../../../storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Text',
    style: {
      "white-space": 'nowrap'
    },
    dataType: 'leaf',
    children: []
  }
}