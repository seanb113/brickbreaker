import React, { useEffect, useReducer } from 'react'
import { LEVELS } from './levels'
import { MOVEMENT, getNewGameState, getGameStateFromLevel } from './game'
import { registerListener } from '../props'
import Level from './level'
import Lives from './lives'
import Brick from './brick'
import Paddle from './paddle'
import Ball from './ball'

const MOVEMENT_KEYS = {
  LEFT: [65, 37],
  RIGHT: [68, 39]
}

const STOP_KEY = 32

const UPDATE_EVERY = 1000 / 60

const getInitialLevel = () => {
  const inState = localStorage.setItem('level', 0)
  return inState ? parseInt(inState, 10) : 0
}

const getProjectors = (containerSize, gameSize) => {
  const widthRatio = containerSize.width / gameSize.width
  const heightRatio = containerSize.height / gameSize.height
  const unitOnScreen = Math.min(widthRatio, heightRatio)

  return {
    projectDistance: distance => distance * unitOnScreen,
    projectMovement: Movement => Movement.scaleBy(unitOnScreen)
  }
}

const getInitialState = containerSize => {
  const level = getInitialLevel()
  const game = getGameStateFromLevel(LEVELS[level])
  const { projectDistance, projectMovement } = getProjectors(containerSize, game.size)
  return {
    level,
    game,
    containerSize,
    projectDistance,
    projectMovement,
    time: Date.now(),
    stopTime: undefined,
    movement: undefined
  }
}

const ACTION = {
  CONTAINER_SIZE_CHANGE: 'CONTAINER_SIZE_CHANGE',
  KEY_DOWN: 'KEY_DOWN',
  KEY_UP: 'KEY_UP',
  TICK: 'TICK'
}

const HANDLER = {
  [ACTION.CONTAINER_SIZE_CHANGE]: (state, containerSize) => ({
    ...state,
    containerSize,
    ...getProjectors(containerSize, state.game.size)
  }),
  [ACTION.KEY_DOWN]: (state, key) => {
    if (MOVEMENT_KEYS.LEFT.includes(key)) {
      return { ...state, movement: MOVEMENT.LEFT }
    } else if (MOVEMENT_KEYS.RIGHT.includes(key)) {
      return { ...state, movement: MOVEMENT.RIGHT }
    }
    return state
  },
  [ACTION.KEY_UP]: (state, key) => {
    const newState = { ...state, movement: undefined }
    if (key === STOP_KEY) {
      if (state.stopTime) {
        return { ...newState, stopTime: undefined, time: state.time + Date.now() - state.stopTime}
      } else {
        return { ...newState, stopTime: Date.now() }
      }
    }
    return newState
  },
  [ACTION.TICK]: state => {
    if (state.stopTime) return state

    const time = Date.now()
    const newGame = getNewGameState(state.game, state.movement, time - state.time)
    const newState = { ...state, time }
    if (newGame.lives < 1) {
      localStorage.setItem('level', 0)
      return { ...newState, game: getGameStateFromLevel(LEVELS[0]) }
    } else if (newGame.bricks.length < 1) {
      const level = state.level === LEVELS.length ? state.level : state.level + 1
      localStorage.setItem('level', level)
      const game = getGameStateFromLevel(LEVELS[state.level])
      return {
        ...newState,
        level,
        game,
        ...getProjectors(state.containerSize, game.size)
      }
    }
    return { ...newState, game: newGame }
  }
}

const reducer = (state, { type, payload }) => {
  const handler = HANDLER[type]
  if (!handler) return state
  return handler(state, payload)
}

export default (containerSize) => {
  const [state, dispatch] = useReducer(reducer, containerSize, getInitialState)
  const act = (type, payload) => dispatch({ type, payload })
  const {
    projectDistance,
    projectMovement,
    level,
    game: {
      bricks,
      paddle,
      ball,
      size: {
        width,
        height
      },
      lives
    }
  } = state

  useEffect(() => act(ACTION.CONTAINER_SIZE_CHANGE, containerSize), [containerSize])

  useEffect(() => {
    const onKeyDown = ({ which }) => act(ACTION.KEY_DOWN, which)
    const onKeyUp = ({ which }) => act(ACTION.KEY_UP, which)
    const tick = () => act(ACTION.TICK)

    const timerId = setInterval(tick, UPDATE_EVERY)
    const unregisterKeydown = registerListener('keydown', onKeyDown)
    const unregisterKeyup = registerListener('keyup', onKeyUp)
    return () => {
      clearInterval(timerId)
      unregisterKeydown()
      unregisterKeyup()
    }
  }, [])
  
  const viewWidth = projectDistance(width)
  const unit = projectDistance(ball.radius)

  return (
    <svg width={viewWidth} height={projectDistance(height)} className='gameplay'>
      <Level unit={unit} level={level + 1} />
      <Lives
        lives={lives}
        containerWidth={viewWidth}
        unit={unit}
      />
      {bricks.map(({ density, position, width, height }) => (
        <Brick
          density={density}
          key={`${position.x}-${position.y}`}
          width={projectDistance(width)}
          height={projectDistance(height)}
          {...projectMovement(position)}
        />)
      )}
      <Paddle width={projectDistance(paddle.width)} height={projectDistance(paddle.height)} {...projectMovement(paddle.position)} />
      <Ball {...projectMovement(ball.center)} radius={unit} />
    </svg>
  )
}