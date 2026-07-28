import localStorage from "local-storage";
import { isEmpty, isPlainObject } from "lodash";

export function persistRedux(reducer, data) {
    if (reducer && isPlainObject(data) && !isEmpty(data)) {
        let reduxStates = localStorage.get('redux');
        if (!isPlainObject(reduxStates)) {
            reduxStates = {};
        }
        reduxStates[reducer] = data;

        localStorage.set('redux', reduxStates);
    }
}
