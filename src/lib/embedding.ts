import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002", // model for embeddings
      input: text.replace(/\n/g, " "),
    });

    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (error) {
    console.log("error calling OpenAI embedding api", error);
    throw error;
  }
}
