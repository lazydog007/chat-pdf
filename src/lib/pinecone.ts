import { Pinecone } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { downloadFromS3 } from "./s3-server";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  return pinecone;
};

export async function loadS3IntoPinecode(file_key: string) {
  // download file from s3 and read
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(file_key);
  if (!file_name) {
    throw new Error("file not found");
  }

  console.log(`loading ${file_name} pdf into pinecone`);

  // use langchain to load the pdf
  const loader = new PDFLoader(file_name);
  const pages = await loader.load();
  console.log("pages", pages);
  return pages;
}
