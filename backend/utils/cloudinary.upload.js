import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (
  filePath,
  folderName,
  resourceType = "auto",
  publicId = null,
) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: folderName,
      resource_type: resourceType,
      type: "upload",
      access_mode: "public",
      use_filename: true,
      unique_filename: true,
    };
    if (publicId) {
      if (resourceType === "image") {
        options.public_id = publicId;
      } else {
        options.public_id = publicId.includes(".")
          ? publicId.split(".").slice(0, -1).join(".")
          : publicId;
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.log("Cloudinary Upload Error:", error);
          return reject(error);
        }
      },
    );
    console.log("Cloudinary Upload result:", result);
    resolve({
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
    uploadStream.end(fileBuffer);
  });
};
