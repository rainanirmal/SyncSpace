import mongoose, { Schema } from "mongoose";
import { TaskStatusEnum, AvailableTaskStatuses } from "../utils/constants";

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: AvailableTaskStatuses,
            default: TaskStatusEnum.TODO
        },
        attachments: {
            type: [{
                url: {
                    type: String,
                    mimetype: String,
                    size: Number
                }
            }],
            default: []
        }
    }, 
    { timestamps: true}
);

const Task = mongoose.model("Task", taskSchema);

export { Task };