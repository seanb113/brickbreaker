 
import { getRange } from '../props'

export const BRICK_MAX_DENSITY = 3

const getRandombrick = () => Math.floor(Math.random() * BRICK_MAX_DENSITY)

const getbricks = (rows, columns) =>
  getRange(rows).map(() => getRange(columns).map(getRandombrick))

export const LEVELS = [
  {
    lives: 5,
    paddleWidth: 3.5,
    speed: 1,
    bricks: getbricks(3, 6)
  },
  {
    lives: 4,
    paddleWidth: 3,
    speed: 1.4,
    bricks: getbricks(4, 7)
  },
  {
    lives: 3,
    paddleWidth: 2.5,
    speed: 1.8,
    bricks: getbricks(5, 8)
  },
  {
    lives: 3,
    paddleWidth: 2,
    speed: 2.2,
    bricks: getbricks(6, 9)
  },
]