/** @format */
import * as React from 'react'
import { mount } from 'enzyme'
import Undoable, { IUndoable } from '../index'

interface ITestComponentState {
  microphone: string
  num: number
  test: boolean
}

const defaultState = {
  microphone: 'check',
  num: 2,
  test: true,
}

const TestComponent: React.SFC<IUndoable<ITestComponentState>> = props => {
  const { undo, redo, currentState } = props
  return (
    <>
      <a id="undo" onClick={undo}>
        Undo
      </a>
      <a id="redo" onClick={redo}>
        Redo
      </a>
      <span id="a">{currentState.microphone}</span>
      <span id="b">{currentState.num}</span>
      <span id="c">{currentState.test}</span>
    </>
  )
}

describe('@enhancers/undoable', () => {
  it('takes an initial state and returns it as a parameter in a child function', () => {
    const Component = mount(
      <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
    )

    expect(Component.find('#a').prop('children')).toEqual('check')
    expect(Component.find('#b').prop('children')).toEqual(2)
    expect(Component.find('#c').prop('children')).toEqual(true)
  })

  it('performs undo operations and updates the state', () => {
    const Component = mount(
      <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
    )

    // change the state
    const instance = Component.find(Undoable).instance() as Undoable<ITestComponentState>
    instance.pushState({ ...defaultState, num: 10, test: false })

    expect(Component.find(Undoable).state('currentState').test).toEqual(false)
    expect(Component.find(Undoable).state('currentState').num).toEqual(10)

    // change it back
    Component.find('#undo').simulate('click')

    // we should have future state
    expect(Component.find(Undoable).state('currentState').test).toEqual(true)
    expect(Component.find(Undoable).state('currentState').num).toEqual(2)
    expect(Component.find(Undoable).state('nextState')).toHaveLength(1)
    expect(Component.find(Undoable).state('nextState')[0]).toEqual({
      ...defaultState,
      test: false,
      num: 10,
    })
  })

  it('performs redo operations and updates the state', () => {
    const Component = mount(
      <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
    )

    // change the state
    const instance = Component.find(Undoable).instance() as Undoable<ITestComponentState>
    instance.pushState({ ...defaultState, num: 10, test: false })

    // change it back to the original
    Component.find('#undo').simulate('click')

    // change it back to our changes
    Component.find('#redo').simulate('click')

    expect(Component.find(Undoable).state('currentState').test).toEqual(false)
    expect(Component.find(Undoable).state('currentState').num).toEqual(10)
    expect(Component.find(Undoable).state('nextState')).toHaveLength(0)
    expect(Component.find(Undoable).state('previousState')).toHaveLength(1)
    expect(Component.find(Undoable).state('previousState')[0]).toEqual(defaultState)
  })

  describe('.redo', () => {
    it('returns the next state', () => {
      const Component = mount(
        <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
      )

      // change the state
      const instance = Component.find(Undoable).instance() as Undoable<ITestComponentState>
      instance.pushState({ ...defaultState, num: 10, test: false })

      // undo that change
      instance.undo()

      // now redo it and return the last object
      expect(instance.redo()).toEqual({ ...defaultState, num: 10, test: false })
    })
  })

  describe('.undo', () => {
    it('returns the next state', () => {
      const Component = mount(
        <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
      )

      // change the state
      const instance = Component.find(Undoable).instance() as Undoable<ITestComponentState>
      instance.pushState({ ...defaultState, num: 10, test: false })

      // return the last object
      expect(instance.undo()).toEqual(defaultState)
    })
  })

  describe('.pushState', () => {
    it('pushes new state changes', () => {
      const Component = mount(
        <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
      )

      expect(Component.find(Undoable).state('currentState').microphone).toEqual('check')
      expect(Component.find(Undoable).state('previousState')).toHaveLength(0)

      const instance = Component.find(Undoable).instance() as Undoable<ITestComponentState>
      instance.pushState({ ...defaultState, microphone: 'hi' })

      expect(Component.find(Undoable).state('currentState').microphone).toEqual('hi')
      expect(Component.find(Undoable).state('previousState')).toHaveLength(1)
      expect(Component.find(Undoable).state('previousState')[0]).toEqual(defaultState)
    })
  })

  describe('.updateState', () => {
    it('pushes new state changes but does not track the change', () => {
      const Component = mount(
        <Undoable initialState={defaultState}>{props => <TestComponent {...props} />}</Undoable>,
      )

      expect(Component.find(Undoable).state('currentState').microphone).toEqual('check')
      expect(Component.find(Undoable).state('previousState')).toHaveLength(0)

      const instance = Component.find(Undoable).instance() as Undoable<ITestComponentState>
      instance.updateState({ ...defaultState, microphone: 'hi' })

      expect(Component.find(Undoable).state('currentState').microphone).toEqual('hi')
      expect(Component.find(Undoable).state('previousState')).toHaveLength(0)
    })
  })
})
