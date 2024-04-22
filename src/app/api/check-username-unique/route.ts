import { z } from 'zod'
import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User.model'
import { userNameValidation } from '@/schemas/signUpSchema'

const UserNameQuerySchema = z.object({
  userName: userNameValidation
})
export async function GET(request: Request) {

  await dbConnect()
  try {
    const { searchParams } = new URL(request.url)
    const queryParam = {
      userName: searchParams.get('userName')
    }
    // validate with zod
    const result = UserNameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameError = result.error.format().userName?._errors || []
      return Response.json({
        success: false,
        message: usernameError.length > 0 ? usernameError.join(',') : 'Invalid query parameters'
      },
        { status: 400 })
    }
    const { userName } = result.data
    const existingUser = await UserModel.findOne({ userName, isVerified: true });
    if (existingUser) {
      return Response.json({
        success: false,
        message: 'User name already exists'
      }, { status: 400 })
    }
    return Response.json({
      success: true,
      message: 'Username is unique'
    }, { status: 500 })
  } catch (error) {
    console.error('Error checking username', error)
    return Response.json({
      success: false,
      message: 'Error checking username'
    }, { status: 500 })
  }
}

