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
      username: searchParams.get('username')
    }
    // validate with zod
    UserNameQuerySchema.safeParse(queryParam)
  } catch (error) {
    console.error('Error checking username', error)
    return Response.json({
      success: false,
      message: 'Error checking username'
    }, { status: 500 })
  }
}

