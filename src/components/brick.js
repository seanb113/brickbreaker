import React from 'react'
import { getRange } from '../props'
import { BRICK_MAX_DENSITY } from './levels'

const brickColors = ["rgba(220, 20, 60,", "rgba(100, 149, 237,", "rgba(255, 215, 0,", "rgba(26, 188, 156,"]

const randomColor = brickColors[Math.floor(Math.random() * brickColors.length)]

const colors = getRange(BRICK_MAX_DENSITY).map(i => `${randomColor} ${1 / (BRICK_MAX_DENSITY - i)})`)

export default ({ x, y, width, height, density }) => (
  <rect className='brick' fill={colors[density]} x={x} y={y} width={width} height={height} boxShadow={'0 1px 0 2px rgba(0,0,0,.3), 0 5px (6*.4+px) rgba(0,0,0,.5), 0 (6*1.8+px) 9px rgba(0,0,0,.2)'}/>
)