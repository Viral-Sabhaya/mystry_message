import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect()
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { userName: credentials.identifier },
            ]
          })
          if (!user) {
            throw new Error('No user found with this email')
          }
          if (!user.isVerified) {
            throw new Error('please verify your email before login')
          }
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
          if (isPasswordCorrect) {
            return user
          } else {
            throw new Error('Incorrect password')
          }
        } catch (err: any) {
          throw new Error(err)
        }
      }
    })
  ],
  pages: {
    signIn: '/sign-in'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id
        session.user.userName = token.userName
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessages = token.isAcceptingMessages
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessages;
        token.userName = user.userName;
      }
      return token
    }
  }
}