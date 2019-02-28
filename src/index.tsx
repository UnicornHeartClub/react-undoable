/**
 * A component to undo state, any state
 *
 * This enhancer wraps a child component to provide a source of truth for the current state and
 * convenience methods for "undo" and "redo" functionality.
 *
 * State "Source-of-Truth"
 * ======================
 * Any child component that wraps a parent Undoable should ensure that the source of truth
 * for all state lives on the Undoable and should be manipulated accordingly.
 *
 * This means that if you have a method in your child component that modifies that child's state,
 * it's best to return an object of the new state from that method so that you can call "pushState"
 * on the Undoable.
 *
 * You can also treat the Undoable as a state store to avoid state duplication across
 * components.
 *
 * @format
 */

import * as React from 'react'

/**
 * Props
 */
interface IUndoableProps<T> {
  initialState: T
  children(props: IUndoableState<T> & IUndoableMethods<T>): React.ReactNode
}

/**
 * Methods
 */
interface IUndoableMethods<T> {
  pushState(state: T, callback?: (props?: any) => any): void
  redo(): T | undefined
  resetState(state?: T, callback?: (props?: any) => any): void
  undo(): T | undefined
  updateState(state: T, callback?: (props?: any) => any): void
}

/**
 * Undoable Interface
 */
export interface IUndoable<T> extends IUndoableMethods<T> {
  currentState?: T
}

/**
 * State
 */
interface IUndoableState<T> {
  currentState?: T
  previousState: (T | undefined)[]
  nextState: (T | undefined)[]
}

/**
 * Undoable Enhancer
 */
export default class Undoable<T> extends React.Component<IUndoableProps<T>, IUndoableState<T>> {
  readonly state = {
    currentState: undefined,
    previousState: [],
    nextState: [],
  }

  /**
   * Set the default state for the component
   */
  static getDerivedStateFromProps(nextProps: IUndoableProps<any>, nextState: IUndoableState<any>) {
    if (nextProps.initialState && nextState.currentState === undefined) {
      return {
        currentState: nextProps.initialState,
      }
    }
    return null
  }

  /**
   * Undo state
   */
  undo = () => {
    const { previousState, nextState, currentState } = this.state

    if (previousState.length) {
      // Make a copy
      const nextPreviousState = [...previousState]
      // Get the last element while also changing the nextPreviousState
      const nextCurrentState = nextPreviousState.pop()
      // Set the current state to a future state
      const nextNextState = currentState
      // Set the state
      this.setState({
        currentState: nextCurrentState,
        nextState: [...nextState, nextNextState],
        previousState: nextPreviousState,
      })

      return nextCurrentState
    }
    return
  }

  /**
   * Redo state
   */
  redo = () => {
    const { previousState, nextState, currentState } = this.state

    if (nextState.length) {
      // Make a copy
      const nextNextState = [...nextState]
      // Get the last element while also changing the nextPreviousState
      const nextCurrentState = nextNextState.pop()
      // Set the current state to a future state
      const nextPreviousState = currentState
      // Set the state
      this.setState({
        currentState: nextCurrentState,
        nextState: nextNextState,
        previousState: [...previousState, nextPreviousState],
      })

      return nextCurrentState
    }
    return
  }

  /**
   * Push new state to the stack
   */
  pushState = (state: T, callback?: (props?: any) => any) => {
    const { currentState, previousState } = this.state
    this.setState(
      {
        currentState: state,
        nextState: [],
        previousState: [...previousState, currentState],
      },
      callback,
    )
  }

  /**
   * Reset the entire state to a single stack
   */
  resetState = (state: T, callback?: (props?: any) => any) => {
    this.setState(
      {
        currentState: state,
        nextState: [],
        previousState: [],
      },
      callback,
    )
  }

  /**
   * Update the state but do not push a change (useful for updating without the need to undo)
   */
  updateState = (state: T, callback?: (props?: any) => any) => {
    this.setState(
      {
        currentState: state,
      },
      callback,
    )
  }

  /**
   * Render
   */
  render() {
    const { children } = this.props
    const childrenProps = {
      ...this.state,
      undo: this.undo,
      redo: this.redo,
      pushState: this.pushState,
      resetState: this.resetState,
      updateState: this.updateState,
    }

    return children ? children(childrenProps) : false
  }
}
