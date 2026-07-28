import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { rootReducer } from './reducers';
import { configureStore } from '@reduxjs/toolkit';

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    }
    if (state.count.count) nextState.count.count = state.count.count // preserve count value on client side navigation
    return nextState
  } else {
    return rootReducer(state, action)
  }
}

const makeStore = () => {
  return configureStore({
    reducer,
    // Middleware includes thunk by default
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }), // Include any custom middleware if needed
  });
};

export const wrapper = createWrapper(makeStore);
