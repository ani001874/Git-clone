import { Router } from "express";
import { readCommitsFromClient } from "../controllers/git.controller";


const router = Router()

router.route("/read").get(readCommitsFromClient)

export default router