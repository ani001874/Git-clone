import { HydratedDocument } from "mongoose";
import { IUser, User } from "../model/user.model";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

const createAccount = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;
  console.log(fullName, email, password, username);

  if (
    [fullName, email, password, username].some((field) => field.trim() === "")
  ) {
    throw new ApiError("All field are required", 404);
  }

  const isExistUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (isExistUser) {
    throw new ApiError("User with this email or username is exist", 400);
  }

  const user = new User({
    email,
    username,
    password,
    fullName,
  });

  const createdUser = await user.save();
  console.log(createdUser)

  if (!createdUser) {
    throw new ApiError("No user found!", 404);
  }

  res
    .status(201)
    .json(
      new ApiResponse<HydratedDocument<IUser>>(
        "User created successfully",
        createdUser
      )
    );
});

// const createAccount = asyncHandler(async (req, res) => {
//   console.log("hello"); // ✅ Should print
//   res.status(200).json({ message: "Test successful" });
// });

export { createAccount };
