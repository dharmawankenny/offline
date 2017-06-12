import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import MD5 from 'crypto-js/md5';

import {
  ADD_TODO,
} from '../../constants';

import {
  getTodos,
  addTodo,
  editTodo,
  finishTodo,
} from '../../actions';

import {
  offlineSelector,
  todosSelector,
  fetchingSelector,
  initialRehydrateSelector,
} from '../../selectors';

export class App extends React.Component {
  constructor() {
    super();

    this.state = {
      todoInput: '',
    };

    this.add = this.add.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.edit = this.edit.bind(this);
    this.finish = this.finish.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.initialRehydrate && nextProps.initialRehydrate) {
      if (this.props.offline.online && nextProps.offline.online) {
        this.props.getTodos();
      }
    }
  }

  add() {
    if (!isEmpty(this.state.todoInput)) {
      this.props.addTodo(this.state.todoInput);
      this.setState({ todoInput: '' });
    }
  }

  onInputChange(value) {
    this.setState({ todoInput: value });
  }

  onKeyPress(target) {
    if (target.charCode === 13) {
      console.log('abc');
      this.add();
    }
  }

  edit(id, todo, index) {
    const newTodo = {
      name: todo.name,
      status: '',
    };

    if (todo.status === 'pending') {
      newTodo.status = 'complete';
    } else if (todo.status === 'complete') {
      newTodo.status = 'pending';
    }

    this.props.editTodo(id, todo, newTodo, index);
  }

  finish(todo, index) {
    this.props.finishTodo(todo, index);
  }

  render() {
    let isCreatedOffline = false;

    let content = this.props.todos.map((value, index) => {
      isCreatedOffline = false;

      this.props.offline.outbox.map((outboxValue) => {
        if (outboxValue.type === ADD_TODO) {
          if (outboxValue.payload.localId === value.localId) {
            isCreatedOffline = true;
          }
        }
      });

      return (
        <div className={isCreatedOffline || value.isDeleting ? 'todo offline' : 'todo'} key={`todo-${index}`}>
          <input
            className="checkbox"
            id={`checkbox-content-${index}`}
            onChange={() => this.edit(value._id, value, index)} type="checkbox" checked={value.status === 'complete'}
            disabled={isCreatedOffline || value.isDeleting}
            />
          <label htmlFor={`checkbox-content-${index}`}></label>
          <div className="content">
            {value.name}
          </div>
          <div className="delete">
            <button
              onClick={() => this.finish(value, index)}
              disabled={isCreatedOffline || value.isDeleting}
              >
                {isCreatedOffline ? '+' : value.isDeleting ? '-' : 'X'}
            </button>
          </div>
        </div>
      )
    });

    if (this.props.fetching) {
      content = (
        <div className="spinner">
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>
      );
    }

    if (isEmpty(this.props.todos)) {
      content = (
        <p>All done, add more todos by typing up above</p>
      );
    }

    return (
      <Main status={isEmpty(this.props.offline.online) ? navigator.onLine : this.props.offline.online}>
        <h3>You are <strong>Offline</strong>, changes will be sent automatically when you go back online</h3>
        <img
          className="logo"
          src="https://files.startupranking.com/startup/thumb/9779_706891cbd766d67920e3a4df089b2516646a7dbe_traveloka_m.png"
          alt="logoTVLK"
          />
        <h1>Todos</h1>
        <p>A simple offline-capable progressive web application todo list.</p>
        <input
          className="textInput"
          value={this.state.todoInput}
          onKeyPress={this.onKeyPress}
          onChange={(evt) => this.onInputChange(evt.target.value)}
          placeholder="Gotta do ..."
          />
        {content}
      </Main>
    );
  }
}

