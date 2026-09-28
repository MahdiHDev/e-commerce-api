import { UploadApiOptions } from "cloudinary";

export interface UploadFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

export interface UploadOptions {
    folder?: string;
    publicId?: string;
    overwrite?: boolean;
    resourceType?: UploadApiOptions["resource_type"];
}
