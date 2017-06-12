import { createSelector } from 'reselect';
import { toJS } from 'immutable'

export const stateSelector = state => state;

export const offlineSelector = createSelector(
  stateSelector,
  state => state.offline
);

export const todosSelector = createSelector(
  stateSelector,
  state => state.todos
);

export const fetchingSelector = createSelector(
  stateSelector,
  state => state.fetching
);

export const initialRehydrateSelector = createSelector(
  stateSelector,
  state => state.initialRehydrate
);