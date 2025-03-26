import { NextFunction, RequestHandler, Request, Response } from "express";
import ApiError from "./apiError";




const asyncHandler = (fn:RequestHandler) => async (req:Request, res:Response, next:NextFunction) => {
  try {
    await fn(req, res,next);
  } catch (error ) {
    if(error instanceof ApiError) {
       res.status(error.statusCode).json({
        status:error.statusCode,
        success:error.success,
        message:error.message
       })
    }else if(error instanceof Error) {
      res.status(400).json({
        
         message:error.message
         
      })
    }else {
      res.status(500).json({
        message:"Internal Server errror"
      })
    }
  }
};


export default asyncHandler
