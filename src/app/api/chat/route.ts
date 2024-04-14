import { OpenAIStream, StreamingTextResponse } from "ai";
import { Configuration, OpenAIApi } from "openai-edge";
import toast from "react-hot-toast";
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    });

    // streaming effect is awesome
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.log("something bad happened");
    toast.error("Error creating chat" + error);
  }
}
