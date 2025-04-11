import * as FileSystem from "expo-file-system";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const S3_BASE_URL = "https://trekies.s3.ap-south-1.amazonaws.com/uploads/";

/**
 * Uploads multiple files to S3 and associates them with an entity
 * @param {Array} files - Array of file objects with uri, fileName, and mimeType properties
 * @param {number} id - ID of the entity to associate the files with
 * @param {string} type - Type of entity (e.g., "tour", "profile", "gallery")
 * @param {Object} options - Additional options for upload
 * @param {number} options.maxSizeMB - Maximum allowed size per file in MB
 * @param {number} options.maxRetries - Maximum number of upload retries per file
 * @returns {Promise<Array<string>>} Array of uploaded file URLs
 */

export const uploadFilesToS3 = async (
  files,
  id,
  type = "tour",
  options = {}
) => {
  // Validate required parameters
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("Files parameter must be a non-empty array");
  }

  if (!id) {
    throw new Error("Entity ID is required");
  }

  // Validate environment variables
  if (!BASE_URL) {
    throw new Error("BASE_URL environment variable is not defined");
  }

  // Default options
  const { maxSizeMB = 10, maxRetries = 3 } = options;

  try {
    console.log(
      `Starting batch upload of ${files.length} files for ${type} with ID ${id}`
    );

    const uploadPromises = files.map(async (file, index) => {
      // Validate file object
      if (!file || !file.uri || !file.mimeType) {
        throw new Error(`Invalid file data at index ${index}`);
      }

      // Check file size if possible
      try {
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        const fileSizeMB = fileInfo.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          throw new Error(
            `File "${file.fileName}" exceeds maximum allowed size (${maxSizeMB}MB)`
          );
        }
      } catch (sizeError) {
        console.warn(
          `Could not check size for file "${file.fileName}":`,
          sizeError.message
        );
      }

      // Generate safe filename
      const baseName = file.fileName || `file_${index}`;
      const extension = file.mimeType.split("/")[1] || "dat";
      const safeName = baseName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
      const fileName = `${type}_${safeName}_${Date.now()}.${extension}`;

      console.log(`Processing file ${index + 1}/${files.length}: ${fileName}`);

      // Get pre-signed URL with retry logic
      let presignedUrl;
      let attempts = 0;

      while (attempts < maxRetries) {
        try {
          const preSignedUrlResponse = await fetch(
            `${BASE_URL}/api/putObject`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName,
                contentType: file.mimeType,
              }),
            }
          );

          if (!preSignedUrlResponse.ok) {
            throw new Error(
              `Failed to get pre-signed URL: ${preSignedUrlResponse.status}`
            );
          }

          presignedUrl = await preSignedUrlResponse.json();
          break; // Success, exit retry loop
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            throw new Error(
              `Failed to get pre-signed URL after ${maxRetries} attempts: ${error.message}`
            );
          }
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      // Read file data
      const fileData = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert Base64 to binary data
      let binaryData;
      try {
        // For React Native/Expo environments
        if (typeof atob === "function") {
          const binary = atob(fileData);
          binaryData = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            binaryData[i] = binary.charCodeAt(i);
          }
        } else {
          // For Node.js environments
          binaryData = Buffer.from(fileData, "base64");
        }
      } catch (conversionError) {
        throw new Error(
          `Failed to convert file data: ${conversionError.message}`
        );
      }

      // Upload file with retry logic
      attempts = 0;
      while (attempts < maxRetries) {
        try {
          const uploadRes = await fetch(presignedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.mimeType,
              "Content-Length": binaryData.length.toString(),
            },
            body: binaryData,
          });

          if (!uploadRes.ok) {
            throw new Error(`Upload failed: ${uploadRes.status}`);
          }
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            throw new Error(
              `Failed to upload file after ${maxRetries} attempts: ${error.message}`
            );
          }
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
          );
        }
      }

      const fileUrl = `${S3_BASE_URL}${fileName}`;

      attempts = 0;
      while (attempts < maxRetries) {
        try {
          const associateResponse = await fetch(
            `${BASE_URL}/api/image/create-image`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id,
                url: fileUrl,
                type,
              }),
            }
          );

          if (!associateResponse.ok) {
            throw new Error(
              `Failed to associate image: ${associateResponse.status}`
            );
          }

          const result = await associateResponse.json();
          console.log(`File successfully associated with ${type}:`, result);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            throw new Error(
              `Failed to associate file after ${maxRetries} attempts: ${error.message}`
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }

      return fileUrl;
    });

    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${uploadedUrls.length} files`);
    return uploadedUrls;
  } catch (error) {
    console.error("Batch upload failed:", error.message);
    throw error;
  }
};

/**
 * Uploads a single file to S3
 * @param {Object} file - File object with uri, fileName/name, and mimeType properties
 * @param {Object} options - Additional options for the upload
 * @param {string} options.prefix - Optional prefix for the filename (default: "file")
 * @param {number} options.maxSizeMB - Maximum allowed size in MB (default: 10)
 * @param {number} options.maxRetries - Maximum number of upload retries
 * @returns {Promise<string>} The URL of the uploaded file
 */

export const uploadFileToS3 = async (file, options = {}) => {
  try {
    if (!BASE_URL) {
      throw new Error("BASE_URL environment variable is not defined");
    }

    if (!file || !file.uri) {
      throw new Error("Invalid file data provided");
    }

    const { prefix = "file", maxSizeMB = 10, maxRetries = 3 } = options;

    const mimeType = file.mimeType || "application/octet-stream";

    try {
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      const fileSizeMB = fileInfo.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(
          `File size exceeds maximum allowed size (${maxSizeMB}MB)`
        );
      }
    } catch (sizeError) {
      console.warn("Could not check file size:", sizeError.message);
    }

    const name = file.fileName || file.name || "file";
    const extension = mimeType.split("/")[1] || "dat";
    const safeName = name.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    const fileName = `${prefix}_${safeName}_${Date.now()}.${extension}`;

    console.log(`Uploading file: ${fileName}, MIME: ${mimeType}`);

    let presignedUrl;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const preSignedUrlResponse = await fetch(`${BASE_URL}/api/putObject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            contentType: mimeType,
          }),
        });

        if (!preSignedUrlResponse.ok) {
          throw new Error(
            `Failed to get pre-signed URL: ${preSignedUrlResponse.status}`
          );
        }

        presignedUrl = await preSignedUrlResponse.json();
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new Error(
            `Failed to get pre-signed URL after ${maxRetries} attempts`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    const fileData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    let binaryData;
    try {
      if (typeof atob === "function") {
        const binary = atob(fileData);
        binaryData = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          binaryData[i] = binary.charCodeAt(i);
        }
      } else {
        binaryData = Buffer.from(fileData, "base64");
      }
    } catch (conversionError) {
      throw new Error(
        `Failed to convert file data: ${conversionError.message}`
      );
    }

    attempts = 0;
    while (attempts < maxRetries) {
      try {
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": mimeType,
            "Content-Length": binaryData.length.toString(),
          },
          body: binaryData,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed: ${errorText}`);
        }

        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new Error(
            `Failed to upload file after ${maxRetries} attempts: ${error.message}`
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
        );
      }
    }

    const fileUrl = `${S3_BASE_URL}${fileName}`;
    console.log(`File uploaded successfully: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error("Upload error:", error.message);
    throw error;
  }
};

