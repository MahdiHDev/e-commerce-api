import { randomUUID } from "node:crypto";

export const generateVariantSku = (
    productCode: string,
    colorName: string,
    sizeName: string,
    variantId: string,
): string => {
    const colorCode = colorName
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4);

    const sizeCode = sizeName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    return `${productCode}-${colorCode}-${sizeCode}-${variantId.replace(/-/g, "")}`;
};

// Example:
const variantId = randomUUID();

const sku = generateVariantSku(
    "IDNB-A7C92F4B10",
    "Bottle Green",
    "XL",
    variantId,
);
