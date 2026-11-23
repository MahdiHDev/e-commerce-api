
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";

// --------------------------------------------------
// Constants and types
// --------------------------------------------------

export const UPLOAD_CONCURRENCY = 5;

export const OPTION_IMAGE_PREFIX = "optionImages:";

export type ProductOptionInput = {
  name: string;
  values: string[];
};

export type VariantInput = {
  sku: string;
  price: number;
  compareAtPrice?: number | null | undefined;
  stockQuantity: number;
  position?: number;
  attributes?: Record<string, unknown>;
  optionValues: Record<string, string>;
};

export type UploadJob = {
  file: UploadFile;
  folder: string;
  optionName: string | null;
  optionValue: string | null;
};

export type ImageRow = {
  url: string;
  urlName: string;
  publicId: string;
  type: string;
  position: number;
  groupValue: string | null;
  optionValueId: string | null;
};

export type GroupedImageFiles = {
  optionName: string;
  optionValue: string;
  files: UploadFile[];
};

// --------------------------------------------------
// Image field name helper
// --------------------------------------------------

export const encodeImageField = (
  optionName: string,
  optionValue: string,
) => {
  return (
    OPTION_IMAGE_PREFIX +
    encodeURIComponent(optionName) +
    ":" +
    encodeURIComponent(optionValue)
  );
};

// --------------------------------------------------
// Prepare and validate product options
// --------------------------------------------------

export const prepareOptions = (options: ProductOptionInput[]) => {
  if (!Array.isArray(options)) {
    throw new AppError(400, "Product options must be an array.");
  }

  const seenNames = new Set<string>();

  return options.map((option) => {
    const name = option.name?.trim();

    if (!name) {
      throw new AppError(400, "Option name cannot be empty.");
    }

    const normalizedName = name.toLowerCase();

    if (seenNames.has(normalizedName)) {
      throw new AppError(409, `Duplicate option name: ${name}.`);
    }

    seenNames.add(normalizedName);

    if (!Array.isArray(option.values) || option.values.length === 0) {
      throw new AppError(
        400,
        `Option "${name}" must have at least one value.`,
      );
    }

    const seenValues = new Set<string>();

    const values = option.values.map((value) => {
      const cleanedValue = value?.trim();

      if (!cleanedValue) {
        throw new AppError(
          400,
          `Option "${name}" contains an empty value.`,
        );
      }

      const normalizedValue = cleanedValue.toLowerCase();

      if (seenValues.has(normalizedValue)) {
        throw new AppError(
          409,
          `Duplicate value "${cleanedValue}" in option "${name}".`,
        );
      }

      seenValues.add(normalizedValue);

      return cleanedValue;
    });

    return { name, values };
  });
};

// --------------------------------------------------
// Prepare and validate submitted variants
// Frontend generates combinations.
// Backend validates them.
// --------------------------------------------------

