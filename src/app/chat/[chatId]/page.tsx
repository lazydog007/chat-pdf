import ChatComponent from "@/components/ChatComponent"
import ChatSidebar from "@/components/ChatSidebar"
import PDFViewer from "@/components/PDFViewer"
import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { checkSubscription } from "@/lib/subscription"
import { auth } from "@clerk/nextjs"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
type Props = {
  params: {
    chatId: string
  }
}

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth()
  const isPro = await checkSubscription() // check if we are subscribed

  if (!userId) {
    return redirect("/sign-in")
  }

  // _chats are the list of the chats that the user has
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId))

  if (!_chats) {
    return redirect("/")
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/")
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId))

  return (
    <div className="flex h-screen">
      <div className="flex w-full">
        {/* chat sidebar*/}
        <div className="flex-[3] overflow-y-scroll bg-gray-900">
          <ChatSidebar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>
        {/* pdf viewer */}
        <div className="flex-[5] p-4">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-1-4 border-1-slate-200 overflow-y-scroll">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage
