import React, { memo } from 'react'
import { useNavigate } from 'react-router'

import Box from '../../components/Box'
import logo from '../../spotify_logo.png'

import styles from './index.module.css'

interface Props {}

const Index: React.FC<Props> = memo(() => {
  const navigate = useNavigate()

  const handleSpotifyClick = () => {
    navigate('/dashboard')
  }

  return (
    <>
      <Box>
        <h1 className={styles.h1}>{process.env.REACT_APP_TEXT}</h1>
        <img src={logo} alt="spotify_logo" className="spotify-logo" />
        <button
          onClick={handleSpotifyClick}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4"
        >
          My Spotify
        </button>
      </Box>
    </>
  )
})
Index.displayName = 'Index'

export default Index
