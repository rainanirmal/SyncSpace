import { User } from "../models/users.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import mongoose from "mongoose";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async(req, res) => {
    
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if(!project) {
        throw new ApiError(400, "Project not found !");
    }

    const tasks = await Task.find({
        project: new mongoose.Types.ObjectId(projectId),
    }).populate("assignedTo" , "avatar username fullName");

    return res
        .status(201)
        .json(
            201,
            tasks,
            "Tasks fetched successfully !"
        );
});

const createTask = asyncHandler(async(req, res) => {
    const { title, description, aassignedTo, status } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if(!project) {
        throw new ApiError(404, "Project not found !");
    }

    const files = req.files || [];

    const attachements = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    });

    const task = await Task.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments: attachements
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                task,
                "Task created successfully"
            )
        );
});

const getTaskById = asyncHandler(async(req, res) => {
    // test
});

const updateTask = asyncHandler(async(req, res) => {
    // test
});

const deleteTask = asyncHandler(async(req, res) => {
    // test
});

const createSubTask = asyncHandler(async(req, res) => {
    // test
});

const updateSubTask = asyncHandler(async(req, res) => {
    // test
});

const deleteSubTask = asyncHandler(async(req, res) => {
    // test
});

export {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
};