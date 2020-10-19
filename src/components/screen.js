
import React, { useRef, useEffect, useState } from 'react'
import Gameplay from './gameplay'
import { registerListener } from '../props'

export default () => {
  const gameplayContainer = useRef()
  const [size, setSize] = useState()

  useEffect(() => {
    const onResize = () => {
      const { width, height } = gameplayContainer.current.getBoundingClientRect()
      setSize({ width, height })
    }
    const unregisterResizeListener = registerListener('resize', onResize)
    onResize()
    return unregisterResizeListener
  }, [])

  return (
    <div className='screen'>
      <div className='gameplay-container' ref={gameplayContainer}>
        {size && <Gameplay width={size.width} height={size.height} />}
      </div>
    </div>
  )
}