export const prepareVariants = (
  variants: VariantInput[],
  options: ProductOptionInput[],
) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new AppError(400, "At least one variant is required.");
  }

  const optionNames = options.map((option) => option.name);

  const expectedOptionNames = new Set(
    optionNames.map((name) => name.toLowerCase()),
  );

  const seenSkus = new Set<string>();
  const seenCombinations = new Set<string>();

  return variants.map((variant) => {
    const sku = variant.sku?.trim();

    if (!sku) {
      throw new AppError(400, "Variant SKU cannot be empty.");
    }

    const normalizedSku = sku.toLowerCase();

    if (seenSkus.has(normalizedSku)) {
      throw new AppError(409, `Duplicate SKU: ${sku}.`);
    }

    seenSkus.add(normalizedSku);

    if (!Number.isFinite(variant.price) || variant.price < 0) {
      throw new AppError(
        400,
        `Invalid price for variant "${sku}".`,
      );
    }

    if (
      variant.compareAtPrice != null &&
      (!Number.isFinite(variant.compareAtPrice) ||
        variant.compareAtPrice < variant.price)
    ) {
      throw new AppError(
        400,
        `Compare-at price must be greater than or equal to price for "${sku}".`,
      );
    }

    if (
      !Number.isInteger(variant.stockQuantity) ||
      variant.stockQuantity < 0
    ) {
      throw new AppError(
        400,
        `Invalid stock quantity for variant "${sku}".`,
      );
    }

    const submittedValues = variant.optionValues ?? {};

    const submittedNames = Object.keys(submittedValues);

    // Every variant must have exactly the same option names.
    if (
      submittedNames.length !== expectedOptionNames.size ||
      submittedNames.some(
        (name) => !expectedOptionNames.has(name.toLowerCase()),
      )
    ) {
      throw new AppError(
        400,
        `Variant "${sku}" must contain exactly the product's options.`,
      );
    }

    const normalizedOptionValues: Record<string, string> = {};

    for (const option of options) {
      const submittedKey = submittedNames.find(
        (name) => name.toLowerCase() === option.name.toLowerCase(),
      );

      if (!submittedKey) {
        throw new AppError(
          400,
          `Variant "${sku}" is missing option "${option.name}".`,
        );
      }

      const selectedValue = submittedValues[submittedKey]?.trim();

      if (!selectedValue) {
        throw new AppError(
          400,
          `Variant "${sku}" has an empty value for "${option.name}".`,
        );
      }

      const validValue = option.values.find(
        (value) => value.toLowerCase() === selectedValue.toLowerCase(),
      );

      if (!validValue) {
        throw new AppError(
          400,
          `"${selectedValue}" is not a valid value for "${option.name}".`,
        );
      }

      normalizedOptionValues[option.name] = validValue;
    }

    // Stable combination key based on option names and values.
    const combinationKey = options
      .map((option) => {
        const value = normalizedOptionValues[option.name];

        return `${option.name.toLowerCase()}=${value?.toLowerCase()}`;
      })
      .sort()
      .join("|");

    if (seenCombinations.has(combinationKey)) {
      throw new AppError(
        409,
        `Duplicate variant combination for SKU "${sku}".`,
      );
    }

    seenCombinations.add(combinationKey);

    return {
      ...variant,
      sku,
      optionValues: normalizedOptionValues,
      attributes: variant.attributes ?? {},
    };
  });
};

// --------------------------------------------------
// Split uploaded files by multipart field name
// --------------------------------------------------

export const splitImageFiles = (
  files: Record<string, UploadFile[]>,
) => {
  const generalFiles = files.productImages ?? [];

  const groupedFiles: GroupedImageFiles[] = [];

  for (const [field, fileList] of Object.entries(files)) {
    if (!field.startsWith(OPTION_IMAGE_PREFIX)) continue;
    if (!fileList.length) continue;

    const encodedGroup = field.slice(OPTION_IMAGE_PREFIX.length);
    const separatorIndex = encodedGroup.indexOf(":");

    if (separatorIndex === -1) {
      throw new AppError(400, `Invalid image field: ${field}.`);
    }

    let optionName: string;
    let optionValue: string;

    try {
      optionName = decodeURIComponent(
        encodedGroup.slice(0, separatorIndex),
      );

      optionValue = decodeURIComponent(
        encodedGroup.slice(separatorIndex + 1),
      );
    } catch {
      throw new AppError(400, `Invalid image field encoding: ${field}.`);
    }

    if (!optionName.trim() || !optionValue.trim()) {
      throw new AppError(400, `Invalid image field: ${field}.`);
    }

    groupedFiles.push({
      optionName: optionName.trim(),
      optionValue: optionValue.trim(),
      files: fileList,
    });
  }

  return {
    generalFiles,
    groupedFiles,
  };
};

// --------------------------------------------------
// Validate image groups against product options
//
// Product.imageAttribute stores one option name.
// Therefore, all grouped images must use the same
// option, for example Color.
// --------------------------------------------------

