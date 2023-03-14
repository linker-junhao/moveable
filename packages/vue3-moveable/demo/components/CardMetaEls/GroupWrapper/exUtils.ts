import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../storeElsInEditor"

const genInitialConfig: (children: ComponentConfig[]) => ComponentConfig = (children) => {
  return {
    name: 'GroupWrapper',
    style: {
      "position": "absolute",
      "width": "325px",
      "height": "200px"
    },
    children,
    dataType: 'branch',
    uuid: uuidv4(),
    value: "url('https://img0.baidu.com/it/u=3032776730,2178451350&fm=253&fmt=auto&app=120&f=JPEG?w=1280&h=800')"
  }
}

export {
  genInitialConfig
}