const express = require('express')
const appRoute = require('./get-routes')

const router = express.Router()



router.use('/Get-Data',appRoute)


module.exports = router

