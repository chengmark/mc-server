const MC = require('minecraft-server-util')
const http = require('http')
const Compute = require('@google-cloud/compute')
const { Firestore } = require('@google-cloud/firestore')
const moment = require('moment')
const { PubSub } = require('@google-cloud/pubsub')

const compute = new Compute()
const firestore = new Firestore()

const VM_ZONE = 'asia-east2-a'
const VM_NAME = 'mc-server'

const zone = compute.zone(VM_ZONE)
const vm = zone.vm(VM_NAME)
const fwname = 'minecraft-fw-rule-' + Math.floor(new Date() / 1000)

const getServerIp = async () => {
  return new Promise((resolve, reject) => {
    vm.getMetadata((err, metadata, apiResponse) => {
      console.log({ metadata })
      resolve(metadata.networkInterfaces[0].accessConfigs[0].natIP)
    })
  })
}

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

const startInstance = () => {
  const zone = compute.zone(VM_ZONE)
  const vm = zone.vm(VM_NAME)
  console.log('about to start a VM')
  vm.start(function (err, operation, apiResponse) {
    console.log('instance start successfully')
  })
  console.log('the server is starting')
}

const createFirewall = (callerIp) => {
  // Set the Firewall configs
  const config = {
    protocols: { tcp: [25565] },
    ranges: [callerIp + '/32'],
    tags: ['minecraft-server']
  }
  function callback(err, firewall, operation, apiResponse) {}

  // Create the Firewall
  compute.createFirewall(fwname, config, callback)
}

const isOnline = (serverIp) =>
  new Promise((resolve, reject) => {
    MC.status(serverIp, 25565, {
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

const addStartInstanceRecord = async () => {
  const document = firestore.doc(`server-log/${new Date().getTime()}`)
  await document.set({
    at: moment(new Date()).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss'),
    operation: 'start'
  })
}

const setServerStatusToStarting = async () => {
  const document = firestore.collection('server-status').doc(`current`)
  await document.update({ state: 'starting' })
  await publishDiscordServerStatusTopic()
}

const getServerCurrentState = async () => {
  const collectionRef = firestore.collection('server-status')
  const documents = await collectionRef.get()
  const docData = documents.docs.map((d) => d.data())
  return docData[0].state
}

exports.checkAndStartInstance = async function checkAndStartInstance(req, res) {
  const serverIp = await getServerIp()
  const serverState = await getServerCurrentState()
  if (serverState == 'starting') {
    // return res.status(200).send('Server依家開緊，可以留意返discord #server-status睇吓開咗ser未。')
    return res.status(200).json({ state: 'starting' })
  }

  if (serverState == 'online') {
    // return res.status(200).send('Server已經開咗啦，discord #server-status有IP。')
    return res.status(200).json({ stsate: 'online' })
  }

  startInstance()

  while (!(await getServerIp())) {
    console.log('Server is not ready, waiting 1 second...')
    await sleep(1000)
    console.log('Checking server readiness again...')
  }

  console.log('the server is ready')

  // Record the function caller's IPv4 address
  console.log(JSON.stringify(req.headers))
  sourceIp = req.get('X-Forwarded-For')
  let callerIp = req.query.message || req.body.message || sourceIp

  createFirewall(callerIp)

  await addStartInstanceRecord()

  await setServerStatusToStarting()

  // res.status(200).send('依家開緊ser，需時4-5分鐘，可以留意返discord #server-status睇吓開咗ser未。')
  res.status(200).json({ state: 'requested' })
}
