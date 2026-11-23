
export interface ProductImageData {
  url: string;
  urlName: string;
  publicId: string;
  type: string;
  position: number;

  optionValueId?: string | null;
  groupValue?: string | null;
}

export interface ProductImageInput {
  url: string;
  urlName: string;
  publicId: string;
  type: string;
  position?: number;

  // Used during product creation
  optionName?: string;
  optionValue?: string;

  groupValue?: string | null;
}

export interface ProductOptionData {
  id: string;
  name: string;
  values: OptionValueData[];
}

export interface OptionValueData {
  id: string;
  optionId: string;
  value: string;
}

export interface ProductVariantData {
  id: string;
  productId: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  attributes: Record<string, string>;
  position: number;
  optionValues: OptionValueData[];
}

export interface ProductVariantInput {
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number;
  attributes?: Record<string, string>;
  position?: number;
  optionValues: Record<string, string>;
}

export interface ProductOptionInput {
  name: string;
  values: string[];
}
