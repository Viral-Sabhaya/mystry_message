import { Message } from "@/model/User.model";

export interface ApiResponse {
  success: boolean,
  message: string,
  messages?: Array<Message>,
  isAcceptingMessages?: boolean
}