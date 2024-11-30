import express from "express"
import { getUserSavedPosts, savePost, getAllUsers } from "../controllers/user.controller.js"

const router = express.Router()

router.get("/saved", getUserSavedPosts)
router.patch("/save", savePost)
router.get("/all", getAllUsers)

export default router 