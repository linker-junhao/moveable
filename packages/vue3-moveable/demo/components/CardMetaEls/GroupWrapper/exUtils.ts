import { BranchComponentConfig } from '../../../store/storeElsInEditor';
import { v4 as uuidv4 } from 'uuid';
import { ComponentConfig } from "../../../store/storeElsInEditor"

interface GroupWrapperType extends BranchComponentConfig { editBehavior: { locked: boolean } }

const genInitialConfig: (children: ComponentConfig[]) => GroupWrapperType = (children) => {
  return {
    name: 'GroupWrapper',
    style: {
      "position": "absolute",
      "width": "345px",
      "height": "200px",
      "background-color": "rgba(230, 230, 230, 0.45)"
    },
    editBehavior: {
      locked: false
    },
    children,
    dataType: 'branch',
    uuid: uuidv4(),
    value: ""
  }
}

export {
  genInitialConfig
}