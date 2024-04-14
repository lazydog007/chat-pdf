import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import { getEmbeddings } from "./embedding";
import { downloadFromS3 } from "./s3-server";
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecode(
  file_key: string
): Promise<Document[]> {
  // 1. download file from s3 and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(file_key);
  if (!file_name) {
    throw new Error("file not found");
  }

  console.log(`loading ${file_name} pdf into pinecone`);

  // use langchain to load the pdf
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log("pages", pages);

  // 2. split and segment the pdf
  const documents = await Promise.all(
    pages.map((page) => prepareDocument(page))
  );

  // 3. vectorise and embed individual docs
  const vectors = await Promise.all(documents.flat().map(embedDocument)); // needs to be flat become its a Promise

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.Index("chat-pdf");

  const namespace = pineconeIndex.namespace(convertToAscii(file_key));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  // const namespace = convertToAscii(file_key); // needs to be all ASCII

  // PinecodeUtils.chunkedUpsert(pinecondeIndex, vectors, namespace);
  return documents[0];
}

async function embedDocument(doc: Document): Promise<PineconeRecord> {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent); // hash for pinecode to understand

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.error("Error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enconder = new TextEncoder();
  return new TextDecoder("utf-8").decode(enconder.encode(str).slice(0, bytes));
};

// takes a single page and splits it into multiple pages
async function prepareDocument(page: PDFPage): Promise<Document[]> {
  let { pageContent, metadata } = page;

  pageContent = pageContent.replace(/\n/g, ""); //replace all new line with empty space

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 30000),
      },
    }),
  ]);

  return docs;
}
