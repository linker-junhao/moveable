import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../store/storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Text',
    style: {
      "height": "24px",
      "font-size": "20px"
    },
    dataType: 'leaf',
    uuid: uuidv4(),
    value: 'test',
    icon: {
      class: 'card-icon-font icon-email',
      value: ''
    }
  }
}

export {
  genInitialConfig
}