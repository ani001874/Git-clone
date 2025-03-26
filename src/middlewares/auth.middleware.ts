import { JwtPayload, Secret, verify } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import { IUser, User } from "../model/user.model";
import ApiError from "../utils/apiError";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { CustomRequest } from "../types/user";

const verifyJWT = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {

    const accessToken: string | undefined = req.cookies.accessToken;
   
    if (accessToken) {
      const decodeAccessToken = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET as Secret
      ) as JwtPayload;
      const user = await User.findById(decodeAccessToken.id);
      req.user = user;
      return next();
    }

  
    const refreshToken: string|undefined = req.cookies.refreshToken

    if(!refreshToken) {
      throw new ApiError("Token is expired! please login", 400)
    }

    const decodeRefreshToken = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret) as JwtPayload;
    const user = await User.findById(decodeRefreshToken.id)

    if(!user) {
      throw new ApiError("No user found", 404)
    }

    if(refreshToken !== user.refreshToken) {
        throw new  ApiError("Unauthorized Access!", 400)
    }

    const newAccessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    res.cookie("accessToken", newAccessToken);
    res.cookie("refreshToken", newRefreshToken)
    user.refreshToken = newRefreshToken;
    await user.save({validateBeforeSave:false})

    req.user = user;

     return next();
  }
);

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  //collect refreshToken from cookies
  const refreshToken: string | undefined = req.cookies.refreshToken;
  const accessToken: string | undefined = req.cookies.accessToken;

  if (accessToken) {
    return next();
  }
  console.log("Access Token is expired...");

  // check refreshToken is exist or not
  if (!refreshToken) {
    throw new ApiError("Your token is expired! Please login..", 401);
  }

  // if exist

  const decodeRefreshToken = verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as Secret
  );

  console.log(decodeRefreshToken);

  if (typeof decodeRefreshToken === "string") {
    throw new ApiError("This token is not valid", 401);
  }

  const user = await User.findById(decodeRefreshToken.id);

  if (!user) {
    throw new ApiError("User Does not exists", 400);
  }

  // create a new AccessToken for  the user

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const options: CookieOptions = {
    httpOnly: true,
    secure: true,
  };

  next();
});

export { verifyJWT };
