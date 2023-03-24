import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../store/storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Text',
    style: {
      "position": "absolute",
      "width": "180px",
      "height": "24px",
      "background-color": 'red'
    },
    dataType: 'leaf',
    uuid: uuidv4(),
    value: 'test'
  }
}

export {
  genInitialConfig
}