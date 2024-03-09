import { Express } from "express"
const express = require('express')
import { MonitorControler } from "./api/controller/monitorController"

const monitorRouters = require("./api/routes/monitor")

MonitorControler
const app = new express()
const port = 8080

const path = require("path")
const basePath = path.join(__dirname, 'templates')

const checkAuth = function(request, response, next){

    request.authStatus = true

    if(request.authStatus){
        console.log("logged In!")
        next()
    }else {
        console.log("Is not logged!")
        next()
    }
}

app.use(checkAuth)

// Routes
app.use('/monitor/api', monitorRouters)

app.listen(port, () => {
    console.log(`Running in port: ${port}`)
})