import axios from "axios";
import * as FileSystem from "expo-file-system";

export const uploadFilesToS3 = async (files, id = 12, type) => {
  try {
    for (const file of files) {
      const fileName = file.fileName + Date.now();

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/putObject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileName, contentType: file?.mimeType }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to get the pre-signed URL for " + file.fileName
        ); 
      }

      const result = await response.json();
      const presignedUrl = result;

      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryData = Uint8Array.from(atob(fileData), (c) =>
        c.charCodeAt(0)
      );

      const uploadResponse = await axios.put(presignedUrl, binaryData, {
        headers: {
          "Content-Type": file?.mimeType,
        },
      });

      if (uploadResponse.status === 200) {
        const newImage = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/image/create-image`,
          {
            id,
            url:
              "https://s3.ap-south-1.amazonaws.com/sanathana.sarthi/uploads/" +
              fileName,
            type,
          }
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error while uploading files", error);
    return false;
  }
};

export const uploadFileToS3 = async (file) => {
  try {
    const fileName = file.fileName + Date.now();

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/putObject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName, contentType: file?.mimeType }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get the pre-signed URL for " + file.fileName);
    }

    const result = await response.json();
    const presignedUrl = result;

    const fileData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binaryData = Uint8Array.from(atob(fileData), (c) => c.charCodeAt(0));

    const uploadResponse = await axios.put(presignedUrl, binaryData, {
      headers: {
        "Content-Type": file?.mimeType,
      },
    });

    if (uploadResponse.status === 200) {
      const url =
        "https://s3.ap-south-1.amazonaws.com/sanathana.sarthi/uploads/" +
        fileName;
      return url;
    }
  } catch (error) {
    console.error("Error while uploading file", error);
  }
};
