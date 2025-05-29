import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_COLUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadonCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
    resource_type: "auto",
  });
  fs.unlinkSync(localFilePath); //remove the locally saved temp file
  console.log("uploadResult====>",uploadResult);
  
  return uploadResult;
  } 
  catch(error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temp file
    console.log("error while uploading file on cloudinary ", error);
    return null
  }
  
};

const deleteImageFromCloudinary=async(filePath)=>{
  console.log("file path=> ",filePath);
  
await cloudinary.uploader.destroy(filePath)
};

export { uploadonCloudinary,deleteImageFromCloudinary};
