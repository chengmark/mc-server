const axios = require('axios')

exports.main = async (req, res) => {
  const id = req.params.id
  axios
    .get(`http://${process.env.MC_SERVER_IP}:8080/whitelist/add/${id}`)
    .then((a_res) => {
      console.log(`statusCode: ${a_res.status}`)
      console.log(a_res)
      res.json(a_res)
    })
    .catch((error) => {
      console.error(error)
      res.send(error)
    })
}
