import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Company',
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