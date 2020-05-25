
import React from 'react'
import { FaRegHeart } from 'react-icons/fa'
import { getRange } from '../props'

export default ({ lives, containerWidth, unit }) => {
  const width = unit * 2
  return getRange(lives).map(i => (
    <FaRegHeart
      className='life'
      rx={unit / 4}
      height={unit}
      width={width}
      y={unit}
      x={containerWidth - unit - width * (i + 1) - (unit / 2) * i}
      key={i}
    />
  ))
}