# React Undoable

![npm](https://img.shields.io/npm/v/react-undoable.svg)
![david-dm](https://david-dm.org/UnicornHeartClub/react-undoable.svg)
[![Build Status](https://travis-ci.com/UnicornHeartClub/react-undoable.svg?branch=master)](https://travis-ci.com/UnicornHeartClub/react-undoable)

Easily undo/redo any state in React, no external dependencies.

![minified size](https://badgen.net/bundlephobia/min/react-undoable)
![minzipped size](https://badgen.net/bundlephobia/minzip/react-undoable)

## Installation

```bash
$ yarn add react-undoable
```

### TypeScript

This library utilizes [TypeScript](https://www.typescriptlang.org/) and exposes a full set of
TypeScript definitions.

## Usage


This library exposes a default `Undoable` component that is used to manage the state you wish to undo/redo. This component wraps any number of child components and provides a simple API to manage the state.

### Example

```typescript
import React, { PureComponent } from 'react'
import Undoable, { IWithUndoable } from 'react-undoable'
import ReactDOM from 'react-dom'

/**
 * Props
 */
interface IMyComponentProps extends IUndoable<IMyComponentState> {}

/**
 * State
 */
interface IMyComponentState {
  count: number
  random: number
}

// Define initial state
const initialState IMyComponentState = {
  count: 0,
  random: 42,
}

/**
 * Sample undoable component
 *
 * Allows us to add and subtract numbers. Simple, but shows off the functionality
 *
 * **Important:** This component does not define it's own state. Instead, we defer state
 * management to the `Undoable` component. Optionally, we can define our supposed state
 * using TypeScript for easier management.
 */
class MyComponent extends PureComponent<IMyComponentProps> {
  /**
   * Count Up - This demonstrates pushing a complete state to the stack
   */
  up = (): IMyComponentState => {
    // We get "currentState" and "pushState" props from our `Undoable`
    const { currentState, pushState } = this.props
    // Do not call setState, but instead push the state
    return pushState({
      ...this.currentState,
      count: this.currentState.count + 1,
    })
  }

  /**
   * Count Down - This demonstrates pushing an incomplete state to the stack and merging it
   */
  down = (): object => {
    // Similar to the .up method, we also get the "mergeState" props
    const { currentState, mergeState } = this.props
    // Merge the current state
    return mergeState({
      count: this.currentState.count - 1,
    })
  }

  render() {
    const { currentState, undo, redo, resetState } = this.props

    return (
      <div>
        <h1>Count: {currentState.count}</h1>
        <h4>Random {currentState.random}</h4>
        <div>
          <a onClick={this.up}>Up</a>
          {` | `}
          <a onClick={this.down}>Down</a>
          {` | `}
          <a onClick={this.updateUp}>Update Up</a>
          {` | `}
          <a onClick={this.updateDown}>Update Down</a>
        </div>
        <div>
          <a onClick={undo}>Undo</a>
          {` | `}
          <a onClick={redo}>Redo</a>
          {` | `}
          <a onClick={resetState}>Reset</a>
        </div>
      </div>
    )
  }
}

/**
 * In our main application (or anywhere), we can wrap MyComponent in Undoable
 * to give it undo/redo functionality
 */
const App = () => (
  <Undoable initialState={initialState}
    {undoable => (
      <MyComponent {...undoable} />
    )}
  </Undoable>
)

// That's it, render your application however you normally do
ReactDOM.render(App, '#app')
```

## License

MIT
