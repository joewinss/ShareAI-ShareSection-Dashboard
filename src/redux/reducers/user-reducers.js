import localStorage from "local-storage";
import { get, isEqual, set } from "lodash";
import { LOGIN_SUCCESSFUL, LOGOUT_SUCCESSFUL, UPDATE_USER, UPDATE_BUSINESS_INFO, LOGIN_TIME, SET_OUTLET_BADGE_COUNT, UPDATE_WALLET } from "../actions/user-actions";
import { persistRedux } from "../config";

const INITIAL_STATE = {
    user: {},
    isAuthenticated: false,
    accessKey: '',
    loginTime: null,
    outletBadgeCount: 0,
}
export default function userReducer(state = INITIAL_STATE, action) {

    let persistStates = get(localStorage.get('redux') || {}, 'user') || INITIAL_STATE;
    let newState = {
        ...state,
        ...persistStates
    }

    if (!isEqual(state, newState)) {
        state = newState;
    }

    switch (action.type) {
        case LOGIN_SUCCESSFUL:
            state = {
                ...state,
                user: get(action, 'user') || INITIAL_STATE.user,
                isAuthenticated: true,
                accessKey: get(action, 'accessKey') || INITIAL_STATE.accessKey,
                loginTime: new Date() || INITIAL_STATE.loginTime,
            }
            break;

        case LOGIN_TIME:
            state = {
                ...state,
                loginTime: new Date() || INITIAL_STATE.loginTime,
            }
            break;

        case LOGOUT_SUCCESSFUL:
            state = {
                ...state,
                user: INITIAL_STATE.user,
                isAuthenticated: false,
                accessKey: INITIAL_STATE.accessKey,
                loginTime: INITIAL_STATE.loginTime,
            }
            break;

        case UPDATE_USER:
            state = {
                ...state,
                user: {
                    ...state.user,
                    ...get(action, 'user'),
                }
            }
            break;

        case UPDATE_BUSINESS_INFO:
            state = {
                ...state,
                user: {
                    ...state.user,
                    businessInfo: {
                        ...state.user.businessInfo,
                        ...get(action, 'businessInfo'),
                    }
                }
            }

            break;

        case UPDATE_WALLET:
            state = {
                ...state,
                user: {
                    ...state.user,
                    wallet: get(action, 'wallet', []),
                },
            };
            break;

        case SET_OUTLET_BADGE_COUNT:
            state = {
                ...state,
                outletBadgeCount: get(action, 'outletBadgeCount', 0),
            };
            break;

        default:
            break;
    }

    persistRedux('user', state);
    return state;
}
