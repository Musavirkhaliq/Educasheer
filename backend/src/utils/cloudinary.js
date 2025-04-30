import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SERCRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type: "auto"
            })
        console.log("File Uploaded", response.url)
        return response
    } catch (error) {
        console.log("Error while uploading the file", error)
        fs.unlinkSync(localFilePath) // Remove the file from the local storage
        return null;
    }
}

const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
    try {
        if (!publicId) {
            console.log("No public ID provided for deletion");
            return null;
        }

        console.log(`Attempting to delete file from Cloudinary: ${publicId} (resource type: ${resourceType})`);

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        if (response.result === "ok") {
            console.log(`File successfully deleted from Cloudinary: ${publicId}`);
        } else {
            console.log(`Cloudinary returned non-ok response for ${publicId}:`, response);
        }

        return response;
    } catch (error) {
        console.error(`Error while deleting file from Cloudinary (publicId: ${publicId}, resourceType: ${resourceType}):`, error);
        // Return the error for better debugging
        return {
            success: false,
            error: error.message || "Unknown error occurred during file deletion"
        };
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }
