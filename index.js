const express = require('express')
const http = require('http')
const boom = require('boom')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./router')
const jwt = require('jsonwebtoken') 




const app = express() 
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use('/',router)

const server = http.createServer(app) 
const port = 9800
server.listen(port,()=>{
    console.log(`HTTP服务器搭建完成,端口号为${port}`)
})
