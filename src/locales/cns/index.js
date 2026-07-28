import templateJson from "./template.json";

import { forEach, mapKeys } from 'lodash'
import { sourceKey } from '../config'

const objectsToRemap = [
    {
        value: templateJson,
        key: sourceKey.template,
    },
]

let remappedObjects = {}
forEach(objectsToRemap, (item) => {
    let newObj = item.value;
    if (item.key) {
        newObj = mapKeys(item.value, (value, key) => {
            return `${item.key}.${key}`
        })
    }

    remappedObjects = {
        ...remappedObjects,
        ...newObj
    }
})


const allEnJson = {
    ...remappedObjects
}

export default allEnJson