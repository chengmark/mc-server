const MC = require('minecraft-server-util')
const { WebhookClient, MessageEmbed } = require('discord.js')
const moment = require('moment')
const { Firestore } = require('@google-cloud/firestore')
const firestore = new Firestore()

const SERVER_STATE_DICT = {
  starting: ':yellow_circle: 開緊Ser，請等等。',
  online: ':green_circle: Online',
  offline: ':red_circle: Offline'
}

const SERVER_OPERATION_DICT = {
  start: 'Server is Starting',
  started: 'Server is Started',
  closed: 'Server is Closed'
}

const getServerLog = async () => {
  const collectionReference = firestore.collection('server-log')
  const documents = await collectionReference.orderBy('at').limitToLast(10).get()
  const docData = documents.docs.map((d) => d.data())
  return docData
}

const getDiscordLastUpdate = async () => {
  const collectionRef = firestore.collection('discord-last-update')
  const documents = await collectionRef.get()
  const docData = documents.docs.map((d) => d.data())
  return docData[0].time
}

const getServerCurrentState = async () => {
  const collectionRef = firestore.collection('server-status')
  const documents = await collectionRef.get()
  const docData = documents.docs.map((d) => d.data())
  return docData[0].state
}

const refreshDiscordLastUpdate = async () => {
  const document = firestore.collection('discord-last-update').doc(`at`)
  await document.update({ time: new Date().getTime(0) })
}

const createLogEntry = (log) => `[${log.at}] ${SERVER_OPERATION_DICT[log.operation]}\n`

exports.main = async function () {
  // const discordLastUpdateTime = await getDiscordLastUpdate()
  // // console.log(moment(new Date(Number.parseInt(discordLastUpdate))).diff(moment()))
  // if (
  //   Math.abs(moment(new Date(Number.parseInt(discordLastUpdateTime))).diff(moment())) <
  //   20 * 1000
  // ) {
  //   // prevent overupdating
  //   console.log('overupdating')
  //   return
  // }
  const webhookClient = new WebhookClient({
    url: process.env.DISCORD_WEBHOOK_URL
  })

  const serverCurrentState = await getServerCurrentState()

  const statusEmbed = new MessageEmbed()

  statusEmbed.addField('狀態', SERVER_STATE_DICT[serverCurrentState], false)
  try {
    const serverStatus = await MC.status(process.env.MC_SERVER_IP, 25565, {
      timeout: 1000 * 5,
      enableSRV: true
    })
    console.log(serverStatus)
    statusEmbed.addField(
      '在線玩家',
      `${serverStatus.players.online}/${serverStatus.players.max}`,
      false
    )
    statusEmbed.addField('版本', serverStatus.version.name, false)
  } catch (e) {
    console.log(e)
    statusEmbed.addField('在線玩家', `0/20`, false)
    statusEmbed.addField('版本', '1.19', false)
  }
  statusEmbed.addField('IP地址', process.env.MC_SERVER_IP, false)
  statusEmbed.addField('白名單', 'Server用緊白名單，想入嘅要PM @Markc 加你入去。', false)
  statusEmbed.setTitle('Minecraft Survival Server').setColor('0xba66ff')
  statusEmbed.setFooter(
    `最後更新時間: ${moment(new Date())
      .utcOffset('+0800')
      .format('YYYY-MM-DD HH:mm:ss')}（每分鐘更新一次）`
  )

  const urlEmbeds = []

  urlEmbeds.push(
    new MessageEmbed()
      .setTitle('Server冇人15分鐘會自動熄，撳呢條link可以自己開返。')
      .setColor('0xdda728')
      .setURL(process.env.START_SERVER_INSTANCE_URL)
  )

  const serverLog = await getServerLog()
  const serverLogEmbed = new MessageEmbed().setTitle('Server Log').setColor('0xdda728')
  let operationString = ''
  for (let log of serverLog) {
    operationString += createLogEntry(log)
  }
  serverLogEmbed.addField('last 10 operations', '```' + `${operationString}` + '```')

  const message = await webhookClient.editMessage(process.env.MESSAGE_ID, {
    content: ' ',
    embeds: [statusEmbed, ...urlEmbeds, serverLogEmbed]
  })

  await refreshDiscordLastUpdate()
  return
}
