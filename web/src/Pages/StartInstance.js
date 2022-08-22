import * as React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { Fade, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { sleep } from '../util'

const useStyles = makeStyles({
  root: {
    margin: 0,
    padding: 0,
    width: '100%',
    height: '100%',
    background: '#2c2c32',
    position: 'relative'
  },
  text: {
    color: 'white'
  },
  centering: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  svg: {
    width: '20vw',
    display: 'block'
  },
  path: {
    strokeDasharray: 1000,
    strokeDashoffset: 0
  },
  pathCheck: {
    strokeDasharray: 1000,
    strokeDashoffset: -100,
    animation: '$dash-check 0.9s 0.15s ease-in-out forwards'
  },
  '@keyframes dash': {
    '0%': {
      strokeDashoffset: 1000
    },
    '100%': {
      strokeDashoffset: 0
    }
  },
  '@keyframes dash-check': {
    '0%': {
      strokeDashoffset: -100
    },
    '100%': {
      strokeDashoffset: 900
    }
  }
})

const STATE_DESCRIPTION_DICT = {
  online: 'Server已經開咗啦，discord #server-status有IP。',
  starting: 'Server依家開緊，可以留意返discord #server-status睇吓開咗ser未。',
  requested: '依家開緊ser，需時約3分鐘。',
  requesting: 'Sending your start server request...'
}

const RequestedScreen = classes => (
  <>
    <Box className={classes.centering}>
      <CircularProgress
        color="success"
        size="20vw"
        thickness="2"
        variant="determinate"
        value={100}
      />
      <Typography variant="body1" className={classes.text}>
        {STATE_DESCRIPTION_DICT.requested}
      </Typography>
    </Box>
    <Box className={classes.centering}>
      <svg
        className={classes.svg}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 130.2 130.2"
      >
        <polyline
          className={classes.pathCheck}
          fill="none"
          stroke="#2e7d32"
          strokeWidth="6"
          strokeLinecap="round"
          strokeMiterlimit="10"
          points="100.2,40.2 51.5,88.8 29.8,67.5 "
        />
      </svg>
      <Typography variant="body1" className={classes.text}>
        {STATE_DESCRIPTION_DICT.requested}
      </Typography>
    </Box>
  </>
)

const StartInstancePage = () => {
  const [loading, setLoading] = useState(false)
  const [serverState, setServerState] = useState('requesting')
  const classes = useStyles()

  useEffect(() => {
    const test = async () => {
      setLoading(true)
      console.log('test')
      await sleep(4000)
      setLoading(false)
      setServerState('requested')
    }
    test()
    // fetch('https://asia-east2-mcs-cuhk.cloudfunctions.net/start-mc-server')
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .catch(err => {
    //     console.log(err)
    //   })
  }, [])

  return (
    <Box className={classes.root}>
      <Fade in={loading}>
        <Box className={classes.centering}>
          <CircularProgress color="success" size="20vw" thickness={2} variant="indeterminate" />
          <Typography variant="body1" className={classes.text}>
            {STATE_DESCRIPTION_DICT.requesting}
          </Typography>
        </Box>
      </Fade>
      <Fade in={!loading}>
        <RequestedScreen classes={classes} />
      </Fade>
    </Box>
  )
}

export default StartInstancePage
