const moment = require('moment')
const { Firestore } = require('@google-cloud/firestore')
const { main, refreshDiscordLastUpdate, getDiscordLastUpdate } = require('.')
const { sendEmbed } = require('./sendEmbed')
const firestore = new Firestore()

const getServerLog = async () => {
  const collectionReference = firestore.collection('server-log')
  const documents = await collectionReference.orderBy('at').limitToLast(10).get()
  const docData = documents.docs.map((d) => d.data())
  return docData
}

// getServerLog()

// main()
// refreshDiscordLastUpdate()
sendEmbed()
