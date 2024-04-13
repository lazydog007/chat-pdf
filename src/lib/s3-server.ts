import AWS from "aws-sdk";
import fs from "fs";

// download file from s3 for server to user
export async function downloadFromS3(file_key: string) {
  try {
    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY!,
      },
      region: "us-east-1",
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    const obj = await s3.getObject(params).promise();
    const file_name = `/tmp/pdf-${Date.now()}.pdf`; // local storage
    console.log("\ndownloaded from s3\n");
    fs.writeFileSync(file_name, obj.Body as Buffer);
    console.log("File synced to local storage");

    return file_name;
  } catch (error) {
    console.error(error);
    return null;
  }
}
