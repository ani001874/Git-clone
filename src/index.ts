import express,{Express} from "express"
import dotenv from 'dotenv'

dotenv.config()
const app:Express = express()

app.use(express.urlencoded({ limit: "100kb", extended: true }));
app.use(express.json())

import userRouter from './routes/user.routes'
app.use('/api/v1/users', userRouter)

export default app