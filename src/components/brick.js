import React from 'react'
import { getRange } from '../props'
import { BRICK_MAX_DENSITY } from './levels'

const colors = getRange(BRICK_MAX_DENSITY).map(i => `rgba(26, 188, 156, ${1 / (BRICK_MAX_DENSITY - i)})`)

export default ({ x, y, width, height, density }) => (
  <rect className='brick' fill={colors[density]} x={x} y={y} width={width} height={height} />
)