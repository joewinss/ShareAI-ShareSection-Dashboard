export const LOGIN_SUCCESSFUL = 'LOGIN_SUCCESSFUL';
export const LOGOUT_SUCCESSFUL = 'LOGOUT_SUCCESSFUL';
export const UPDATE_USER = 'UPDATE_USER';
export const UPDATE_BUSINESS_INFO = 'UPDATE_BUSINESS_INFO';
export const LOGIN_TIME = 'LOGIN_TIME';
export const SET_OUTLET_BADGE_COUNT = 'SET_OUTLET_BADGE_COUNT';
export const UPDATE_WALLET = 'UPDATE_WALLET';

export function loginSuccessful(user, accessKey) {
  return (dispatch) => {
    dispatch({
      type: LOGIN_SUCCESSFUL,
      user,
      accessKey,
    });
  }
}

export function updateLoginTime() {
  return (dispatch) => {
    dispatch({
      type: LOGIN_TIME,
    });
  }
}

export function logoutSuccessful() {
  return (dispatch) => {
    dispatch({
      type: LOGOUT_SUCCESSFUL,
    });
  }
}

export function updateUser(user) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_USER,
      user,
    });
  }
}

export function updateBusinessInfo(businessInfo) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_BUSINESS_INFO,
      businessInfo,
    });
  }
}

export function updateWallet(wallet) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_WALLET,
      wallet,
    });
  }
}

export function updateOutletBadgeCountV2(count) {
  return (dispatch) => {
    dispatch({
      type: SET_OUTLET_BADGE_COUNT,
      outletBadgeCount: count,
    });
  }
}
