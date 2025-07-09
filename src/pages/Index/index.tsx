import React, { memo } from 'react'

import Box from '../../components/Box'
import logo from '../../spotify_logo.png'

import styles from './index.module.css'

interface Props {}

const Index: React.FC<Props> = memo(() => {
  return (
    <>
      <Box>
        <h1 className={styles.h1}>{process.env.REACT_APP_TEXT}</h1>
        <img src={logo} alt="spotify_logo" className="spotify-logo" />
      </Box>
    </>
  )
})
Index.displayName = 'Index'

export default Index
