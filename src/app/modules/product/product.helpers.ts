// Drop-in replacement for your old createProduct.
// Adjust these imports to your project (names/paths are guesses based on your old code).

import AppError from "../../errorHelpers/AppError";
import { CreateProductPayload } from "./playgound.validation";

// In CreateProductPayload, delete `imageGroup` from the variant type.

/* ------------------------------------------------------------------ */
/* Helpers (put above createProduct)                                  */
/* ------------------------------------------------------------------ */

type Attrs = Record<string, string>;

// files for one value of the image attribute are sent as: variantImages_<value>
// e.g. variantImages_Black, variantImages_Teal
export const VARIANT_IMAGE_PREFIX = "variantImages_";

const cleanAttrs = (attrs: Attrs): Attrs =>
    Object.fromEntries(
        Object.entries(attrs ?? {}).map(([k, v]) => [
            k.trim(),
            String(v).trim(),
        ]),
    );

const attrKeys = (attrs: Attrs) => Object.keys(attrs).sort().join("|");

const comboKey = (attrs: Attrs) =>
    Object.keys(attrs)
        .sort()
        .map((k) => `${k}=${attrs[k]}`)
        .join("|");

// same attribute names on every variant, no duplicate combinations, no duplicate SKUs
export const prepareVariants = (variants: CreateProductPayload["variants"]) => {
    if (!variants?.length) {
        throw new AppError(400, "At least one variant is required.");
    }

    const cleaned = variants.map((v) => ({
        ...v,
        sku: v.sku.trim(),
        attributes: cleanAttrs(v.attributes),
    }));

    if (new Set(cleaned.map((v) => v.sku)).size !== cleaned.length) {
        throw new AppError(409, "Duplicate SKU found in product variants.");
    }

    const keys = attrKeys(cleaned[0]!.attributes);
    const seen = new Set<string>();

    for (const v of cleaned) {
        if (attrKeys(v.attributes) !== keys) {
            throw new AppError(
                400,
                `Variant "${v.sku}" must use the same attributes as the other variants.`,
            );
        }

        const combo = comboKey(v.attributes);
        if (seen.has(combo)) {
            throw new AppError(
                409,
                `Duplicate variant combination${combo ? `: ${combo}` : ""}.`,
            );
        }
        seen.add(combo);
    }

    return cleaned;
};

// Works out WHICH attribute the images belong to, from the uploaded group names.
// Groups [Black, Teal] + variants with Color{Black,Teal} and Size{M,L,XL}
// -> only Color has exactly those values, so images belong to Color.
export const resolveImageAttribute = (
    variantAttrs: Attrs[],
    groupNames: string[],
) => {
    if (groupNames.length === 0) return null; // no grouped images: everything is shared

    const valuesByAttribute = new Map<string, Set<string>>();
    for (const attrs of variantAttrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (!valuesByAttribute.has(key))
                valuesByAttribute.set(key, new Set());
            valuesByAttribute.get(key)!.add(value);
        }
    }

    const groups = new Set(groupNames);
    const matches = [...valuesByAttribute]
        .filter(
            ([, values]) =>
                values.size === groups.size &&
                [...values].every((v) => groups.has(v)),
        )
        .map(([key]) => key);

    if (matches.length === 1) return matches[0];

    if (matches.length > 1) {
        throw new AppError(
            400,
            `Image groups match more than one attribute (${matches.join(", ")}), so the images are ambiguous.`,
        );
    }

    const available = [...valuesByAttribute]
        .map(([key, values]) => `${key}: ${[...values].join(", ")}`)
        .join(" | ");

    throw new AppError(
        400,
        `Variant images must be uploaded for every value of exactly one attribute. ` +
            `Got: ${groupNames.join(", ")}. Available: ${available || "none"}.`,
    );
};
