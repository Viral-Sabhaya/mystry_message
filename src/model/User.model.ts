import mongoose, { Schema, Document } from "mongoose";
export interface Message extends Document {
  content: string,
  createdAt: Date,
}
export interface User extends Document {
  userName: string,
  email: string,
  password: string,
  verifyCode: string,
  verifyCodeExpiry: Date,
  isVerified: boolean,
  isAcceptingMessage: boolean,
  message: Message[]
}

const messageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now()
  }
})

const userSchema: Schema<User> = new Schema({
  userName: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  verifyCode: {
    type: String,
    required: [true, 'Verify code is required']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify code expiry is required']
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  message: [messageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model<User>("User", userSchema))

export default UserModel