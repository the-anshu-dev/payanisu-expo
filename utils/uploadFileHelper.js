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

    const res = await fetch(`${BASE_URL}/api/putObject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, contentType: file.mimeType }),
    });

    const presignedUrl = await res.text();

    console.log('11111')

    if (!res.ok || !presignedUrl) {
      throw new Error(`Failed to get pre-signed URL for ${name}`);
    }

    const fileData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binaryData = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

    console.log("33333")

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.mimeType },
      body: binaryData,
    });

    console.log('22222')

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${fileName}`);
    }

    const fileUrl = `${S3_BASE_URL}${fileName}`;
    return fileUrl;
  } catch (error) {
    console.error("Error while uploading file:", error);
    return null;
  }
};
