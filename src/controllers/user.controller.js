import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/FileUpload.js"
import {ApiResponse} from "../utils/ApiResponse.js"

//get user details
const registerUser = asyncHandler( async (req, res) => {
    const {fullName, email, username, password} = req.body
    console.log("email: ", email);

    //validation - not empty
   if ([fullName, email, username, password].some((field) => field?.trim() === "")) 
    {
        throw new ApiError(400, "All fileds are required")
    }

    //check if user already exists
    const existedUSer = await User.findOne({$or: [{email}, {username}]})
    if(existedUSer) {
        throw new ApiError(409, "User already exists")
    }

    //check for images, *avatar*
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "profile image required!")
    }

    //upload images on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar) {
        throw new ApiError(400, "profile image required!")
    }

    //create user object (database)
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //validation - check user created
    //remove password & refreshToken field form response
    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiError(500, "User register failed")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
    
})

export {registerUser}