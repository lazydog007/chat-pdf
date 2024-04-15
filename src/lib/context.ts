import { Pinecone } from "@pinecone-database/pinecone"
import { getEmbeddings } from "./embedding"
import { convertToAscii } from "./utils"

export async function getMatchesFromEmbedding(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  })

  const pineconeIndex = await pinecone.Index("chat-pdf")
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey))

  // TODO: for some reason is not getting the context correctly
  try {
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    })

    console.log("queryResult", queryResult)

    return queryResult.matches || []
  } catch (error) {
    console.log("error querying embeddings", error)
    throw error
  }
}
export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query)
  const matches = await getMatchesFromEmbedding(queryEmbeddings, fileKey)

  console.log("queryEmbeddings", queryEmbeddings)
  console.log("matches", matches)
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  )

  type Metadata = {
    text: string
    pageNumber: number
  }

  let docs = qualifyingDocs.map((doc) => (doc.metadata as Metadata).text)

  console.log("docs", docs)

  // cut the maximum token
  return docs.join("\n").substring(0, 3000)
}
