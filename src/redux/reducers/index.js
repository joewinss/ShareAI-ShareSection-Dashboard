import { combineReducers } from 'redux';
import userReducers from './user-reducers';

const reducers = {
  user: userReducers,
}

export const rootReducer = combineReducers(reducers);

