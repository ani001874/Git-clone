import { Document, Model, model, Schema, ValidatorProps } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  username: string;
  profilePic: string;
 
}

interface IUserMethods {
  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
}

type UserModel = Model<IUser,{},IUserMethods>

const userSchema = new Schema<IUser,UserModel,IUserMethods>(
  {
    fullName: {
      type: String,
      required: [true, "FullName is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return v.includes("@") && v.includes(".");
        },
        message: (props: ValidatorProps) =>
          `${props.value} must be contain '@' and '.'`,
      },
    },

    username: {
      type: String,
      lowercase: true,
      required: [true, "Username is required"],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /["@_"]/.test(v);
        },
        message: (props: ValidatorProps) =>
          `${props.value} must contain  '@' or '_"   `,
      },
    },

    password: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    profilePic: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next): Promise<void> {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
  }
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE as string,
    } as jwt.SignOptions
  );
};



export const User = model<IUser,UserModel>("User",userSchema)


