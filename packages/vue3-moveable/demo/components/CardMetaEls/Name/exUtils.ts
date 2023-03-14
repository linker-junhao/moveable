import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Name',
    style: {
      "position": "absolute",
      "width": "120px",
      "height": "28px",
      "line-height": "28px",
      "font-size": "24px"
    },
    dataType: 'leaf',
    uuid: uuidv4(),
    value: "姓名"
  }
}

export {
  genInitialConfig
}