/**
 * Create the VPC Firewall Rule to allow the function caller to access the Minecraft server
 * env requirement: nodejs 14
 */
var http = require('http')
var Compute = require('@google-cloud/compute')
var compute = new Compute()
var fwname = 'minecraft-fw-rule-' + Math.floor(new Date() / 1000)

exports.whiteListing = function whiteListing(req, res) {
  // Record the function caller's IPv4 address
  console.log(JSON.stringify(req.headers))
  sourceIp = req.get('X-Forwarded-For')
  let callerip = req.query.message || req.body.message || sourceIp

  // Set the Firewall configs
  const config = {
    protocols: { tcp: [25565] },
    ranges: [callerip + '/32'],
    tags: ['minecraft-server']
  }
  function callback(err, firewall, operation, apiResponse) {}

  // Create the Firewall
  compute.createFirewall(fwname, config, callback)

  // Return a response
  res.status(200).send('Firewall rule created named ' + fwname + ' for IP address ' + callerip)
}
