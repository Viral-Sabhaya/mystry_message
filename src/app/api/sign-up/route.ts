import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {

  await dbConnect()
  try {
    const { userName, email, password } = await request.json();
    const existingUserVerifiedUsername = await UserModel.findOne({ userName, isVerified: true });
    if (existingUserVerifiedUsername) {
      return Response.json({ success: false, message: "Username is already taken" }, { status: 400 })
    }
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(10000 + Math.random() * 90000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json({ success: false, message: 'User already exist with this email' }, { status: 400 })
      } else {
        const hashPassword = await bcrypt.hashSync(password, 10);
        existingUserByEmail.password = hashPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 360000)
        await existingUserByEmail.save();
      }
    } else {
      const hashPassword = await bcrypt.hashSync(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        userName,
        email,
        password: hashPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        message: []
      });
      await newUser.save()
    }
    // send verification email
    const emailResponse = await sendVerificationEmail(email, userName, verifyCode);
    if (!emailResponse.success) {
      return Response.json({ success: false, message: emailResponse.message }, { status: 500 })
    }
    return Response.json({ success: true, message: 'User register successfully. Please verify your email' }, { status: 201 })
  } catch (error) {
    console.error('Error registering user', error)
    return Response.json({
      success: false,
      message: "Error registering user"
    }, { status: 500 })
  }
}