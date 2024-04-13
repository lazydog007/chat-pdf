import { loadS3IntoPinecode } from "@/lib/pinecone";
import { NextResponse } from "next/server";

// /api/create-chat
export async function POST(req: Request, res: Response) {
  try {
    const { file_key, file_name } = await req.json();
    const pages = await loadS3IntoPinecode(file_key);

    return NextResponse.json({ message: "success" });
    // return NextResponse.json({ pages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
