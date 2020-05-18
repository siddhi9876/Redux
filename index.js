import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import { Provider, connect} from 'react-redux'
import * as serviceWorker from './serviceWorker';

//Action creators


let nextTodoId = 1;
const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  }
}

const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  }
}

const setVisibilityFilter = filter => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  }
}

//Reducers

const todos = (state =[], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ];
    case 'TOGGLE_TODO':
      return state.map(todo => {
        if(todo.id !== action.id) {
          return todo;
        }

        return {
          ...todo,
          completed: !todo.completed
        };
      });

    default:
      return state;
  }
};



const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch(action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
}




const todoApp = combineReducers({
  todos,
  visibilityFilter: visibilityFilter
});

//Components


//Input
let AddTodo = ({
  dispatch
}) => {
  let input;
  return (
    <div>
      <input ref ={node => {
          input = node;
        }} />

      <button onClick={() => {
          dispatch(addTodo(input.value));
          input.value = '';
      }}>ADD_TODO</button>
    </div>
  )
};
AddTodo = connect()(AddTodo);



//TodoList
const Todo = ({
  onClick,
  completed,
  text
}) => (
  <li 
    onClick={onClick}
    style={{
    textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
)

const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo => 
      <Todo key= {todo.id}
        {...todo}
        onClick={() =>onTodoClick(todo.id)}
      />
    )}
  </ul>
)



const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter( t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    default:
      return todos
  }
}

const mapDispatchToTodoListProps = (
  dispatch
) => {
  return {
    onTodoClick: (id) => 
      dispatch(toggleTodo(id))
    }
}

const mapStateToTodoListProps = (
  state
) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
const VisibleTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList)


//Footer
const Link = ({
  active,children, onClick
}) => {

  if(active) {
    return <span>{children}</span>
  }
  return (
      <a href='#'
        onClick={e => {
          e.preventDefault();
          onClick();
        }}>
        {children}
        </a>
  );
}

const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  };
};

const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  }
}
const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link)

const Footer = () => (
  <p>
  Show:
  {' '}
  <FilterLink filter='SHOW_ALL'>All</FilterLink> {' '}
  <FilterLink filter='SHOW_ACTIVE'>Active</FilterLink>{' '}
  <FilterLink filter='SHOW_COMPLETED'>Completed</FilterLink>
</p>
)



const TodoApp = () => (
  <div>
    <AddTodo/>
    <VisibleTodoList/>
    <Footer/>
  </div>
)
const store = createStore(todoApp, 
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />,
  </Provider>,  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();



