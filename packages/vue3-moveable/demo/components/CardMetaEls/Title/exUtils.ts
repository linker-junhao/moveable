import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../store/storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Title',
    style: {
      "position": "absolute",
      "font-size": "16px",
      "width": "180px",
      "height": "20px"
    },
    dataType: 'leaf',
    uuid: uuidv4(),
    value: "职位"
  }
}

export {
  genInitialConfig
}