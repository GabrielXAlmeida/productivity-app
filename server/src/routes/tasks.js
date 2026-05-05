import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
} from "../controllers/taskController.js"

const router = Router()

router.use(authMiddleware)

router.get("/", getTasks)
router.post("/", createTask)
router.put("/:id", updateTask)
router.delete("/:id", deleteTask)
router.patch("/:id/complete", completeTask)

export default router