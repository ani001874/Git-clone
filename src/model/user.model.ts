import { Document, Model, model, Schema, ValidatorProps } from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from 'crypto'


export interface IUser extends Document {
  fullName: string;
  email: {
    emailID: string;
    isVerify: boolean;
    verifyToken: number;
    expireAt:Date;
  };
  password: string;
  username: string;
  profilePic: string;
  refreshToken: string;
}

interface IUserMethods {
  checkPassword: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
 
}

type UserModel = Model<IUser, {}, IUserMethods>;

const emailSchema = new Schema({
  emailID: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: function (v: string) {
        return v.includes("@") && v.includes(".");
      },
      message: (props: ValidatorProps) =>
        `${props.value} must be contain '@' and '.'`,
    },
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: Number,
    default:0
  },
  expireAt: { type: Date, required:true },
},
{
  _id:false
}
);

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    fullName: {
      type: String,
      required: [true, "FullName is required."],
      trim: true,
    },
    email: {
      type: emailSchema,
      required: true,
    },

    username: {
      type: String,
      lowercase: true,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return v.includes("_");
        },
        message: (props: ValidatorProps) => `${props.value} must contain  '_'`,
      },
    },

    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.pre("save",function(next){

  if(this.isModified("email") && !this.email.isVerify) {
    this.email.verifyToken = crypto.randomInt(1000,10000)
    this.email.expireAt = new Date(Date.now() + 5 * 60 * 1000)
  }
  next()

})

userSchema.methods.checkPassword = async function (
  password: string
): Promise<boolean> {

  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email.emailID,
    } as JwtPayload,
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE as string,
    } as jwt.SignOptions
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE as string,
    } as jwt.SignOptions
  );
};




export const User = model<IUser, UserModel>("User", userSchema);