import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("file uploaded successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary files as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryId) => {
  try {
    console.log("cloudinary id: " + cloudinaryId);
    const response = await cloudinary.uploader.destroy(cloudinaryId);
    console.log("delete from cloudinary", response);
    return response;
  } catch (error) {
    console.log("error while deleting cloudinary image", error);
  }
};

const deleteVideoFromCloudinary = async (cloudinaryId) => {
  try {
    console.log("cloudinary id: " + cloudinaryId);
    const response = await cloudinary.api.delete_resources([cloudinaryId], {
      resource_type: "video",
    });
    console.log("delete from Cloudinary", response);
    return response;
  } catch (error) {
    console.log("Error while deleting Cloudinary video", error);
    throw error; // Rethrow the error to handle it in the calling function if needed
  }
};

export { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
