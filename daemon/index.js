const MC = require('minecraft-server-util')
const Compute = require('@google-cloud/compute')
const compute = new Compute()
const { exec } = require('child_process')
const { Firestore } = require('@google-cloud/firestore')
const firestore = new Firestore()
const { PubSub } = require('@google-cloud/pubsub')
const moment = require('moment')

const VM_ZONE = 'asia-east2-a'
const VM_NAME = 'mc-server'
const PRE_ROUTINE_INTERVAL = 1000 * 10 // interval between each pre routine execution
const CHECK_INTERVAL = 1000 * 60 * 5 // interval between each check in ms
const BACKUP_INTERVAL = 1000 * 60 * 30 // in ms
const THRESHOLD = 2 // MAX_IDLE_TIME = CHECK_INTERVAL * THRESHOLD
// const SERVER_IP = "0.tcp.ap.ngrok.io"

const SERVER_IP = 'localhost'

let idleCounter = 0
let lastBackupTime = Date.now()

const sleep = async (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

const publishDiscordServerStatusTopic = async () => {
  const pubsub = new PubSub()
  const topic = pubsub.topic('discord-server-status-topic')
  topic.publishMessage({ data: Buffer.from('trigger') })
}

const getPlayerNumber = async () =>
  new Promise((resolve, reject) => {
    MC.status(SERVER_IP, 25565, {
      timeout: 1000 * 5,
      enableSRV: true
    })
      .then((result) => {
        console.log(result)
        resolve(result.players.online)
      })
      .catch((err) => {
        console.log(err)
        resolve(-1)
      })
  })

const isOnline = () =>
  new Promise((resolve, reject) => {
    MC.status(SERVER_IP, 25565, {
      timeout: 1000 * 5,
      enableSRV: true
    })
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })

const execCmd = (cmd) =>
  new Promise((res, rej) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log(stderr)
        rej(err)
        return
      }
      res(stdout)
    })
  })

const setServerStatusToOnline = async () => {
  const document = firestore.collection('server-status').doc(`current`)
  await document.update({ state: 'online' })
  await publishDiscordServerStatusTopic()
}

const backupWorld = async () => {
  console.log('running backup...')
  try {
    await execCmd('sh /home/minecraft/backup.sh')
  } catch {
    console.log('failed to backup')
  }
}

const setServerStatusToOffline = async () => {
  const document = firestore.collection('server-status').doc(`current`)
  await document.update({ state: 'offline' })
  await publishDiscordServerStatusTopic()
}

const addStartedInstanceRecord = async () => {
  const document = firestore.doc(`server-log/${new Date().getTime()}`)
  await document.set({
    at: moment(new Date()).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss'),
    operation: 'started'
  })
}

const addClosedInstanceRecord = async () => {
  const document = firestore.doc(`server-log/${new Date().getTime()}`)
  await document.set({
    at: moment(new Date()).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss'),
    operation: 'closed'
  })
}

const stopInstance = () => {
  const zone = compute.zone(VM_ZONE)
  const vm = zone.vm(VM_NAME)

  console.log('stopping instance...')
  vm.stop((err, operation, apiResponse) => {
    console.log({ err, operation, apiResponse })
    console.log('instance stopped successfully')
  })
}

const mainRoutine = async () => {
  console.log(`idleCounter: ${idleCounter}`)
  const hasPlayer = (await getPlayerNumber()) == 0 ? false : true

  if (!hasPlayer) idleCounter++
  else idleCounter = 0

  if (idleCounter > THRESHOLD) {
    console.log('reached idle counter threshold')
    await backupWorld()
    await setServerStatusToOffline()
    await addClosedInstanceRecord()
    stopInstance()
  }
}

const loop = async (routine) => {
  while (true) {
    await routine()
    await sleep(CHECK_INTERVAL)
  }
}

const preRoutine = async () => {
  console.log('Running Pre Routine...')

  while (!(await isOnline())) {
    await sleep(PRE_ROUTINE_INTERVAL)
  }

  console.log('Server is online')
  await setServerStatusToOnline()
  await addStartedInstanceRecord()
}

preRoutine()

loop(mainRoutine)
