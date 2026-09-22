import { Router } from "express";
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controllers.js";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

const adminRoles = [UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN];

router
  .route("/")
  .get(validateProjectPermission(AvailableUserRoles), getTasks)
  .post(validateProjectPermission(adminRoles), upload.array("attachments"), createTask);

router
  .route("/:taskId")
  .get(validateProjectPermission(AvailableUserRoles), getTaskById)
  .put(validateProjectPermission(adminRoles), updateTask)
  .delete(validateProjectPermission(adminRoles), deleteTask);

router
  .route("/:taskId/subtasks")
  .post(validateProjectPermission(adminRoles), createSubTask);

router
  .route("/subtasks/:subTaskId")
  .put(validateProjectPermission(adminRoles), updateSubTask)
  .delete(validateProjectPermission(adminRoles), deleteSubTask);

export default router;