export const validateImageGroups = (
  groupedFiles: GroupedImageFiles[],
  options: ProductOptionInput[],
) => {
  if (groupedFiles.length === 0) {
    return null;
  }

  const firstOptionName = groupedFiles[0]?.optionName;

  const matchingOption = options.find(
    (option) =>
      option.name.toLowerCase() === firstOptionName?.toLowerCase(),
  );

  if (!matchingOption) {
    throw new AppError(
      400,
      `Unknown image option "${firstOptionName}".`,
    );
  }

  const seenGroups = new Set<string>();

  for (const group of groupedFiles) {
    if (group.optionName.toLowerCase() !== firstOptionName?.toLowerCase()) {
      throw new AppError(
        400,
        "All grouped images must use the same product option.",
      );
    }

    const validValue = matchingOption.values.find(
      (value) => value.toLowerCase() === group.optionValue.toLowerCase(),
    );

    if (!validValue) {
      throw new AppError(
        400,
        `"${group.optionValue}" is not a valid value for "${matchingOption.name}".`,
      );
    }

    const groupKey = validValue.toLowerCase();

    if (seenGroups.has(groupKey)) {
      throw new AppError(
        409,
        `Duplicate image group for "${validValue}".`,
      );
    }

    seenGroups.add(groupKey);

    // Normalize the value to match the actual option value.
    group.optionName = matchingOption.name;
    group.optionValue = validValue;
  }

  return matchingOption.name;
};

// --------------------------------------------------
// Create upload jobs
// --------------------------------------------------

export const buildUploadJobs = (
  generalFiles: UploadFile[],
  groupedFiles: GroupedImageFiles[],
  folder: string,
): UploadJob[] => {
  const jobs: UploadJob[] = [];

  for (const file of generalFiles) {
    jobs.push({
      file,
      folder,
      optionName: null,
      optionValue: null,
    });
  }

  for (const group of groupedFiles) {
    for (const file of group.files) {
      jobs.push({
        file,
        folder,
        optionName: group.optionName,
        optionValue: group.optionValue,
      });
    }
  }

  return jobs;
};

// --------------------------------------------------
// Upload images with limited concurrency
// --------------------------------------------------

export const uploadImageJobs = async (
  jobs: UploadJob[],
  startPosition: number,
  uploadedPublicIds: string[],
): Promise<ImageRow[]> => {
  const rows: ImageRow[] = [];

  for (
    let start = 0;
    start < jobs.length;
    start += UPLOAD_CONCURRENCY
  ) {
    const batch = jobs.slice(start, start + UPLOAD_CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async (job, index): Promise<ImageRow> => {
        if (!job.file.mimetype) {
          throw new AppError(400, "Image MIME type is missing.");
        }

        const uploaded = await CloudinaryService.upload(job.file, {
          folder: job.folder,
        });

        if (!uploaded.public_id) {
          throw new AppError(
            500,
            "Uploaded image public ID is missing.",
          );
        }

        // Track immediately so the caller can roll back on failure.
        uploadedPublicIds.push(uploaded.public_id);

        return {
          url: uploaded.secure_url,
          urlName: job.file.originalname,
          publicId: uploaded.public_id,
          type: job.file.mimetype,
          position: startPosition + start + index,
          groupValue: job.optionValue,
          // Resolved after OptionValue records are created.
          optionValueId: null,
        };
      }),
    );

    const failed = results.find(
      (result) => result.status === "rejected",
    );

    if (failed?.status === "rejected") {
      throw failed.reason;
    }

    for (const result of results) {
      if (result.status === "fulfilled") {
        rows.push(result.value);
      }
    }
  }

  return rows;
};

// --------------------------------------------------
// Roll back successful Cloudinary uploads
// --------------------------------------------------

// export const rollbackCloudinaryUploads = async (
//   publicIds: string[],
// ) => {
//   await Promise.allSettled(
//     publicIds.map((publicId) =>
//       CloudinaryService.deleteFile(publicId),
//     ),
//   );
// };
