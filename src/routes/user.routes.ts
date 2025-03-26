import { Router } from "express";
import { createAccount, getUserDetails, loginAccount, userLogout } from "../controllers/user.controller";
import {  verifyJWT } from "../middlewares/auth.middleware";



const router = Router()

router.route('/createAccount').post(createAccount);
router.route('/login').post(loginAccount)
router.route('/userLogout').post(verifyJWT,userLogout)
router.route('/profile').get(verifyJWT,getUserDetails)
export default router