const { exec } = require('child_process')
const express = require('express')
const app = express()

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

const addToWhitelist = async (id) => {
  await execCmd(`sh /home/minecraft/http_server/scripts/addToWhitelist.sh ${id}`)
}

const removeFromWhitelist = async (id) => {
  await execCmd(`sh /home/minecraft/http_server/scripts/removeFromWhitelist.sh ${id}`)
}

const runBackup = async () => {
  execCmd(`sh /home/minecraft/http_server/scripts/manualBackup.sh`)
}

app.get('/whitelist/add/:id', async (req, res) => {
  const id = req.params.id
  await addToWhitelist(id)
  res.status(200).send(`added ${id} to whitelist`)
})

app.get('/whitelist/remove/:id', async (req, res) => {
  const id = req.params.id
  await removeFromWhitelist(id)
  res.status(200).send(`removed ${id} whitelist`)
})

app.get('/backup', async (req, res) => {
  runBackup()
  res.status(200).send(`running backup script`)
})

const PORT = 8080
app.listen(PORT, () => {
  console.log(`http server running on port ${PORT}`)
})
