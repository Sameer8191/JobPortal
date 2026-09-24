import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.upload.js";

//get User profile

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.find({_id: req.user.id}).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//update User profile

export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    //to upload resume file

    if (req.file && req.user.role === "user") {
      const originalName = req.file.originalname;
      const extension = originalName.split(".").pop().toLowerCase();

      // Sanitized filename but keep the extension for raw files
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
      const sanitizedBase = nameWithoutExt
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9\-_]/g, "");
      const sanitizedFileName = `${sanitizedBase}.${extension}`;

      // Determine resource type: images should be 'image', docs/pdfs often safer as 'raw' for delivery
      const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
      const resourceType = isImage ? "image" : "raw";

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "jobportal/resumes",
        resourceType,
        sanitizedFileName,
      );

      if (uploadResult) {
        updateData.resume = uploadResult.secure_url;
        updateData.resumePublicId = uploadResult.public_id;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      returnDocument: "after",
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

//helper function to extract public ID from Cloudinary URL

const getPublicIdFromUrl = (url, resourceType) => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const pathAfterVersion = parts.slice(uploadIndex + 2).join("/");
    if (resourceType === "raw") return pathAferVersion;

    return (
      pathAfterVersion.substring(0, pathAfterVersion.lastIndexOf(".")) ||
      pathAfterVersion
    );
  } catch (e) {
    return null;
  }
};

// to get user resume

export const getResume = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    const resourceType = user.resume.includes("/raw/") ? "image" : "raw";
    const publicId =
      user.resumePublicId || getPublicIdFromUrl(user.resume, resourceType);
    if (!publicId) {
      return res.status(404).json({
        success: false,
        message: "Invalid Resume Reference",
      });
    }
    if (resourceType === "raw") {
      const filname = publicId.split("/").pop() || "resume.pdf";
      const format = filname.includes(".")
        ? filname.split(".").pop().toLowerCase()
        : "pdf";

      const signedUrl = cloudinary.url(publicId, {
        resource_type: "image",
        type: "upload",
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 300,
      });

      return res.redirect(signedUrl);
    }

    // for images

    const signedUrl = cloudinary.url(publicId, {
      resource_type: "image",
      type: "upload",
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300,
    });

    return res.redirect(signedUrl);
  } catch (err) {
    console.error("Resume access error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Error accessing resume",
    });
  }
};
