"use client"

import { useQuery } from "@tanstack/react-query"
import { Message, useChat } from "ai/react"
import axios from "axios"
import { Send } from "lucide-react"
import React from "react"
import MessageList from "./MessageList"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
  // This gets the old messages
  const { data, isPending } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>(`/api/get-messages`, {
        chatId,
      })
      return await response.data
    },
  })
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  })

  // smooth scrolling down of the chat
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container")
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  return (
    <div className="relative h-screen" id="message-container">
      {/* headers */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* message list*/}
      <MessageList messages={messages} isPending={isPending} />

      {/* input form */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        {/* thios flex box is what puts them in the same horizontal line  */}
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          ></Input>
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatComponent
