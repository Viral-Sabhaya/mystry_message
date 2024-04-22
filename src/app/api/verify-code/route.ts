import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User.model'

export async function POST(request: Request) {
  await dbConnect()
  try {
    const { userName, code } = await request.json();
    const decodedUserName = decodeURIComponent(userName)
    const result = await UserModel.findOne({ userName: decodedUserName })
    if (!result) {
      return Response.json({
        success: false,
        message: 'User not found'
      }, { status: 500 })
    }
    const isCodeValid = result.verifyCode === code
    const isCodeNotExpired = new Date(result.verifyCodeExpiry) > new Date()

    if (isCodeValid && isCodeNotExpired) {
      result.isVerified = true
      await result.save()
      return Response.json({
        success: true,
        message: 'Account verified successfully'
      }, { status: 200 })
    } else if (!isCodeNotExpired) {
      return Response.json({
        success: false,
        message: 'Verification code has expired, please signup again to get a new code'
      }, { status: 400 })
    } else {
      return Response.json({
        success: false,
        message: ' Incorrect Verification code '
      }, { status: 400 })

    }

  } catch (error) {
    console.error('Error verify user', error)
    return Response.json({
      success: false,
      message: 'Error verify user'
    }, { status: 500 })
  }
}

