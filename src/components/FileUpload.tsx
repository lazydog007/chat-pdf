"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios"; // Import the missing dependency
import { Inbox, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
const FileUpload = () => {
  const router = useRouter(); // make sure its coming from next/navigation
  const [uploading, setUploading] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      // Fix the syntax errors and provide proper types for the variables
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large!");
        alert("File size should be less than 10MB");
        return;
      }
      try {
        setUploading(true); // start the uploading

        const data = await uploadToS3(file);

        if (!data?.file_key || !data?.file_name) {
          toast.error("Something went wrong");
          alert("Error uploading file");
          return;
        }

        // make the axios call here with the mutate
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            console.log("Chat created");
            router.push(`/chat/${chat_id}`);
          },
          onError: (error) => {
            console.error("error", error);
            toast.error("Error creating chat" + error.message);
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false); // at the very end
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            {/* Loader Loading the Loading */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Heney on the GPT...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
