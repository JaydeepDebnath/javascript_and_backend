// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from "./db/inedx.js";
import {app} from "../app.js"

dotenv.config({
    path : './.env'
})


connectDB()
.then(()=>{
  app.listen(process.env.PORT || 3000,()=>{
    console.log(`⚙️Server is running at PORT ${process.env.PORT}`)
    })  
})
.catch((err)=>{
    console.log("MONGO DB connection failed !!",err);
})








/*
import express from "express"
const app = express()


function connectDB(){}

;(async()=>{
    try {
       mongoose.connect(`${process.env.MONGODB_URI}/
       ${DB_NAME}`)
       app.on("error",(error)=>{
        console.error("ERROR:",error);
        throw error
       }) 

       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on portc ${process.env.PORT}`)
       })
    } catch (error) {
        console.error("ERROR:",error);
        throw err
    }
})()
// connectDB()
*/