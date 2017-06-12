import { REHYDRATE } from 'redux-persist/lib/constants';

import {
  FETCH_TODO,
  FETCH_TODO_SUCCESS,
  FETCH_TODO_FAILED,
  ADD_TODO,
  ADD_TODO_SUCCESS,
  ADD_TODO_FAILED,
  EDIT_TODO,
  EDIT_TODO_SUCCESS,
  EDIT_TODO_FAILED,
  DELETE_TODO,
  DELETE_TODO_SUCCESS,
  DELETE_TODO_FAILED,
} from './constants';

const initialState = {
  todos: [],
  fetching: false,
  initialRehydrate: false,
};

export default function mainReducer(state = initialState, action) {
  let todos = state.todos.slice();
  switch (action.type) {
    // add local todo with local id, optimistically add this todo without waiting server response
    case ADD_TODO:
      todos.push(action.payload);
      return Object.assign({}, state, { todos });

    // catch server response and replace local todo object with data received from server response, commiting actual success
    case ADD_TODO_SUCCESS:
      todos = todos.filter((value) => {
        return value.localId !== action.meta.localId;
      });
      todos.push(action.payload.data);
      return Object.assign({}, state, { todos });

    // rollback changes by deleting the local todo in case of request failure
    case ADD_TODO_FAILED:
      todos = todos.filter((value) => {
        return value.id !== action.meta.id;
      });
      return Object.assign({}, state, { todos });

    // optimistically edits todo data prior to sending request, upon failure rollback using FAILED action
    case EDIT_TODO:
      todos[action.payload.index] = Object.assign({}, todos[action.payload.index], action.payload.newTodo);
      return Object.assign({}, state, { todos });

    // this is totally unnecessary but currently Redux-Offline somehow requires an 'commit' action, so this will do
    case EDIT_TODO_SUCCESS:
      todos[action.meta.index] = action.payload.data;
      return Object.assign({}, state, { todos });

    // rollback condition upon failing to update todo data on server, changing data back to old condition
    case EDIT_TODO_FAILED:
      todos[action.meta.index] = action.meta.oldTodo;
      return Object.assign({}, state, { todos });

    // add isDeleting status to deleted object, awaiting server response
    case DELETE_TODO:
      todos[action.payload.index] = Object.assign({}, todos[action.payload.index], { isDeleting: true });
      return Object.assign({}, state, { todos });

    // server has responded with a success (OK), commiting deletion
    case DELETE_TODO_SUCCESS:
      todos.splice(action.meta.index, 1);
      return Object.assign({}, state, { todos });

    // server has failed to respond, rollback deletion
    case DELETE_TODO_FAILED:
      todos[action.meta.index] = action.meta.index;
      return Object.assign({}, state, { todos });

    // fetching to server, set fetching flag to true, displaying loader
    case FETCH_TODO:
      return Object.assign({}, state, { fetching: true });

    // server responded successfully, commiting data given by the server, hiding loader
    case FETCH_TODO_SUCCESS:
      return Object.assign({}, state, { todos: action.payload.data, fetching: false });

    // server fails to respond, hiding loader
    case FETCH_TODO_FAILED:
      return Object.assign({}, state, { fetching: false });

    // confirm state has been rehydrated by redux-persist, for initial fetch chaining purposes (i wish i can use sagas!).
    case REHYDRATE:
      return Object.assign({}, state, { initialRehydrate: true });

    default:
      return state;
  }
}