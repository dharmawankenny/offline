import axios from 'axios';
import MD5 from 'crypto-js/md5';

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

const API_BASE = 'http://localhost:8000';
// const API_BASE = 'http://daenerys-server.herokuapp.com';

// export function getTodos() {
//   return (dispatch) => {
//     return fetchTodo().then(
//       res => dispatch(getTodoSuccess(res.data)),
//       err => dispatch(getTodoFailed(err)),
//     );
//   };
// }

export function getTodos() {
  return {
    type: FETCH_TODO,
    meta: {
      offline: {
        effect: { url: `${API_BASE}/tasks/`, method: 'GET' },
        commit: { type: FETCH_TODO_SUCCESS },
        rollback: { type: FETCH_TODO_FAILED },
      },
    }
  };
}

// export function addTodo(todo) {
//   return (dispatch) => {
//     return postTodo(todo).then(
//       res => dispatch(addTodoSuccess(res.data)),
//       err => dispatch(addTodoFailed(err)),
//     );
//   };
// }

export function addTodo(todo, index) {
  const localId = MD5({ todo, index }).toString();

  return {
    type: ADD_TODO,
    payload: { name: todo, localId },
    meta: {
      offline: {
        effect: { url: `${API_BASE}/tasks/`, method: 'POST', data: { name: todo } },
        commit: { type: ADD_TODO_SUCCESS, meta: { localId } },
        rollback: { type: ADD_TODO_FAILED, meta: { localId } },
      },
    }
  };
}

// export function editTodo(id, newTodo, index) {
//   return (dispatch) => {
//     return putTodo(id, newTodo).then(
//       res => dispatch(editTodoSuccess(res.data, index)),
//       err => dispatch(editTodoFailed(err)),
//     );
//   };
// }

export function editTodo(id, oldTodo, newTodo, index) {
  console.log(id, oldTodo, newTodo, index);
  return {
    type: EDIT_TODO,
    payload: { newTodo, index },
    meta: {
      offline: {
        effect: { url: `${API_BASE}/tasks/${id}`, method: 'PUT', data: newTodo },
        commit: { type: EDIT_TODO_SUCCESS, meta: { index } },
        rollback: { type: EDIT_TODO_FAILED, meta: { oldTodo, index } },
      },
    }
  };
}

// export function finishTodo(id, index) {
//   return (dispatch) => {
//     return deleteTodo(id).then(
//       res => dispatch(deleteTodoSuccess(index)),
//       err => dispatch(deleteTodoFailed(err)),
//     );
//   };
// }

export function finishTodo(todo, index) {
  return {
    type: DELETE_TODO,
    payload: { index },
    meta: {
      offline: {
        effect: { url: `${API_BASE}/tasks/${todo._id}`, method: 'DELETE' },
        commit: { type: DELETE_TODO_SUCCESS, meta: { index } },
        rollback: { type: DELETE_TODO_FAILED, meta: { todo, index } },
      },
    }
  };
}

// function fetchTodo() {
//   return axios.get('${API_BASE}/tasks/');
// }

// function postTodo(todo) {
//   return axios.post('${API_BASE}/tasks/', {
//     name: todo,
//   });
// }

// function putTodo(id, todo) {
//   return axios.put(`${API_BASE}/tasks/${id}`, todo);
// }

// function deleteTodo(id) {
//   return axios.delete(`${API_BASE}/tasks/${id}`);
// }

// function getTodoSuccess(todos) {
//   return {
//     type: FETCH_TODO_SUCCESS,
//     todos,
//   }
// }

// function getTodoFailed(err) {
//   return {
//     type: FETCH_TODO_FAILED,
//     err,
//   }
// }

// function addTodoSuccess(todo) {
//   return {
//     type: ADD_TODO_SUCCESS,
//     todo,
//   };
// }

// function addTodoFailed(err) {
//   return {
//     type: ADD_TODO_FAILED,
//     err,
//   };
// }

// function editTodoSuccess(todo, index) {
//   return {
//     type: EDIT_TODO_SUCCESS,
//     todo,
//     index,
//   };
// }

// function editTodoFailed(err) {
//   return {
//     type: EDIT_TODO_FAILED,
//     err,
//   };
// }

// function deleteTodoSuccess(index) {
//   return {
//     type: DELETE_TODO_SUCCESS,
//     index,
//   };
// }

// function deleteTodoFailed(err) {
//   return {
//     type: DELETE_TODO_FAILED,
//     err,
//   };
// }
