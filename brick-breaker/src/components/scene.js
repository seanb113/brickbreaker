import React, { useEffect, useReducer } from 'react'
import { LEVELS } from './levels'
import { MOVEMENT, getNewGameState, getGameStateFromLevel } from './game'
import { registerListener } from '../props'

import Level from './level'
import Lives from './lives'
import Block from './brick'
import Paddle from './paddle'
import Ball from './ball'
const Scene = () => {

 return(
    <svg width={viewWidth} height={projectDistance(height)} className='scene'>
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
          {...projectVector(position)}
        />)
      )}
      <Paddle width={projectDistance(paddle.width)} height={projectDistance(paddle.height)} {...projectVector(paddle.position)} />
      <Ball {...projectVector(ball.center)} radius={unit} />
    </svg>
  )
}

export default Scene