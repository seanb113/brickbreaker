
import React from 'react'
import { FaRegHeart } from 'react-icons/fa'
import { getRange } from '../props'

export default ({ lives, containerWidth, unit }) => {
  const width = unit * 2
  return getRange(lives).map(i => (
    <FaRegHeart

    />
  ))
}