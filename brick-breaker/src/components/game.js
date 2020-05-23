import Vector from './vector'
import { flatten, getRandomFrom, withoutElement, updateElement } from '../props'

const PADDLE_AREA = 1 / 3
const brick_HEIGHT = 1 / 3
const PADDLE_HEIGHT = brick_HEIGHT
const BALL_RADIUS = 1 / 5
const DISTANCE_IN_MS = 0.005

export const MOVEMENT = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
}

const LEFT = new Vector(-1, 0)
const RIGHT = new Vector(1, 0)
const UP = new Vector(0, -1)
const DOWN = new Vector(0, 1)

const LEFT_UP = LEFT.add(UP).normalize()
const RIGHT_UP = RIGHT.add(UP).normalize()

export const getInitialPaddleAndBall = (width, height, paddleWidth) => {
  const paddleY = height - PADDLE_HEIGHT
  const paddle = {
    position: new Vector((width - paddleWidth) / 2, paddleY),
    width: paddleWidth,
    height: PADDLE_HEIGHT
  }
  const ball = {
    center: new Vector(height / 2, paddleY - BALL_RADIUS * 2),
    radius: BALL_RADIUS,
    direction: getRandomFrom(LEFT_UP, RIGHT_UP)
  }

  return {
    paddle,
    ball
  }
}

export const getGameStateFromLevel = ({ lives, paddleWidth, speed, bricks }) => {
  const width = bricks[0].length
  const height = width

  const bricksStart = ((height - height * PADDLE_AREA) - bricks.length * brick_HEIGHT) / 2

  const rowsOfbricks = bricks.map((row, i) =>
    row.map((density, j) => ({
      density,
      position: new Vector(j, bricksStart + (i * brick_HEIGHT)),
      width: 1,
      height: brick_HEIGHT
    })
  ))

  const size = {
    width,
    height
  }
  return {
    size,
    bricks: flatten(rowsOfbricks),
    ...getInitialPaddleAndBall(width, height, paddleWidth),
    lives,
    speed
  }
}

const getDistortedDirection = (vector, distortionLevel = 0.3) => {
  const getComponent = () => Math.random() * distortionLevel - distortionLevel / 2
  const distortion = new Vector(getComponent(), getComponent())
  return vector.add(distortion).normalize()
}

const getNewPaddle = (paddle, size, distance, movement) => {
  if (!movement) return paddle
  const direction = movement === MOVEMENT.LEFT ? LEFT : RIGHT

  const { x } = paddle.position.add(direction.scaleBy(distance))
  const withNewX = x => ({
    ...paddle,
    position: new Vector(x, paddle.position.y)
  })
  if (x < 0) {
    return withNewX(0)
  }
  if (x + paddle.width > size.width) {
    return withNewX(size.width - paddle.width)
  }
  return withNewX(x)
}

const isInBoundaries = (oneSide, otherSide, oneBoundary, otherBoundary) => (
  (oneSide >= oneBoundary && oneSide <= otherBoundary) ||
  (otherSide >= oneBoundary && otherSide <= otherBoundary)
)

const getAdjustedVector = (normal, vector, minAngle = 15) => {
  const angle = normal.angleBetween(vector)
  const maxAngle = 90 - minAngle
  if (angle < 0) {
    if (angle > -minAngle) {
      return normal.rotate(-minAngle)
    }
    if (angle < -maxAngle) {
      return normal.rotate(-maxAngle)
    }
  } else {
    if (angle < minAngle) {
      return normal.rotate(minAngle)
    }
    if (angle > maxAngle) {
      return normal.rotate(maxAngle)
    }
  }
  return vector
}

export const getNewGameState = (state, movement, timespan) => {
  const { size, speed, lives } = state
  const distance = timespan * DISTANCE_IN_MS * speed
  const paddle = getNewPaddle(state.paddle, size, distance, movement)

  const { radius } = state.ball
  const oldDirection = state.ball.direction
  const newBallCenter = state.ball.center.add(oldDirection.scaleBy(distance))
  const ballBottom = newBallCenter.y + radius
  if (ballBottom > size.height) {
    return {
      ...state,
      ...getInitialPaddleAndBall(size.width, size.height, paddle.width),
      lives: lives - 1
    }
  }
  
  const withNewBallProps = props => ({
    ...state,
    paddle,
    ball: {
      ...state.ball,
      ...props
    }
  })

  const withNewBallDirection = normal => {
    const distorted = getDistortedDirection(oldDirection.reflect(normal))
    const direction = getAdjustedVector(normal, distorted)
    return withNewBallProps({ direction })
  }
  const ballLeft = newBallCenter.x - radius
  const ballRight = newBallCenter.x + radius
  const ballTop = newBallCenter.y - radius
  const paddleLeft = paddle.position.x
  const paddleRight = paddleLeft+ paddle.width
  const paddleTop = paddle.position.y

  const ballGoingDown = Math.abs(UP.angleBetween(oldDirection)) > 90
  const hitPaddle = ballGoingDown && ballBottom >= paddleTop && ballRight >= paddleLeft && ballLeft <= paddleRight
  if (hitPaddle) return withNewBallDirection(UP)
  if (ballTop <= 0) return withNewBallDirection(DOWN)
  if (ballLeft <= 0) return withNewBallDirection(RIGHT)
  if (ballRight >= size.width) return withNewBallDirection(LEFT)

  const brick = state.bricks.find(({ position, width, height }) => (
    isInBoundaries(ballTop, ballBottom, position.y, position.y + height) &&
    isInBoundaries(ballLeft, ballRight, position.x, position.x + width) 
  ))
  if (brick) {
    const density = brick.density - 1
    const newbrick = { ...brick, density }
    const bricks = density < 0 ? withoutElement(state.bricks, brick) : updateElement(state.bricks, brick, newbrick)
    
    const getNewBallNormal = () => {
      const brickTop = brick.position.y
      const brickBottom = brickTop + brick.height
      const brickLeft = brick.position.x
      if (ballTop > brickTop - radius && ballBottom < brickBottom + radius) {
        if (ballLeft < brickLeft) return LEFT
        if (ballRight > brickLeft + brick.width) return RIGHT
      }
      if (ballTop > brickTop) return DOWN
      if (ballTop <= brickTop) return UP
    }
    return {
      ...withNewBallDirection(getNewBallNormal()),
      bricks
    }
  }
  return withNewBallProps({ center: newBallCenter })
}