/**
 * Uploads a PDF file to S3 with specific handling for PDF documents
 * @param {Object} file - The PDF file object with uri, name properties
 * @param {Object} options - Additional options for the upload
 * @param {string} options.category - Document category (e.g., "invoice", "report")
 * @param {number} options.maxSizeMB - Maximum allowed size in MB (default: 10)
 * @returns {Promise<string>} The URL of the uploaded PDF
 */

export const uploadPdfToS3 = async (file, options = {}) => {
  try {
    // Validate environment variables
    if (!BASE_URL) {
      throw new Error("BASE_URL environment variable is not defined");
    }

    // Validate file input
    if (!file || !file.uri) {
      throw new Error("Invalid PDF file data provided");
    }

    // Set default options
    const { category = "document", maxSizeMB = 10 } = options;

    // Validate file type
    const mimeType = file.mimeType || "application/pdf";
    if (!mimeType.includes("pdf")) {
      throw new Error("File must be a PDF document");
    }

    // Check file size (if possible)
    try {
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      const fileSizeMB = fileInfo.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(
          `PDF file size exceeds maximum allowed size (${maxSizeMB}MB)`
        );
      }
    } catch (sizeError) {
      console.warn("Could not check file size:", sizeError.message);
    }

    // Generate safe filename
    const timestamp = Date.now();
    const baseName = file.fileName || file.name || "document";
    const safeName = baseName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    const fileName = `${category}_${safeName}_${timestamp}.pdf`;

    console.log(`Uploading PDF: ${fileName}`);

    // Get pre-signed URL
    const preSignedUrlResponse = await fetch(`${BASE_URL}/api/putObject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        contentType: mimeType,
      }),
    });

    if (!preSignedUrlResponse.ok) {
      const errorText = await preSignedUrlResponse.text();
      throw new Error(`Failed to get pre-signed URL: ${errorText}`);
    }

    const presignedUrl = await preSignedUrlResponse.json();

    // Read file data - consider using chunks for large files
    const fileData = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert Base64 to binary data - improved version
    let binaryData;
    try {
      // For React Native/Expo environments
      if (typeof atob === "function") {
        const binary = atob(fileData);
        binaryData = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          binaryData[i] = binary.charCodeAt(i);
        }
      } else {
        // For Node.js environments
        binaryData = Buffer.from(fileData, "base64");
      }
    } catch (conversionError) {
      throw new Error(`Failed to convert PDF data: ${conversionError.message}`);
    }

    // Upload with retry mechanism
    let uploadSuccess = false;
    let attempts = 0;
    const maxAttempts = 3;
    let uploadError;

    while (!uploadSuccess && attempts < maxAttempts) {
      attempts++;
      try {
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": mimeType,
            "Content-Length": binaryData.length.toString(),
          },
          body: binaryData,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed (attempt ${attempts}): ${errorText}`);
        }

        uploadSuccess = true;
      } catch (error) {
        uploadError = error;
        if (attempts < maxAttempts) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          console.log(
            `Retrying upload, attempt ${attempts + 1} of ${maxAttempts}`
          );
        }
      }
    }

    if (!uploadSuccess) {
      throw (
        uploadError || new Error("Failed to upload PDF after multiple attempts")
      );
    }

    const fileUrl = `${S3_BASE_URL}${fileName}`;

    // Log success and return the URL
    console.log(`PDF uploaded successfully: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error("PDF upload error:", error.message);
    throw error;
  }
};
