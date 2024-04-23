import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))
// config
app.use(express.json({limit: "16kb"}))  // to accept json format
app.use(express.urlencoded({extended:true,limit:
    "20kb"}))        // to accept url
app.use(express.static("public"))
app.use(cookieParser())


export {app}
