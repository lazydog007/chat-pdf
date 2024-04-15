import { getContext } from "@/lib/context"
import { db } from "@/lib/db"
import { messages as _messages, chats } from "@/lib/db/schema"
import { Message, OpenAIStream, StreamingTextResponse } from "ai"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai-edge"
import toast from "react-hot-toast"
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json()

    // get the chats from the db
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId))

    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 })
    }

    const fileKey = _chats[0].fileKey
    const lastMessage = messages[messages.length - 1]
    const context = await getContext(lastMessage.content, fileKey)

    const prompt = {
      role: "system",
      content: `Al assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of Al include expert knowledge, helpfulness, cleverness, and articulateness.
      Al is always friendly,kind,and inspiring,and is eager to provide vivid and thoughtful responses to the user.
      Al has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic.
      Al assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END CONTEXT BLOCK
      Al assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      It the context does not provide the answer to question, the Al assistant will say, but don"t know therant
      Al assistant will not apologize for previous responses, but instead will indicated new information was gained.
      Al assistant will not invent anything that is not draw directly from the context.`,
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"), // only messages from the user
      ],
      stream: true,
    })

    // streaming effect is awesome
    // completion is the response from the AI
    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        }) // make sure its drizzle
      },
      onCompletion: async (completion) => {
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        }) // make sure its drizzle
      },
    })
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.log("something bad happened")
    toast.error("Error creating chat" + error)
  }
}
