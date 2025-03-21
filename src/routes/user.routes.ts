import { Router } from "express";
import { createAccount } from "../controllers/user.controller";


const router = Router()

router.route('/createAccount').post(createAccount);
export default router