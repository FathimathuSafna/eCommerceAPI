import express from 'express';
import { userSignup,userLogin,updateDetails,getUserDetails } from '../controller/userController.js';
import protect from '../middleWare/userMiddleWare.js'

const app = express.Router()

app.route('/').post(userSignup)
app.route('/login').post(userLogin)
app.route("/:id").put(protect,updateDetails).get(getUserDetails)

export default app