App.propTypes = {
  offline: PropTypes.object.isRequired,
  todos: PropTypes.array.isRequired,
  fetching: PropTypes.bool.isRequired,
  initialRehydrate: PropTypes.bool.isRequired,
  addTodo: PropTypes.func.isRequired,
  getTodos: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    offline: offlineSelector(state),
    todos: todosSelector(state),
    fetching: fetchingSelector(state),
    initialRehydrate: initialRehydrateSelector(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getTodos: () => dispatch(getTodos()),
    addTodo: (todo) => dispatch(addTodo(todo)),
    editTodo: (id, todo, newTodo, index) => dispatch(editTodo(id, todo, newTodo, index)),
    finishTodo: (todo, index) => dispatch(finishTodo(todo, index)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

const Main = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  height: auto;
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  align-content: flex-start;
  background: #EEEEEE;
  color: #3A4750;
  font-family: 'Montserrat', sans-serif;

  h1,
  h2 {
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1;
    margin: 0;
    letter-spacing: 0.5rem;
    color: ${(props) => {
      if (props.status) {
        return '#35ACE4';
      }

      return '#3A4750';
    }};
    transition: color 0.5s ease-in-out;
  }

  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-top: 1rem;
  }

  h3 {
    font-size: 1rem;
    font-weight: 400;
    margin-bottom: 2rem;
    opacity: ${(props) => {
      if (props.status) {
        return 0;
      }

      return 1;
    }};
    transition: opacity 0.5s ease-in-out;
    width: 100%;
    color: #999999;

    strong {
      color: #3A4750;
    }
  }

  p {
    font-weight: 400;
    color: #AAAAAA;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .logo {
    width: 4rem;
    height: 4rem;
    margin-right: 1rem;
  }

  .textInput {
    width: ${(props) => {
      if (props.status) {
        return '100%';
      }

      return 'calc(100% + 4rem)';
    }};
    margin: ${(props) => {
      if (props.status) {
        return '2rem 0';
      }

      return '2rem -2rem';
    }};
    padding: ${(props) => {
      if (props.status) {
        return '1rem 0 0.75rem';
      }

      return '1rem 2rem 0.75rem';
    }};
    outline: none;
    border: none;
    border-bottom: 0.1rem solid ${(props) => {
      if (props.status) {
        return '#35ACE4';
      }

      return '#AAAAAA';
    }};
    background: ${(props) => {
      if (props.status) {
        return '#EEEEEE';
      }

      return '#DDDDDD';
    }};
    color: #3A4750;
    font-size: 1rem;
    transition: width 0.25s ease-in-out, margin 0.25s ease-in-out, padding 0.25s ease-in-out, border 0.25s ease-in-out, background 0.25s ease-in-out, color 0.25s ease-in-out;
  }

  .todo {
    width: ${(props) => {
      if (props.status) {
        return '100%';
      }

      return 'calc(100% + 4rem)';
    }};
    margin: ${(props) => {
      if (props.status) {
        return '0.5rem 0';
      }

      return '0.5rem -2rem';
    }};
    padding: ${(props) => {
      if (props.status) {
        return '0.5rem 0 0.5rem';
      }

      return '0.5rem 2rem 0.5rem';
    }};
    border-bottom: 0.1rem solid ${(props) => {
      if (props.status) {
        return '#CCCCCC';
      }

      return '#AAAAAA';
    }};
    background: ${(props) => {
      if (props.status) {
        return '#EEEEEE';
      }

      return '#DDDDDD';
    }};
    color: #3A4750;
    transition: width 0.25s ease-in-out, margin 0.25s ease-in-out, padding 0.25s ease-in-out, border 0.25s ease-in-out, background 0.25s ease-in-out, color 0.25s ease-in-out;
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &.offline {
      width: calc(100% + 4rem);
      margin: 0.5rem -2rem;
      padding: 0.5rem 2rem 0.5rem;
      border-bottom: 0.2rem solid #999999;
    }

    .content {
      flex: 1;
      padding: 0.25rem 0.5rem;
      max-width: calc(100% - 3rem);
      overflow: auto;
    }

    .delete {
      button {
        text-align: right;
        font-size: 1.25rem;
        font-weight: 700;
        border: none;
        outline: none;
        width: 1.7rem;
        height: 1.7rem;
        text-align: center;
        background: ${(props) => {
          if (props.status) {
            return '#35ACE4';
          }

          return '#3A4750';
        }};
        color: #EEEEEE;
        transition: background 0.5s ease-in-out;

        &:disabled {
          background: #AAAAAA;
        }
      }
    }
  }

  .checkbox {
    position: absolute;
    opacity: 0;

    & + label {
      position: relative;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    & + label:before {
      content: '';
      display: inline-block;
      vertical-align: text-top;
      width: 1.3rem;
      height: 1.3rem;
      border: 0.1rem solid ${(props) => {
        if (props.status) {
          return '#35ACE4';
        }

        return '#3A4750';
      }};
      transition: background 0.25s ease-in-out, border 0.25s ease-in-out;
    }

    &:hover + label:before {
      background: ${(props) => {
        if (props.status) {
          return '#35ACE4';
        }

        return '#3A4750';
      }};
      transition: background 0.25s ease-in-out;
    }

    &:focus + label:before {
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.12);
    }

    &:checked + label:before {
      background: ${(props) => {
        if (props.status) {
          return '#35ACE4';
        }

        return '#3A4750';
      }};
      transition: background 0.25s ease-in-out;
    }

    &:disabled + label {
      color: #AAAAAA;
      cursor: auto;
    }

    &:disabled + label:before {
      box-shadow: none;
      border: 0.1rem solid #AAAAAA;
      background: #AAAAAA;
    }

    &:checked + label:after {
      content: '';
      position: absolute;
      left: 0.3rem;
      top: 0.7rem;
      background: #EEEEEE;
      width: 0.25rem;
      height: 0.25rem;
      box-shadow:
        0.2rem 0 0 #EEEEEE,
        0.4rem 0 0 #EEEEEE,
        0.4rem -0.2rem 0 #EEEEEE,
        0.4rem -0.4rem 0 #EEEEEE,
        0.4rem -0.6rem 0 #EEEEEE,
        0.4rem -0.8rem 0 #EEEEEE;
      transform: rotate(45deg);
    }
  }
`;
