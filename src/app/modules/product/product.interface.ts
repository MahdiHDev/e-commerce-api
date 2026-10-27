import { CreateProductPayload } from "./product.validation";

type UploadedColorImage = {
    url: string;
    publicId: string;
    imageName: string;
    imageType: string;
    position: number;
    isPrimary: boolean;
};

export type ColorWithImages = CreateProductPayload["colors"][number] & {
    images: UploadedColorImage[];
};
