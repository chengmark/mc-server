const moment = require('moment')
const { Firestore } = require('@google-cloud/firestore')
const firestore = new Firestore()

exports.main = async (req, res) => {
  const document = firestore.doc(`server-log/${new Date().getTime()}`)
  await document.set({
    at: moment(new Date()).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss'),
    operation: 'start'
  })
}

main()
