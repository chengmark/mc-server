const { Client, Intents, WebhookClient, MessageEmbed } = require('discord.js')
const moment = require('moment')
require('dotenv').config()

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const MC_SERVER_IP = process.env.MC_SERVER_IP
const START_SERVER_INSTANCE_URL = process.env.START_SERVER_INSTANCE_URL

exports.sendEmbed = async function () {
  const webhookClient = new WebhookClient({
    url: DISCORD_WEBHOOK_URL
  })

  const statusEmbed = new MessageEmbed()
  statusEmbed.addField('Status', ':red_circle: Offline', false)
  statusEmbed.addField('Players', `0/20`, false)
  statusEmbed.addField('Version', '1.19', false)
  statusEmbed.addField('Address', MC_SERVER_IP, false)
  statusEmbed.setTitle('Minecraft Survival Server').setColor('0xba66ff')
  statusEmbed.setFooter(
    `last update: ${moment(new Date()).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss')}`
  )

  const urlEmbeds = []

  urlEmbeds.push(
    new MessageEmbed()
      .setTitle('Click This Link to Start Server')
      .setColor('0xdda728')
      .setURL(START_SERVER_INSTANCE_URL)
  )

  const serverLogEmbed = new MessageEmbed().setTitle('Server Log').setColor('0xdda728')

  webhookClient.send({ embeds: [statusEmbed, ...urlEmbeds, serverLogEmbed] })

  return
}
