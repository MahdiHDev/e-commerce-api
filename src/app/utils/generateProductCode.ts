import { randomBytes } from "node:crypto";

export const generateProductCode = (name: string): string => {
    const prefix =
        name
            .trim()
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .replace(/[^a-zA-Z0-9]/g, "")
            .toUpperCase()
            .slice(0, 5) || "PRD";

    const uniqueCode = randomBytes(5).toString("hex").toUpperCase();

    return `${prefix}-${uniqueCode}`;
};
