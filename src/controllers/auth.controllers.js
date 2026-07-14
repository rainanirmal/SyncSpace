import { User } from "../models/users.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

const registerUser = asyncHandler(async (req, res) => {

    const {username, email, password, role } = req.body;

    const existUser = await User.findOne({
        $or: [{username} , {email}]
    });

    if(existUser) {
        throw new ApiError(409, "User with this email or username already exists." , []);
    }
})