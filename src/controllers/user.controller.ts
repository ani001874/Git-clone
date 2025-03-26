import { HydratedDocument, Types } from "mongoose";
import { IUser, User } from "../model/user.model";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { CookieOptions } from "express";
import { CustomRequest } from "../types/user";
import bcrypt from "bcryptjs";

const generateAccessTokenAndRefreshToken = async (
  userId: unknown
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // store refreshToken at database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const createAccount = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;

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

  if (!createdUser) {
    throw new ApiError("No user found!", 404);
  }

  // generate AccessToken and refeshToken
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(createdUser._id);

  // this is the cookie options
  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, {
      ...options,
      maxAge: 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json(
      new ApiResponse<HydratedDocument<IUser>>(
        "User created successfully",
        createdUser
      )
    );
});

const loginAccount = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError("please enter username or email", 404);
  }

  if (!password) {
    throw new ApiError("Password should not blank", 404);
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(
      "No user found with this username or email.please signup",
      400
    );
  }

  //console.log(user.password)

  const verifyPassword: boolean = await user.checkPassword(password);

  if (!verifyPassword) {
    throw new ApiError("Wrong Password! Please Try again", 400);
  }

  // if user is exist and password is matched correctly then proceed login

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .cookie("accessToken", accessToken, {
      ...options,
      maxAge: 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 10 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json(new ApiResponse<null>("User logged in successfully", null));
});

const userLogout = asyncHandler(async (req: CustomRequest, res) => {
  const user: IUser = req.user;

  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse<null>("User Logout successfully", null));
});

const getUserDetails = asyncHandler(async (req: CustomRequest, res) => {
  res
    .status(200)
    .json(
      new ApiResponse<HydratedDocument<IUser>>(
        "User data fetched successfully",
        req.user
      )
    );
});

export { createAccount, loginAccount, userLogout, getUserDetails };
