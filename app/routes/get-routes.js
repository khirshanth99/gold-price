const express = require('express')
const  {getData} = require('../controller/getData')

const router = express.Router()



router.get('/:instruments/:timestamps' ,getData)

module.exports = router;