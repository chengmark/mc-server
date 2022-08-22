import * as React from 'react'

const Circle = classes => {
  return (
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
  )
}

export default Circle
