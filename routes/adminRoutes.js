import express from 'express'
import {adminSignup,adminLogin,addPatients,getPatients} from '../controller/adminController.js'
import protect from '../middleWare/userMiddleWare.js'
const app = express.Router()

app.route('/').post(adminSignup)
app.route('/login').post(adminLogin)
app.route('/add').post(addPatients).get(getPatients)

export default app