import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import cloudinary from "../../app/config/cloudinary";
import { UploadFile, UploadOptions } from "./cloudinary.interface";

class CloudinaryService {
    async upload(
        file: UploadFile,
        options: UploadOptions = {},
    ): Promise<UploadApiResponse> {
        const uploadOptions: UploadApiOptions = {
            resource_type: options.resourceType ?? "image",
        };

        if (options.folder) {
            uploadOptions.folder = options.folder;
        }

        if (options.publicId) {
            uploadOptions.public_id = options.publicId;
        }

        if (options.overwrite !== undefined) {
            uploadOptions.overwrite = options.overwrite;
        }

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    if (!result) {
                        return reject(new Error("Cloudinary upload failed."));
                    }

                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(stream);
        });
    }

    async delete(publicId: string) {
        return cloudinary.uploader.destroy(publicId);
    }
}

export default new CloudinaryService();
