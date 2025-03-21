import { NextFunction, RequestHandler, Request, Response } from "express";
import ApiError from "./apiError";




const asyncHandler = (fn:RequestHandler) => async (req:Request, res:Response, next:NextFunction) => {
  try {
    await fn(req, res,next);
  } catch (error ) {
    if(error instanceof ApiError) {
       res.status(error.statusCode).json({
          message:error.message
       })
    }
  }
};
