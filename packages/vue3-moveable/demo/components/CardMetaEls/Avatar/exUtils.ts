import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../storeElsInEditor"

const genInitialConfig: () => ComponentConfig = () => {
  return {
    name: 'Avatar',
    dataType: 'leaf',
    style: {
      "position": "absolute",
      "width": "80px",
      "height": "80px",
      "border-radius": "12px"
    },
    uuid: uuidv4(),
    value: "https://img0.baidu.com/it/u=3032776730,2178451350&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800"
  }
}

export {
  genInitialConfig
}