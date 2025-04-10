import * as FileSystem from "expo-file-system";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const S3_BASE_URL = "https://trekies.s3.ap-south-1.amazonaws.com/uploads/";

export const uploadFilesToS3 = async (files, id = 12, type = "tour") => {
  try {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${file.fileName}_${Date.now()}`;
      const preSignedUrlResponse = await fetch(`${BASE_URL}/api/putObject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, contentType: file.mimeType }),
      });

      if (!preSignedUrlResponse.ok) {
        throw new Error(`Failed to get pre-signed URL for ${file.fileName}`);
      }

      const presignedUrl = await preSignedUrlResponse.json();
      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryData = Uint8Array.from(atob(fileData), (c) =>
        c.charCodeAt(0)
      );
      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.mimeType },
        body: binaryData,
      });

      const fileUrl = `${S3_BASE_URL}${fileName}`;
      await fetch(`${BASE_URL}/api/image/create-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, url: fileUrl, type }),
      });
      return fileUrl;
    });
    await Promise.all(uploadPromises);
    return true;
  } catch (error) {
    console.error("Upload failed:", error);
    return false;
  }
};

export const uploadFileToS3 = async (file) => {
  try {
    if (!file || !file.uri || !file.mimeType) {
      throw new Error("Invalid file data provided.");
    }

    const name = file.fileName || file.name || "file";
    const extension = file.mimeType.split("/")[1] || "png";
    const fileName = `${name.split(" ")[0]}_${Date.now()}.${extension}`;

    console.log("Uploading file:", fileName, "MIME:", file.mimeType);

    // Step 1: Get the pre-signed URL from your server
    const res = await fetch(`${BASE_URL}/api/putObject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, contentType: file.mimeType }),
    });

    const presignedUrl = await res.text();
    console.log("Pre-signed URL:", presignedUrl);

    if (!res.ok || !presignedUrl) {
      throw new Error(`Failed to get pre-signed URL: ${res.status}`);
    }

    // Step 2: Fetch the file from local uri (handled by Expo)
    const fileResponse = await fetch(file.uri);
    const blob = await fileResponse.blob();

    console.log("File size:", blob.size);

    // Step 3: Upload to S3 using the pre-signed URL
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.mimeType,
      },
      body: blob,
    });

    console.log("Upload response status:", uploadRes.status);

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Failed to upload file: ${fileName} - ${errorText}`);
    }

    const fileUrl = `${S3_BASE_URL}${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Upload error:", error.message);
    throw error;
  }
};
