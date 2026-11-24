var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path3 from "path";
import qs from "qs";

// src/app/middleware/globalErrorHandler.ts
import status4 from "http-status";
import z from "zod";

// src/generated/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  ADMIN\n  USER\n  MODERATOR\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BANNED\n}\n\nenum ProductStatus {\n  DRAFT\n  ACTIVE\n  ARCHIVED\n}\n\nenum OrderStatus {\n  PENDING\n  CONFIRMED\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n  REFUNDED\n}\n\nenum PaymentMethod {\n  CASH_ON_DELIVERY\n  CARD\n  MOBILE_BANKING\n  BANK_TRANSFER\n}\n\nenum PaymentStatus {\n  PENDING\n  PROCESSING\n  PAID\n  FAILED\n  REFUNDED\n  CANCELLED\n}\n\n// Tables\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  emailVerified      Boolean    @default(false)\n  image              String?\n  role               UserRole   @default(USER)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  sessions           Session[]\n  accounts           Account[]\n  address            Address?\n  cart               Cart?\n  orders             Order[]\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Address {\n  id        String    @id @default(uuid())\n  userId    String    @unique\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  fullName  String\n  phone     String\n  address1  String\n  address2  String?\n  city      String\n  upozila   String\n  district  String\n  country   String    @default("Bangladesh")\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Category {\n  id   String @id @default(uuid())\n  name String\n  slug String @unique\n\n  parentId String?\n  parent   Category?  @relation("CategoryChildren", fields: [parentId], references: [id])\n  children Category[] @relation("CategoryChildren")\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  products Product[]\n\n  @@index([parentId])\n}\n\nmodel Product {\n  id          String  @id @default(uuid())\n  name        String\n  slug        String  @unique\n  description String?\n\n  categoryId String\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  brandId String?\n  brand   Brand?  @relation(fields: [brandId], references: [id])\n\n  status         ProductStatus @default(DRAFT)\n  imageAttribute String? // set automatically by createProduct\n\n  variants    ProductVariant[]\n  images      ProductImage[]\n  collections ProductCollection[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt      DateTime        @default(now())\n  updatedAt      DateTime        @updatedAt\n  deletedAt      DateTime?\n  productOptions ProductOption[]\n\n  @@index([categoryId])\n  @@index([brandId])\n  @@index([status])\n}\n\nmodel ProductVariant {\n  id String @id @default(uuid())\n\n  productId String\n  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n\n  sku String @unique\n\n  price          Decimal  @db.Decimal(10, 2)\n  compareAtPrice Decimal? @db.Decimal(10, 2)\n\n  stockQuantity Int @default(0)\n\n  attributes Json @default("{}")\n  position   Int  @default(0)\n\n  cartItems    CartItem[]\n  orderItems   OrderItem[]\n  optionValues VariantOptionValue[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([productId])\n}\n\nmodel ProductOption {\n  id        String        @id @default(uuid())\n  name      String\n  productId String\n  product   Product       @relation(fields: [productId], references: [id])\n  values    OptionValue[]\n\n  @@unique([productId, name])\n}\n\nmodel OptionValue {\n  id       String @id @default(cuid())\n  optionId String\n  value    String\n\n  option   ProductOption        @relation(fields: [optionId], references: [id])\n  variants VariantOptionValue[]\n  images   ProductImage[]\n\n  @@unique([optionId, value])\n}\n\nmodel VariantOptionValue {\n  variantId     String\n  optionValueId String\n\n  variant     ProductVariant @relation(fields: [variantId], references: [id])\n  optionValue OptionValue    @relation(fields: [optionValueId], references: [id])\n\n  @@id([variantId, optionValueId])\n}\n\nmodel ProductImage {\n  id String @id @default(uuid())\n\n  productId     String\n  product       Product      @relation(fields: [productId], references: [id], onDelete: Cascade)\n  optionValueId String?\n  optionValue   OptionValue? @relation(fields: [optionValueId], references: [id])\n\n  url      String\n  urlName  String\n  publicId String\n  type     String\n\n  position   Int     @default(0)\n  groupValue String?\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([productId])\n}\n\nmodel Brand {\n  id          String  @id @default(uuid())\n  name        String\n  slug        String  @unique\n  description String?\n\n  logoUrl         String?\n  logoUrlPublicId String?\n  logoUrlName     String?\n  logoUrlType     String?\n\n  products Product[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Cart {\n  id String @id @default(uuid())\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  items CartItem[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel CartItem {\n  id String @id @default(uuid())\n\n  cartId String\n  cart   Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)\n\n  variantId String\n  variant   ProductVariant @relation(fields: [variantId], references: [id])\n\n  quantity Int @default(1)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@unique([cartId, variantId])\n  @@index([variantId])\n}\n\nmodel Order {\n  id String @id @default(uuid())\n\n  orderNumber String @unique\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id])\n\n  status OrderStatus @default(PENDING)\n\n  subtotal      Decimal @db.Decimal(10, 2)\n  discountTotal Decimal @default(0) @db.Decimal(10, 2)\n  shippingFee   Decimal @default(0) @db.Decimal(10, 2)\n  tax           Decimal @default(0) @db.Decimal(10, 2)\n  grandTotal    Decimal @db.Decimal(10, 2)\n\n  // Shipping address snapshot\n  shippingName       String\n  shippingPhone      String\n  shippingAddress    String\n  shippingCity       String\n  shippingPostalCode String?\n  shippingCountry    String  @default("Bangladesh")\n\n  items    OrderItem[]\n  payments Payment[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([userId])\n  @@index([status])\n}\n\nmodel OrderItem {\n  id String @id @default(uuid())\n\n  orderId String\n  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  variantId String\n  variant   ProductVariant @relation(fields: [variantId], references: [id])\n\n  productName String\n  sku         String\n\n  unitPrice Decimal @db.Decimal(10, 2)\n  quantity  Int\n\n  totalPrice Decimal @db.Decimal(10, 2)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([orderId])\n  @@index([variantId])\n}\n\nmodel Payment {\n  id String @id @default(uuid())\n\n  orderId String\n  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  method   PaymentMethod\n  provider String?\n\n  transactionId String? @unique\n\n  amount Decimal @db.Decimal(10, 2)\n\n  status PaymentStatus @default(PENDING)\n\n  paidAt DateTime?\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([orderId])\n  @@index([status])\n}\n\nmodel Collection {\n  id          String  @id @default(uuid())\n  name        String\n  slug        String  @unique\n  description String?\n  imageUrl    String?\n  isActive    Boolean @default(true)\n\n  products ProductCollection[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel ProductCollection {\n  productId    String\n  collectionId String\n\n  product    Product    @relation(fields: [productId], references: [id], onDelete: Cascade)\n  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@id([productId, collectionId])\n  @@index([collectionId])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToUser"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AddressToUser"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address1","kind":"scalar","type":"String"},{"name":"address2","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"upozila","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Category","relationName":"CategoryChildren"},{"name":"children","kind":"object","type":"Category","relationName":"CategoryChildren"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"products","kind":"object","type":"Product","relationName":"CategoryToProduct"}],"dbName":null},"Product":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToProduct"},{"name":"brandId","kind":"scalar","type":"String"},{"name":"brand","kind":"object","type":"Brand","relationName":"BrandToProduct"},{"name":"status","kind":"enum","type":"ProductStatus"},{"name":"imageAttribute","kind":"scalar","type":"String"},{"name":"variants","kind":"object","type":"ProductVariant","relationName":"ProductToProductVariant"},{"name":"images","kind":"object","type":"ProductImage","relationName":"ProductToProductImage"},{"name":"collections","kind":"object","type":"ProductCollection","relationName":"ProductToProductCollection"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"productOptions","kind":"object","type":"ProductOption","relationName":"ProductToProductOption"}],"dbName":null},"ProductVariant":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductVariant"},{"name":"sku","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"compareAtPrice","kind":"scalar","type":"Decimal"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"attributes","kind":"scalar","type":"Json"},{"name":"position","kind":"scalar","type":"Int"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToProductVariant"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToProductVariant"},{"name":"optionValues","kind":"object","type":"VariantOptionValue","relationName":"ProductVariantToVariantOptionValue"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ProductOption":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductOption"},{"name":"values","kind":"object","type":"OptionValue","relationName":"OptionValueToProductOption"}],"dbName":null},"OptionValue":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"optionId","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"option","kind":"object","type":"ProductOption","relationName":"OptionValueToProductOption"},{"name":"variants","kind":"object","type":"VariantOptionValue","relationName":"OptionValueToVariantOptionValue"},{"name":"images","kind":"object","type":"ProductImage","relationName":"OptionValueToProductImage"}],"dbName":null},"VariantOptionValue":{"fields":[{"name":"variantId","kind":"scalar","type":"String"},{"name":"optionValueId","kind":"scalar","type":"String"},{"name":"variant","kind":"object","type":"ProductVariant","relationName":"ProductVariantToVariantOptionValue"},{"name":"optionValue","kind":"object","type":"OptionValue","relationName":"OptionValueToVariantOptionValue"}],"dbName":null},"ProductImage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductImage"},{"name":"optionValueId","kind":"scalar","type":"String"},{"name":"optionValue","kind":"object","type":"OptionValue","relationName":"OptionValueToProductImage"},{"name":"url","kind":"scalar","type":"String"},{"name":"urlName","kind":"scalar","type":"String"},{"name":"publicId","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"position","kind":"scalar","type":"Int"},{"name":"groupValue","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Brand":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"logoUrlPublicId","kind":"scalar","type":"String"},{"name":"logoUrlName","kind":"scalar","type":"String"},{"name":"logoUrlType","kind":"scalar","type":"String"},{"name":"products","kind":"object","type":"Product","relationName":"BrandToProduct"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"items","kind":"object","type":"CartItem","relationName":"CartToCartItem"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cartId","kind":"scalar","type":"String"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToCartItem"},{"name":"variantId","kind":"scalar","type":"String"},{"name":"variant","kind":"object","type":"ProductVariant","relationName":"CartItemToProductVariant"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"subtotal","kind":"scalar","type":"Decimal"},{"name":"discountTotal","kind":"scalar","type":"Decimal"},{"name":"shippingFee","kind":"scalar","type":"Decimal"},{"name":"tax","kind":"scalar","type":"Decimal"},{"name":"grandTotal","kind":"scalar","type":"Decimal"},{"name":"shippingName","kind":"scalar","type":"String"},{"name":"shippingPhone","kind":"scalar","type":"String"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"shippingCity","kind":"scalar","type":"String"},{"name":"shippingPostalCode","kind":"scalar","type":"String"},{"name":"shippingCountry","kind":"scalar","type":"String"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"payments","kind":"object","type":"Payment","relationName":"OrderToPayment"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"variantId","kind":"scalar","type":"String"},{"name":"variant","kind":"object","type":"ProductVariant","relationName":"OrderItemToProductVariant"},{"name":"productName","kind":"scalar","type":"String"},{"name":"sku","kind":"scalar","type":"String"},{"name":"unitPrice","kind":"scalar","type":"Decimal"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"totalPrice","kind":"scalar","type":"Decimal"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToPayment"},{"name":"method","kind":"enum","type":"PaymentMethod"},{"name":"provider","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Collection":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"products","kind":"object","type":"ProductCollection","relationName":"CollectionToProductCollection"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ProductCollection":{"fields":[{"name":"productId","kind":"scalar","type":"String"},{"name":"collectionId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductCollection"},{"name":"collection","kind":"object","type":"Collection","relationName":"CollectionToProductCollection"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","address","cart","parent","children","products","_count","category","brand","variants","product","values","option","variant","optionValue","images","collection","collections","productOptions","cartItems","items","order","payments","orderItems","optionValues","orders","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Product.findUnique","Product.findUniqueOrThrow","Product.findFirst","Product.findFirstOrThrow","Product.findMany","Product.createOne","Product.createMany","Product.createManyAndReturn","Product.updateOne","Product.updateMany","Product.updateManyAndReturn","Product.upsertOne","Product.deleteOne","Product.deleteMany","Product.groupBy","Product.aggregate","ProductVariant.findUnique","ProductVariant.findUniqueOrThrow","ProductVariant.findFirst","ProductVariant.findFirstOrThrow","ProductVariant.findMany","ProductVariant.createOne","ProductVariant.createMany","ProductVariant.createManyAndReturn","ProductVariant.updateOne","ProductVariant.updateMany","ProductVariant.updateManyAndReturn","ProductVariant.upsertOne","ProductVariant.deleteOne","ProductVariant.deleteMany","_avg","_sum","ProductVariant.groupBy","ProductVariant.aggregate","ProductOption.findUnique","ProductOption.findUniqueOrThrow","ProductOption.findFirst","ProductOption.findFirstOrThrow","ProductOption.findMany","ProductOption.createOne","ProductOption.createMany","ProductOption.createManyAndReturn","ProductOption.updateOne","ProductOption.updateMany","ProductOption.updateManyAndReturn","ProductOption.upsertOne","ProductOption.deleteOne","ProductOption.deleteMany","ProductOption.groupBy","ProductOption.aggregate","OptionValue.findUnique","OptionValue.findUniqueOrThrow","OptionValue.findFirst","OptionValue.findFirstOrThrow","OptionValue.findMany","OptionValue.createOne","OptionValue.createMany","OptionValue.createManyAndReturn","OptionValue.updateOne","OptionValue.updateMany","OptionValue.updateManyAndReturn","OptionValue.upsertOne","OptionValue.deleteOne","OptionValue.deleteMany","OptionValue.groupBy","OptionValue.aggregate","VariantOptionValue.findUnique","VariantOptionValue.findUniqueOrThrow","VariantOptionValue.findFirst","VariantOptionValue.findFirstOrThrow","VariantOptionValue.findMany","VariantOptionValue.createOne","VariantOptionValue.createMany","VariantOptionValue.createManyAndReturn","VariantOptionValue.updateOne","VariantOptionValue.updateMany","VariantOptionValue.updateManyAndReturn","VariantOptionValue.upsertOne","VariantOptionValue.deleteOne","VariantOptionValue.deleteMany","VariantOptionValue.groupBy","VariantOptionValue.aggregate","ProductImage.findUnique","ProductImage.findUniqueOrThrow","ProductImage.findFirst","ProductImage.findFirstOrThrow","ProductImage.findMany","ProductImage.createOne","ProductImage.createMany","ProductImage.createManyAndReturn","ProductImage.updateOne","ProductImage.updateMany","ProductImage.updateManyAndReturn","ProductImage.upsertOne","ProductImage.deleteOne","ProductImage.deleteMany","ProductImage.groupBy","ProductImage.aggregate","Brand.findUnique","Brand.findUniqueOrThrow","Brand.findFirst","Brand.findFirstOrThrow","Brand.findMany","Brand.createOne","Brand.createMany","Brand.createManyAndReturn","Brand.updateOne","Brand.updateMany","Brand.updateManyAndReturn","Brand.upsertOne","Brand.deleteOne","Brand.deleteMany","Brand.groupBy","Brand.aggregate","Cart.findUnique","Cart.findUniqueOrThrow","Cart.findFirst","Cart.findFirstOrThrow","Cart.findMany","Cart.createOne","Cart.createMany","Cart.createManyAndReturn","Cart.updateOne","Cart.updateMany","Cart.updateManyAndReturn","Cart.upsertOne","Cart.deleteOne","Cart.deleteMany","Cart.groupBy","Cart.aggregate","CartItem.findUnique","CartItem.findUniqueOrThrow","CartItem.findFirst","CartItem.findFirstOrThrow","CartItem.findMany","CartItem.createOne","CartItem.createMany","CartItem.createManyAndReturn","CartItem.updateOne","CartItem.updateMany","CartItem.updateManyAndReturn","CartItem.upsertOne","CartItem.deleteOne","CartItem.deleteMany","CartItem.groupBy","CartItem.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Collection.findUnique","Collection.findUniqueOrThrow","Collection.findFirst","Collection.findFirstOrThrow","Collection.findMany","Collection.createOne","Collection.createMany","Collection.createManyAndReturn","Collection.updateOne","Collection.updateMany","Collection.updateManyAndReturn","Collection.upsertOne","Collection.deleteOne","Collection.deleteMany","Collection.groupBy","Collection.aggregate","ProductCollection.findUnique","ProductCollection.findUniqueOrThrow","ProductCollection.findFirst","ProductCollection.findFirstOrThrow","ProductCollection.findMany","ProductCollection.createOne","ProductCollection.createMany","ProductCollection.createManyAndReturn","ProductCollection.updateOne","ProductCollection.updateMany","ProductCollection.updateManyAndReturn","ProductCollection.upsertOne","ProductCollection.deleteOne","ProductCollection.deleteMany","ProductCollection.groupBy","ProductCollection.aggregate","AND","OR","NOT","productId","collectionId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","id","name","slug","description","imageUrl","isActive","updatedAt","every","some","none","orderId","PaymentMethod","method","provider","transactionId","amount","PaymentStatus","status","paidAt","isDeleted","variantId","productName","sku","unitPrice","quantity","totalPrice","deletedAt","orderNumber","userId","OrderStatus","subtotal","discountTotal","shippingFee","tax","grandTotal","shippingName","shippingPhone","shippingAddress","shippingCity","shippingPostalCode","shippingCountry","cartId","logoUrl","logoUrlPublicId","logoUrlName","logoUrlType","optionValueId","url","urlName","publicId","type","position","groupValue","optionId","value","price","compareAtPrice","stockQuantity","attributes","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","categoryId","brandId","ProductStatus","imageAttribute","parentId","fullName","phone","address1","address2","city","upozila","district","country","identifier","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","UserRole","role","UserStatus","needPasswordChange","productId_name","productId_collectionId","variantId_optionValueId","optionId_value","cartId_variantId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "3wm3AcACFAQAAPsEACAFAAD8BAAgBgAA_QQAIAcAAP4EACAeAAD_BAAg5wIAAPgEADDoAgAAXgAQ6QIAAPgEADDsAkAAvAQAIfgCAQAAAAH5AgEAuQQAIf4CQAC8BAAhiQMAAPoE2gMiiwMgALsEACGSA0AA1gQAIdQDAQAAAAHVAyAAuwQAIdYDAQC6BAAh2AMAAPkE2AMi2gMgALsEACEBAAAAAQAgDAMAANcEACDnAgAArQUAMOgCAAADABDpAgAArQUAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIZQDAQC5BAAhxwNAALwEACHRAwEAuQQAIdIDAQC6BAAh0wMBALoEACEDAwAAoQYAINIDAAC3BQAg0wMAALcFACAMAwAA1wQAIOcCAACtBQAw6AIAAAMAEOkCAACtBQAw7AJAALwEACH4AgEAAAAB_gJAALwEACGUAwEAuQQAIccDQAC8BAAh0QMBAAAAAdIDAQC6BAAh0wMBALoEACEDAAAAAwAgAQAABAAwAgAABQAgEQMAANcEACDnAgAArAUAMOgCAAAHABDpAgAArAUAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIZQDAQC5BAAhyAMBALkEACHJAwEAuQQAIcoDAQC6BAAhywMBALoEACHMAwEAugQAIc0DQADWBAAhzgNAANYEACHPAwEAugQAIdADAQC6BAAhCAMAAKEGACDKAwAAtwUAIMsDAAC3BQAgzAMAALcFACDNAwAAtwUAIM4DAAC3BQAgzwMAALcFACDQAwAAtwUAIBEDAADXBAAg5wIAAKwFADDoAgAABwAQ6QIAAKwFADDsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIZQDAQC5BAAhyAMBALkEACHJAwEAuQQAIcoDAQC6BAAhywMBALoEACHMAwEAugQAIc0DQADWBAAhzgNAANYEACHPAwEAugQAIdADAQC6BAAhAwAAAAcAIAEAAAgAMAIAAAkAIBEDAADXBAAg5wIAAOwEADDoAgAACwAQ6QIAAOwEADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGSA0AA1gQAIZQDAQC5BAAhvgMBALkEACG_AwEAuQQAIcADAQC5BAAhwQMBALoEACHCAwEAuQQAIcMDAQC5BAAhxAMBALkEACHFAwEAuQQAIQEAAAALACALAwAA1wQAIBkAANgEACDnAgAA1QQAMOgCAAANABDpAgAA1QQAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACGUAwEAuQQAIQEAAAANACANBwAAqwUAIBIAAIsFACDnAgAAqgUAMOgCAAAPABDpAgAAqgUAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIYsDIAC7BAAhjAMBALkEACGQAwIAigUAIZIDQADWBAAhoQMBALkEACEDBwAAzAgAIBIAANEIACCSAwAAtwUAIA4HAACrBQAgEgAAiwUAIOcCAACqBQAw6AIAAA8AEOkCAACqBQAw7AJAALwEACH4AgEAAAAB_gJAALwEACGLAyAAuwQAIYwDAQC5BAAhkAMCAIoFACGSA0AA1gQAIaEDAQC5BAAh3wMAAKkFACADAAAADwAgAQAAEAAwAgAAEQAgDggAAKcFACAJAACoBQAgCgAA2wQAIOcCAACmBQAw6AIAABMAEOkCAACmBQAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh-gIBALkEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACG9AwEAugQAIQEAAAATACAFCAAA2QgAIAkAAN0IACAKAAC9BwAgkgMAALcFACC9AwAAtwUAIA4IAACnBQAgCQAAqAUAIAoAANsEACDnAgAApgUAMOgCAAATABDpAgAApgUAMOwCQAC8BAAh-AIBAAAAAfkCAQC5BAAh-gIBAAAAAf4CQAC8BAAhiwMgALsEACGSA0AA1gQAIb0DAQC6BAAhAwAAABMAIAEAABUAMAIAABYAIBUMAACiBQAgDQAAowUAIA4AAKQFACAUAACaBQAgFgAAvQQAIBcAAKUFACDnAgAAoAUAMOgCAAAYABDpAgAAoAUAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh-wIBALoEACH-AkAAvAQAIYkDAAChBbwDIosDIAC7BAAhkgNAANYEACG5AwEAuQQAIboDAQC6BAAhvAMBALoEACEKDAAA2QgAIA0AANoIACAOAADbCAAgFAAA2AgAIBYAAMsFACAXAADcCAAg-wIAALcFACCSAwAAtwUAILoDAAC3BQAgvAMAALcFACAVDAAAogUAIA0AAKMFACAOAACkBQAgFAAAmgUAIBYAAL0EACAXAAClBQAg5wIAAKAFADDoAgAAGAAQ6QIAAKAFADDsAkAAvAQAIfgCAQAAAAH5AgEAuQQAIfoCAQAAAAH7AgEAugQAIf4CQAC8BAAhiQMAAKEFvAMiiwMgALsEACGSA0AA1gQAIbkDAQC5BAAhugMBALoEACG8AwEAugQAIQMAAAAYACABAAAZADACAAAaACABAAAAEwAgAQAAABgAIBAKAADbBAAg5wIAANoEADDoAgAAHgAQ6QIAANoEADDsAkAAvAQAIfgCAQC5BAAh-QIBALkEACH6AgEAuQQAIfsCAQC6BAAh_gJAALwEACGLAyAAuwQAIZIDQADWBAAhogMBALoEACGjAwEAugQAIaQDAQC6BAAhpQMBALoEACEBAAAAHgAgAwAAABgAIAEAABkAMAIAABoAIAEAAAAYACATDwAAjgUAIBgAANgEACAcAACDBQAgHQAAmQUAIOcCAACdBQAw6AIAACIAEOkCAACdBQAw6gIBALkEACHsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGLAyAAuwQAIY4DAQC5BAAhkgNAANYEACGrAwIAigUAIa8DEACCBQAhsAMQAJ4FACGxAwIAigUAIbIDAACfBQAgBg8AANIIACAYAACiBgAgHAAAzggAIB0AANcIACCSAwAAtwUAILADAAC3BQAgEw8AAI4FACAYAADYBAAgHAAAgwUAIB0AAJkFACDnAgAAnQUAMOgCAAAiABDpAgAAnQUAMOoCAQC5BAAh7AJAALwEACH4AgEAAAAB_gJAALwEACGLAyAAuwQAIY4DAQAAAAGSA0AA1gQAIasDAgCKBQAhrwMQAIIFACGwAxAAngUAIbEDAgCKBQAhsgMAAJ8FACADAAAAIgAgAQAAIwAwAgAAJAAgEg8AAI4FACATAACcBQAg5wIAAJsFADDoAgAAJgAQ6QIAAJsFADDqAgEAuQQAIewCQAC8BAAh-AIBALkEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACGmAwEAugQAIacDAQC5BAAhqAMBALkEACGpAwEAuQQAIaoDAQC5BAAhqwMCAIoFACGsAwEAugQAIQUPAADSCAAgEwAA1QgAIJIDAAC3BQAgpgMAALcFACCsAwAAtwUAIBIPAACOBQAgEwAAnAUAIOcCAACbBQAw6AIAACYAEOkCAACbBQAw6gIBALkEACHsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACGmAwEAugQAIacDAQC5BAAhqAMBALkEACGpAwEAuQQAIaoDAQC5BAAhqwMCAIoFACGsAwEAugQAIQMAAAAmACABAAAnADACAAAoACAJDgAAmQUAIBEAAJgFACAUAACaBQAg5wIAAJcFADDoAgAAKgAQ6QIAAJcFADD4AgEAuQQAIa0DAQC5BAAhrgMBALkEACEBAAAAKgAgAw4AANcIACARAADWCAAgFAAA2AgAIAoOAACZBQAgEQAAmAUAIBQAAJoFACDnAgAAlwUAMOgCAAAqABDpAgAAlwUAMPgCAQAAAAGtAwEAuQQAIa4DAQC5BAAh3gMAAJYFACADAAAAKgAgAQAALAAwAgAALQAgAQAAACoAIAcSAACLBQAgEwAAlQUAIOcCAACUBQAw6AIAADAAEOkCAACUBQAwjAMBALkEACGmAwEAuQQAIQISAADRCAAgEwAA1QgAIAgSAACLBQAgEwAAlQUAIOcCAACUBQAw6AIAADAAEOkCAACUBQAwjAMBALkEACGmAwEAuQQAId0DAACTBQAgAwAAADAAIAEAADEAMAIAADIAIAMAAAAmACABAAAnADACAAAoACABAAAAMAAgAQAAACYAIAgPAACOBQAgFQAAkgUAIOcCAACRBQAw6AIAADcAEOkCAACRBQAw6gIBALkEACHrAgEAuQQAIewCQAC8BAAhAg8AANIIACAVAADUCAAgCQ8AAI4FACAVAACSBQAg5wIAAJEFADDoAgAANwAQ6QIAAJEFADDqAgEAuQQAIesCAQC5BAAh7AJAALwEACHcAwAAkAUAIAMAAAA3ACABAAA4ADACAAA5ACADAAAANwAgAQAAOAAwAgAAOQAgAQAAADcAIAgPAACOBQAgEAAAjwUAIOcCAACNBQAw6AIAAD0AEOkCAACNBQAw6gIBALkEACH4AgEAuQQAIfkCAQC5BAAhAg8AANIIACAQAADTCAAgCQ8AAI4FACAQAACPBQAg5wIAAI0FADDoAgAAPQAQ6QIAAI0FADDqAgEAuQQAIfgCAQAAAAH5AgEAuQQAIdsDAACMBQAgAwAAAD0AIAEAAD4AMAIAAD8AIAEAAAAiACABAAAAJgAgAQAAADcAIAEAAAA9ACADAAAADwAgAQAAEAAwAgAAEQAgERIAAIsFACAaAACIBQAg5wIAAIkFADDoAgAARgAQ6QIAAIkFADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGCAwEAuQQAIYsDIAC7BAAhjAMBALkEACGNAwEAuQQAIY4DAQC5BAAhjwMQAIIFACGQAwIAigUAIZEDEACCBQAhkgNAANYEACEDEgAA0QgAIBoAANAIACCSAwAAtwUAIBESAACLBQAgGgAAiAUAIOcCAACJBQAw6AIAAEYAEOkCAACJBQAw7AJAALwEACH4AgEAAAAB_gJAALwEACGCAwEAuQQAIYsDIAC7BAAhjAMBALkEACGNAwEAuQQAIY4DAQC5BAAhjwMQAIIFACGQAwIAigUAIZEDEACCBQAhkgNAANYEACEDAAAARgAgAQAARwAwAgAASAAgAwAAAEYAIAEAAEcAMAIAAEgAIA8aAACIBQAg5wIAAIUFADDoAgAASwAQ6QIAAIUFADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGCAwEAuQQAIYQDAACGBYQDIoUDAQC6BAAhhgMBALoEACGHAxAAggUAIYkDAACHBYkDIooDQADWBAAhiwMgALsEACEEGgAA0AgAIIUDAAC3BQAghgMAALcFACCKAwAAtwUAIA8aAACIBQAg5wIAAIUFADDoAgAASwAQ6QIAAIUFADDsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIYIDAQC5BAAhhAMAAIYFhAMihQMBALoEACGGAwEAAAABhwMQAIIFACGJAwAAhwWJAyKKA0AA1gQAIYsDIAC7BAAhAwAAAEsAIAEAAEwAMAIAAE0AIAEAAABGACABAAAASwAgAwAAADAAIAEAADEAMAIAADIAIAEAAAAPACABAAAARgAgAQAAADAAIAEAAAAPACAZAwAA1wQAIBkAAIMFACAbAACEBQAg5wIAAIAFADDoAgAAVgAQ6QIAAIAFADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGJAwAAgQWWAyKLAyAAuwQAIZIDQADWBAAhkwMBALkEACGUAwEAuQQAIZYDEACCBQAhlwMQAIIFACGYAxAAggUAIZkDEACCBQAhmgMQAIIFACGbAwEAuQQAIZwDAQC5BAAhnQMBALkEACGeAwEAuQQAIZ8DAQC6BAAhoAMBALkEACEFAwAAoQYAIBkAAM4IACAbAADPCAAgkgMAALcFACCfAwAAtwUAIBkDAADXBAAgGQAAgwUAIBsAAIQFACDnAgAAgAUAMOgCAABWABDpAgAAgAUAMOwCQAC8BAAh-AIBAAAAAf4CQAC8BAAhiQMAAIEFlgMiiwMgALsEACGSA0AA1gQAIZMDAQAAAAGUAwEAuQQAIZYDEACCBQAhlwMQAIIFACGYAxAAggUAIZkDEACCBQAhmgMQAIIFACGbAwEAuQQAIZwDAQC5BAAhnQMBALkEACGeAwEAuQQAIZ8DAQC6BAAhoAMBALkEACEDAAAAVgAgAQAAVwAwAgAAWAAgAQAAAAMAIAEAAAAHACABAAAAVgAgAQAAAAEAIBQEAAD7BAAgBQAA_AQAIAYAAP0EACAHAAD-BAAgHgAA_wQAIOcCAAD4BAAw6AIAAF4AEOkCAAD4BAAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh_gJAALwEACGJAwAA-gTaAyKLAyAAuwQAIZIDQADWBAAh1AMBALkEACHVAyAAuwQAIdYDAQC6BAAh2AMAAPkE2AMi2gMgALsEACEHBAAAyQgAIAUAAMoIACAGAADLCAAgBwAAzAgAIB4AAM0IACCSAwAAtwUAINYDAAC3BQAgAwAAAF4AIAEAAF8AMAIAAAEAIAMAAABeACABAABfADACAAABACADAAAAXgAgAQAAXwAwAgAAAQAgEQQAAMQIACAFAADFCAAgBgAAxggAIAcAAMcIACAeAADICAAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB_gJAAAAAAYkDAAAA2gMCiwMgAAAAAZIDQAAAAAHUAwEAAAAB1QMgAAAAAdYDAQAAAAHYAwAAANgDAtoDIAAAAAEBJAAAYwAgDOwCQAAAAAH4AgEAAAAB-QIBAAAAAf4CQAAAAAGJAwAAANoDAosDIAAAAAGSA0AAAAAB1AMBAAAAAdUDIAAAAAHWAwEAAAAB2AMAAADYAwLaAyAAAAABASQAAGUAMAEkAABlADARBAAAkQgAIAUAAJIIACAGAACTCAAgBwAAlAgAIB4AAJUIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH-AkAAsQUAIYkDAACQCNoDIosDIAC8BQAhkgNAANQFACHUAwEAsgUAIdUDIAC8BQAh1gMBALsFACHYAwAAjwjYAyLaAyAAvAUAIQIAAAABACAkAABoACAM7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh_gJAALEFACGJAwAAkAjaAyKLAyAAvAUAIZIDQADUBQAh1AMBALIFACHVAyAAvAUAIdYDAQC7BQAh2AMAAI8I2AMi2gMgALwFACECAAAAXgAgJAAAagAgAgAAAF4AICQAAGoAIAMAAAABACArAABjACAsAABoACABAAAAAQAgAQAAAF4AIAULAACMCAAgMQAAjggAIDIAAI0IACCSAwAAtwUAINYDAAC3BQAgD-cCAADxBAAw6AIAAHEAEOkCAADxBAAw7AJAAKoEACH4AgEAqQQAIfkCAQCpBAAh_gJAAKoEACGJAwAA8wTaAyKLAyAAsgQAIZIDQADCBAAh1AMBAKkEACHVAyAAsgQAIdYDAQCxBAAh2AMAAPIE2AMi2gMgALIEACEDAAAAXgAgAQAAcAAwMAAAcQAgAwAAAF4AIAEAAF8AMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAAIsIACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGUAwEAAAABxwNAAAAAAdEDAQAAAAHSAwEAAAAB0wMBAAAAAQEkAAB5ACAI7AJAAAAAAfgCAQAAAAH-AkAAAAABlAMBAAAAAccDQAAAAAHRAwEAAAAB0gMBAAAAAdMDAQAAAAEBJAAAewAwASQAAHsAMAkDAACKCAAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhlAMBALIFACHHA0AAsQUAIdEDAQCyBQAh0gMBALsFACHTAwEAuwUAIQIAAAAFACAkAAB-ACAI7AJAALEFACH4AgEAsgUAIf4CQACxBQAhlAMBALIFACHHA0AAsQUAIdEDAQCyBQAh0gMBALsFACHTAwEAuwUAIQIAAAADACAkAACAAQAgAgAAAAMAICQAAIABACADAAAABQAgKwAAeQAgLAAAfgAgAQAAAAUAIAEAAAADACAFCwAAhwgAIDEAAIkIACAyAACICAAg0gMAALcFACDTAwAAtwUAIAvnAgAA8AQAMOgCAACHAQAQ6QIAAPAEADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGUAwEAqQQAIccDQACqBAAh0QMBAKkEACHSAwEAsQQAIdMDAQCxBAAhAwAAAAMAIAEAAIYBADAwAACHAQAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgDgMAAIYIACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGUAwEAAAAByAMBAAAAAckDAQAAAAHKAwEAAAABywMBAAAAAcwDAQAAAAHNA0AAAAABzgNAAAAAAc8DAQAAAAHQAwEAAAABASQAAI8BACAN7AJAAAAAAfgCAQAAAAH-AkAAAAABlAMBAAAAAcgDAQAAAAHJAwEAAAABygMBAAAAAcsDAQAAAAHMAwEAAAABzQNAAAAAAc4DQAAAAAHPAwEAAAAB0AMBAAAAAQEkAACRAQAwASQAAJEBADAOAwAAhQgAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIZQDAQCyBQAhyAMBALIFACHJAwEAsgUAIcoDAQC7BQAhywMBALsFACHMAwEAuwUAIc0DQADUBQAhzgNAANQFACHPAwEAuwUAIdADAQC7BQAhAgAAAAkAICQAAJQBACAN7AJAALEFACH4AgEAsgUAIf4CQACxBQAhlAMBALIFACHIAwEAsgUAIckDAQCyBQAhygMBALsFACHLAwEAuwUAIcwDAQC7BQAhzQNAANQFACHOA0AA1AUAIc8DAQC7BQAh0AMBALsFACECAAAABwAgJAAAlgEAIAIAAAAHACAkAACWAQAgAwAAAAkAICsAAI8BACAsAACUAQAgAQAAAAkAIAEAAAAHACAKCwAAgggAIDEAAIQIACAyAACDCAAgygMAALcFACDLAwAAtwUAIMwDAAC3BQAgzQMAALcFACDOAwAAtwUAIM8DAAC3BQAg0AMAALcFACAQ5wIAAO8EADDoAgAAnQEAEOkCAADvBAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhlAMBAKkEACHIAwEAqQQAIckDAQCpBAAhygMBALEEACHLAwEAsQQAIcwDAQCxBAAhzQNAAMIEACHOA0AAwgQAIc8DAQCxBAAh0AMBALEEACEDAAAABwAgAQAAnAEAMDAAAJ0BACADAAAABwAgAQAACAAwAgAACQAgCecCAADuBAAw6AIAAKMBABDpAgAA7gQAMOwCQAC8BAAh-AIBAAAAAf4CQAC8BAAhrgMBALkEACHGAwEAuQQAIccDQAC8BAAhAQAAAKABACABAAAAoAEAIAnnAgAA7gQAMOgCAACjAQAQ6QIAAO4EADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGuAwEAuQQAIcYDAQC5BAAhxwNAALwEACEAAwAAAKMBACABAACkAQAwAgAAoAEAIAMAAACjAQAgAQAApAEAMAIAAKABACADAAAAowEAIAEAAKQBADACAACgAQAgBuwCQAAAAAH4AgEAAAAB_gJAAAAAAa4DAQAAAAHGAwEAAAABxwNAAAAAAQEkAACoAQAgBuwCQAAAAAH4AgEAAAAB_gJAAAAAAa4DAQAAAAHGAwEAAAABxwNAAAAAAQEkAACqAQAwASQAAKoBADAG7AJAALEFACH4AgEAsgUAIf4CQACxBQAhrgMBALIFACHGAwEAsgUAIccDQACxBQAhAgAAAKABACAkAACtAQAgBuwCQACxBQAh-AIBALIFACH-AkAAsQUAIa4DAQCyBQAhxgMBALIFACHHA0AAsQUAIQIAAACjAQAgJAAArwEAIAIAAACjAQAgJAAArwEAIAMAAACgAQAgKwAAqAEAICwAAK0BACABAAAAoAEAIAEAAACjAQAgAwsAAP8HACAxAACBCAAgMgAAgAgAIAnnAgAA7QQAMOgCAAC2AQAQ6QIAAO0EADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGuAwEAqQQAIcYDAQCpBAAhxwNAAKoEACEDAAAAowEAIAEAALUBADAwAAC2AQAgAwAAAKMBACABAACkAQAwAgAAoAEAIBEDAADXBAAg5wIAAOwEADDoAgAACwAQ6QIAAOwEADDsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIZIDQADWBAAhlAMBAAAAAb4DAQC5BAAhvwMBALkEACHAAwEAuQQAIcEDAQC6BAAhwgMBALkEACHDAwEAuQQAIcQDAQC5BAAhxQMBALkEACEBAAAAuQEAIAEAAAC5AQAgAwMAAKEGACCSAwAAtwUAIMEDAAC3BQAgAwAAAAsAIAEAALwBADACAAC5AQAgAwAAAAsAIAEAALwBADACAAC5AQAgAwAAAAsAIAEAALwBADACAAC5AQAgDgMAAP4HACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGSA0AAAAABlAMBAAAAAb4DAQAAAAG_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBAAAAAcQDAQAAAAHFAwEAAAABASQAAMABACAN7AJAAAAAAfgCAQAAAAH-AkAAAAABkgNAAAAAAZQDAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQAAAAHEAwEAAAABxQMBAAAAAQEkAADCAQAwASQAAMIBADAOAwAA_QcAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIZIDQADUBQAhlAMBALIFACG-AwEAsgUAIb8DAQCyBQAhwAMBALIFACHBAwEAuwUAIcIDAQCyBQAhwwMBALIFACHEAwEAsgUAIcUDAQCyBQAhAgAAALkBACAkAADFAQAgDewCQACxBQAh-AIBALIFACH-AkAAsQUAIZIDQADUBQAhlAMBALIFACG-AwEAsgUAIb8DAQCyBQAhwAMBALIFACHBAwEAuwUAIcIDAQCyBQAhwwMBALIFACHEAwEAsgUAIcUDAQCyBQAhAgAAAAsAICQAAMcBACACAAAACwAgJAAAxwEAIAMAAAC5AQAgKwAAwAEAICwAAMUBACABAAAAuQEAIAEAAAALACAFCwAA-gcAIDEAAPwHACAyAAD7BwAgkgMAALcFACDBAwAAtwUAIBDnAgAA6wQAMOgCAADOAQAQ6QIAAOsEADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGSA0AAwgQAIZQDAQCpBAAhvgMBAKkEACG_AwEAqQQAIcADAQCpBAAhwQMBALEEACHCAwEAqQQAIcMDAQCpBAAhxAMBAKkEACHFAwEAqQQAIQMAAAALACABAADNAQAwMAAAzgEAIAMAAAALACABAAC8AQAwAgAAuQEAIAEAAAAWACABAAAAFgAgAwAAABMAIAEAABUAMAIAABYAIAMAAAATACABAAAVADACAAAWACADAAAAEwAgAQAAFQAwAgAAFgAgCwgAAPkHACAJAAD3BwAgCgAA-AcAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAG9AwEAAAABASQAANYBACAI7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAb0DAQAAAAEBJAAA2AEAMAEkAADYAQAwAQAAABMAIAsIAADfBwAgCQAA4AcAIAoAAOEHACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIb0DAQC7BQAhAgAAABYAICQAANwBACAI7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH-AkAAsQUAIYsDIAC8BQAhkgNAANQFACG9AwEAuwUAIQIAAAATACAkAADeAQAgAgAAABMAICQAAN4BACABAAAAEwAgAwAAABYAICsAANYBACAsAADcAQAgAQAAABYAIAEAAAATACAFCwAA3AcAIDEAAN4HACAyAADdBwAgkgMAALcFACC9AwAAtwUAIAvnAgAA6gQAMOgCAADmAQAQ6QIAAOoEADDsAkAAqgQAIfgCAQCpBAAh-QIBAKkEACH6AgEAqQQAIf4CQACqBAAhiwMgALIEACGSA0AAwgQAIb0DAQCxBAAhAwAAABMAIAEAAOUBADAwAADmAQAgAwAAABMAIAEAABUAMAIAABYAIAEAAAAaACABAAAAGgAgAwAAABgAIAEAABkAMAIAABoAIAMAAAAYACABAAAZADACAAAaACADAAAAGAAgAQAAGQAwAgAAGgAgEgwAALcHACANAADbBwAgDgAAuAcAIBQAALkHACAWAAC6BwAgFwAAuwcAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_gJAAAAAAYkDAAAAvAMCiwMgAAAAAZIDQAAAAAG5AwEAAAABugMBAAAAAbwDAQAAAAEBJAAA7gEAIAzsAkAAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAf4CQAAAAAGJAwAAALwDAosDIAAAAAGSA0AAAAABuQMBAAAAAboDAQAAAAG8AwEAAAABASQAAPABADABJAAA8AEAMAEAAAAeACASDAAAswYAIA0AANoHACAOAAC0BgAgFAAAtQYAIBYAALYGACAXAAC3BgAg7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH7AgEAuwUAIf4CQACxBQAhiQMAALEGvAMiiwMgALwFACGSA0AA1AUAIbkDAQCyBQAhugMBALsFACG8AwEAuwUAIQIAAAAaACAkAAD0AQAgDOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH-AkAAsQUAIYkDAACxBrwDIosDIAC8BQAhkgNAANQFACG5AwEAsgUAIboDAQC7BQAhvAMBALsFACECAAAAGAAgJAAA9gEAIAIAAAAYACAkAAD2AQAgAQAAAB4AIAMAAAAaACArAADuAQAgLAAA9AEAIAEAAAAaACABAAAAGAAgBwsAANcHACAxAADZBwAgMgAA2AcAIPsCAAC3BQAgkgMAALcFACC6AwAAtwUAILwDAAC3BQAgD-cCAADmBAAw6AIAAP4BABDpAgAA5gQAMOwCQACqBAAh-AIBAKkEACH5AgEAqQQAIfoCAQCpBAAh-wIBALEEACH-AkAAqgQAIYkDAADnBLwDIosDIACyBAAhkgNAAMIEACG5AwEAqQQAIboDAQCxBAAhvAMBALEEACEDAAAAGAAgAQAA_QEAMDAAAP4BACADAAAAGAAgAQAAGQAwAgAAGgAgAQAAACQAIAEAAAAkACADAAAAIgAgAQAAIwAwAgAAJAAgAwAAACIAIAEAACMAMAIAACQAIAMAAAAiACABAAAjADACAAAkACAQDwAA1gcAIBgAALMHACAcAAC0BwAgHQAAtQcAIOoCAQAAAAHsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABjgMBAAAAAZIDQAAAAAGrAwIAAAABrwMQAAAAAbADEAAAAAGxAwIAAAABsgOAAAAAAQEkAACGAgAgDOoCAQAAAAHsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABjgMBAAAAAZIDQAAAAAGrAwIAAAABrwMQAAAAAbADEAAAAAGxAwIAAAABsgOAAAAAAQEkAACIAgAwASQAAIgCADAQDwAA1QcAIBgAAJIHACAcAACTBwAgHQAAlAcAIOoCAQCyBQAh7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGOAwEAsgUAIZIDQADUBQAhqwMCANwFACGvAxAA0gUAIbADEACQBwAhsQMCANwFACGyA4AAAAABAgAAACQAICQAAIsCACAM6gIBALIFACHsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIY4DAQCyBQAhkgNAANQFACGrAwIA3AUAIa8DEADSBQAhsAMQAJAHACGxAwIA3AUAIbIDgAAAAAECAAAAIgAgJAAAjQIAIAIAAAAiACAkAACNAgAgAwAAACQAICsAAIYCACAsAACLAgAgAQAAACQAIAEAAAAiACAHCwAA0AcAIDEAANMHACAyAADSBwAgowEAANEHACCkAQAA1AcAIJIDAAC3BQAgsAMAALcFACAP5wIAAOAEADDoAgAAlAIAEOkCAADgBAAw6gIBAKkEACHsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGLAyAAsgQAIY4DAQCpBAAhkgNAAMIEACGrAwIAzAQAIa8DEADABAAhsAMQAOEEACGxAwIAzAQAIbIDAADiBAAgAwAAACIAIAEAAJMCADAwAACUAgAgAwAAACIAIAEAACMAMAIAACQAIAEAAAA_ACABAAAAPwAgAwAAAD0AIAEAAD4AMAIAAD8AIAMAAAA9ACABAAA-ADACAAA_ACADAAAAPQAgAQAAPgAwAgAAPwAgBQ8AAM8HACAQAADxBgAg6gIBAAAAAfgCAQAAAAH5AgEAAAABASQAAJwCACAD6gIBAAAAAfgCAQAAAAH5AgEAAAABASQAAJ4CADABJAAAngIAMAUPAADOBwAgEAAAwwYAIOoCAQCyBQAh-AIBALIFACH5AgEAsgUAIQIAAAA_ACAkAAChAgAgA-oCAQCyBQAh-AIBALIFACH5AgEAsgUAIQIAAAA9ACAkAACjAgAgAgAAAD0AICQAAKMCACADAAAAPwAgKwAAnAIAICwAAKECACABAAAAPwAgAQAAAD0AIAMLAADLBwAgMQAAzQcAIDIAAMwHACAG5wIAAN8EADDoAgAAqgIAEOkCAADfBAAw6gIBAKkEACH4AgEAqQQAIfkCAQCpBAAhAwAAAD0AIAEAAKkCADAwAACqAgAgAwAAAD0AIAEAAD4AMAIAAD8AIAEAAAAtACABAAAALQAgAwAAACoAIAEAACwAMAIAAC0AIAMAAAAqACABAAAsADACAAAtACADAAAAKgAgAQAALAAwAgAALQAgBg4AAO4GACARAADKBwAgFAAA7wYAIPgCAQAAAAGtAwEAAAABrgMBAAAAAQEkAACyAgAgA_gCAQAAAAGtAwEAAAABrgMBAAAAAQEkAAC0AgAwASQAALQCADAGDgAAzwYAIBEAAMkHACAUAADQBgAg-AIBALIFACGtAwEAsgUAIa4DAQCyBQAhAgAAAC0AICQAALcCACAD-AIBALIFACGtAwEAsgUAIa4DAQCyBQAhAgAAACoAICQAALkCACACAAAAKgAgJAAAuQIAIAMAAAAtACArAACyAgAgLAAAtwIAIAEAAAAtACABAAAAKgAgAwsAAMYHACAxAADIBwAgMgAAxwcAIAbnAgAA3gQAMOgCAADAAgAQ6QIAAN4EADD4AgEAqQQAIa0DAQCpBAAhrgMBAKkEACEDAAAAKgAgAQAAvwIAMDAAAMACACADAAAAKgAgAQAALAAwAgAALQAgAQAAADIAIAEAAAAyACADAAAAMAAgAQAAMQAwAgAAMgAgAwAAADAAIAEAADEAMAIAADIAIAMAAAAwACABAAAxADACAAAyACAEEgAA7AYAIBMAAJ8HACCMAwEAAAABpgMBAAAAAQEkAADIAgAgAowDAQAAAAGmAwEAAAABASQAAMoCADABJAAAygIAMAQSAADqBgAgEwAAnQcAIIwDAQCyBQAhpgMBALIFACECAAAAMgAgJAAAzQIAIAKMAwEAsgUAIaYDAQCyBQAhAgAAADAAICQAAM8CACACAAAAMAAgJAAAzwIAIAMAAAAyACArAADIAgAgLAAAzQIAIAEAAAAyACABAAAAMAAgAwsAAMMHACAxAADFBwAgMgAAxAcAIAXnAgAA3QQAMOgCAADWAgAQ6QIAAN0EADCMAwEAqQQAIaYDAQCpBAAhAwAAADAAIAEAANUCADAwAADWAgAgAwAAADAAIAEAADEAMAIAADIAIAEAAAAoACABAAAAKAAgAwAAACYAIAEAACcAMAIAACgAIAMAAAAmACABAAAnADACAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgDw8AAN4GACATAACFBwAg6gIBAAAAAewCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGSA0AAAAABpgMBAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwIAAAABrAMBAAAAAQEkAADeAgAgDeoCAQAAAAHsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMCAAAAAawDAQAAAAEBJAAA4AIAMAEkAADgAgAwAQAAACoAIA8PAADcBgAgEwAAgwcAIOoCAQCyBQAh7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIaYDAQC7BQAhpwMBALIFACGoAwEAsgUAIakDAQCyBQAhqgMBALIFACGrAwIA3AUAIawDAQC7BQAhAgAAACgAICQAAOQCACAN6gIBALIFACHsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhpgMBALsFACGnAwEAsgUAIagDAQCyBQAhqQMBALIFACGqAwEAsgUAIasDAgDcBQAhrAMBALsFACECAAAAJgAgJAAA5gIAIAIAAAAmACAkAADmAgAgAQAAACoAIAMAAAAoACArAADeAgAgLAAA5AIAIAEAAAAoACABAAAAJgAgCAsAAL4HACAxAADBBwAgMgAAwAcAIKMBAAC_BwAgpAEAAMIHACCSAwAAtwUAIKYDAAC3BQAgrAMAALcFACAQ5wIAANwEADDoAgAA7gIAEOkCAADcBAAw6gIBAKkEACHsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGLAyAAsgQAIZIDQADCBAAhpgMBALEEACGnAwEAqQQAIagDAQCpBAAhqQMBAKkEACGqAwEAqQQAIasDAgDMBAAhrAMBALEEACEDAAAAJgAgAQAA7QIAMDAAAO4CACADAAAAJgAgAQAAJwAwAgAAKAAgEAoAANsEACDnAgAA2gQAMOgCAAAeABDpAgAA2gQAMOwCQAC8BAAh-AIBAAAAAfkCAQC5BAAh-gIBAAAAAfsCAQC6BAAh_gJAALwEACGLAyAAuwQAIZIDQADWBAAhogMBALoEACGjAwEAugQAIaQDAQC6BAAhpQMBALoEACEBAAAA8QIAIAEAAADxAgAgBwoAAL0HACD7AgAAtwUAIJIDAAC3BQAgogMAALcFACCjAwAAtwUAIKQDAAC3BQAgpQMAALcFACADAAAAHgAgAQAA9AIAMAIAAPECACADAAAAHgAgAQAA9AIAMAIAAPECACADAAAAHgAgAQAA9AIAMAIAAPECACANCgAAvAcAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_gJAAAAAAYsDIAAAAAGSA0AAAAABogMBAAAAAaMDAQAAAAGkAwEAAAABpQMBAAAAAQEkAAD4AgAgDOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_gJAAAAAAYsDIAAAAAGSA0AAAAABogMBAAAAAaMDAQAAAAGkAwEAAAABpQMBAAAAAQEkAAD6AgAwASQAAPoCADANCgAApgYAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH-AkAAsQUAIYsDIAC8BQAhkgNAANQFACGiAwEAuwUAIaMDAQC7BQAhpAMBALsFACGlAwEAuwUAIQIAAADxAgAgJAAA_QIAIAzsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhogMBALsFACGjAwEAuwUAIaQDAQC7BQAhpQMBALsFACECAAAAHgAgJAAA_wIAIAIAAAAeACAkAAD_AgAgAwAAAPECACArAAD4AgAgLAAA_QIAIAEAAADxAgAgAQAAAB4AIAkLAACjBgAgMQAApQYAIDIAAKQGACD7AgAAtwUAIJIDAAC3BQAgogMAALcFACCjAwAAtwUAIKQDAAC3BQAgpQMAALcFACAP5wIAANkEADDoAgAAhgMAEOkCAADZBAAw7AJAAKoEACH4AgEAqQQAIfkCAQCpBAAh-gIBAKkEACH7AgEAsQQAIf4CQACqBAAhiwMgALIEACGSA0AAwgQAIaIDAQCxBAAhowMBALEEACGkAwEAsQQAIaUDAQCxBAAhAwAAAB4AIAEAAIUDADAwAACGAwAgAwAAAB4AIAEAAPQCADACAADxAgAgCwMAANcEACAZAADYBAAg5wIAANUEADDoAgAADQAQ6QIAANUEADDsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACGUAwEAAAABAQAAAIkDACABAAAAiQMAIAMDAAChBgAgGQAAogYAIJIDAAC3BQAgAwAAAA0AIAEAAIwDADACAACJAwAgAwAAAA0AIAEAAIwDADACAACJAwAgAwAAAA0AIAEAAIwDADACAACJAwAgCAMAAJ8GACAZAACgBgAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAGUAwEAAAABASQAAJADACAG7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAGUAwEAAAABASQAAJIDADABJAAAkgMAMAgDAACRBgAgGQAAkgYAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhkgNAANQFACGUAwEAsgUAIQIAAACJAwAgJAAAlQMAIAbsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhlAMBALIFACECAAAADQAgJAAAlwMAIAIAAAANACAkAACXAwAgAwAAAIkDACArAACQAwAgLAAAlQMAIAEAAACJAwAgAQAAAA0AIAQLAACOBgAgMQAAkAYAIDIAAI8GACCSAwAAtwUAIAnnAgAA1AQAMOgCAACeAwAQ6QIAANQEADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGLAyAAsgQAIZIDQADCBAAhlAMBAKkEACEDAAAADQAgAQAAnQMAMDAAAJ4DACADAAAADQAgAQAAjAMAMAIAAIkDACABAAAAEQAgAQAAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAoHAACMBgAgEgAAjQYAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGMAwEAAAABkAMCAAAAAZIDQAAAAAGhAwEAAAABASQAAKYDACAI7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAYwDAQAAAAGQAwIAAAABkgNAAAAAAaEDAQAAAAEBJAAAqAMAMAEkAACoAwAwCgcAAIoGACASAACLBgAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGMAwEAsgUAIZADAgDcBQAhkgNAANQFACGhAwEAsgUAIQIAAAARACAkAACrAwAgCOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjAMBALIFACGQAwIA3AUAIZIDQADUBQAhoQMBALIFACECAAAADwAgJAAArQMAIAIAAAAPACAkAACtAwAgAwAAABEAICsAAKYDACAsAACrAwAgAQAAABEAIAEAAAAPACAGCwAAhQYAIDEAAIgGACAyAACHBgAgowEAAIYGACCkAQAAiQYAIJIDAAC3BQAgC-cCAADTBAAw6AIAALQDABDpAgAA0wQAMOwCQACqBAAh-AIBAKkEACH-AkAAqgQAIYsDIACyBAAhjAMBAKkEACGQAwIAzAQAIZIDQADCBAAhoQMBAKkEACEDAAAADwAgAQAAswMAMDAAALQDACADAAAADwAgAQAAEAAwAgAAEQAgAQAAAFgAIAEAAABYACADAAAAVgAgAQAAVwAwAgAAWAAgAwAAAFYAIAEAAFcAMAIAAFgAIAMAAABWACABAABXADACAABYACAWAwAAggYAIBkAAIMGACAbAACEBgAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiQMAAACWAwKLAyAAAAABkgNAAAAAAZMDAQAAAAGUAwEAAAABlgMQAAAAAZcDEAAAAAGYAxAAAAABmQMQAAAAAZoDEAAAAAGbAwEAAAABnAMBAAAAAZ0DAQAAAAGeAwEAAAABnwMBAAAAAaADAQAAAAEBJAAAvAMAIBPsAkAAAAAB-AIBAAAAAf4CQAAAAAGJAwAAAJYDAosDIAAAAAGSA0AAAAABkwMBAAAAAZQDAQAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGZAxAAAAABmgMQAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAQEkAAC-AwAwASQAAL4DADAWAwAA5wUAIBkAAOgFACAbAADpBQAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiQMAAOYFlgMiiwMgALwFACGSA0AA1AUAIZMDAQCyBQAhlAMBALIFACGWAxAA0gUAIZcDEADSBQAhmAMQANIFACGZAxAA0gUAIZoDEADSBQAhmwMBALIFACGcAwEAsgUAIZ0DAQCyBQAhngMBALIFACGfAwEAuwUAIaADAQCyBQAhAgAAAFgAICQAAMEDACAT7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiQMAAOYFlgMiiwMgALwFACGSA0AA1AUAIZMDAQCyBQAhlAMBALIFACGWAxAA0gUAIZcDEADSBQAhmAMQANIFACGZAxAA0gUAIZoDEADSBQAhmwMBALIFACGcAwEAsgUAIZ0DAQCyBQAhngMBALIFACGfAwEAuwUAIaADAQCyBQAhAgAAAFYAICQAAMMDACACAAAAVgAgJAAAwwMAIAMAAABYACArAAC8AwAgLAAAwQMAIAEAAABYACABAAAAVgAgBwsAAOEFACAxAADkBQAgMgAA4wUAIKMBAADiBQAgpAEAAOUFACCSAwAAtwUAIJ8DAAC3BQAgFucCAADPBAAw6AIAAMoDABDpAgAAzwQAMOwCQACqBAAh-AIBAKkEACH-AkAAqgQAIYkDAADQBJYDIosDIACyBAAhkgNAAMIEACGTAwEAqQQAIZQDAQCpBAAhlgMQAMAEACGXAxAAwAQAIZgDEADABAAhmQMQAMAEACGaAxAAwAQAIZsDAQCpBAAhnAMBAKkEACGdAwEAqQQAIZ4DAQCpBAAhnwMBALEEACGgAwEAqQQAIQMAAABWACABAADJAwAwMAAAygMAIAMAAABWACABAABXADACAABYACABAAAASAAgAQAAAEgAIAMAAABGACABAABHADACAABIACADAAAARgAgAQAARwAwAgAASAAgAwAAAEYAIAEAAEcAMAIAAEgAIA4SAADgBQAgGgAA3wUAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYIDAQAAAAGLAyAAAAABjAMBAAAAAY0DAQAAAAGOAwEAAAABjwMQAAAAAZADAgAAAAGRAxAAAAABkgNAAAAAAQEkAADSAwAgDOwCQAAAAAH4AgEAAAAB_gJAAAAAAYIDAQAAAAGLAyAAAAABjAMBAAAAAY0DAQAAAAGOAwEAAAABjwMQAAAAAZADAgAAAAGRAxAAAAABkgNAAAAAAQEkAADUAwAwASQAANQDADAOEgAA3gUAIBoAAN0FACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGCAwEAsgUAIYsDIAC8BQAhjAMBALIFACGNAwEAsgUAIY4DAQCyBQAhjwMQANIFACGQAwIA3AUAIZEDEADSBQAhkgNAANQFACECAAAASAAgJAAA1wMAIAzsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGCAwEAsgUAIYsDIAC8BQAhjAMBALIFACGNAwEAsgUAIY4DAQCyBQAhjwMQANIFACGQAwIA3AUAIZEDEADSBQAhkgNAANQFACECAAAARgAgJAAA2QMAIAIAAABGACAkAADZAwAgAwAAAEgAICsAANIDACAsAADXAwAgAQAAAEgAIAEAAABGACAGCwAA1wUAIDEAANoFACAyAADZBQAgowEAANgFACCkAQAA2wUAIJIDAAC3BQAgD-cCAADLBAAw6AIAAOADABDpAgAAywQAMOwCQACqBAAh-AIBAKkEACH-AkAAqgQAIYIDAQCpBAAhiwMgALIEACGMAwEAqQQAIY0DAQCpBAAhjgMBAKkEACGPAxAAwAQAIZADAgDMBAAhkQMQAMAEACGSA0AAwgQAIQMAAABGACABAADfAwAwMAAA4AMAIAMAAABGACABAABHADACAABIACABAAAATQAgAQAAAE0AIAMAAABLACABAABMADACAABNACADAAAASwAgAQAATAAwAgAATQAgAwAAAEsAIAEAAEwAMAIAAE0AIAwaAADWBQAg7AJAAAAAAfgCAQAAAAH-AkAAAAABggMBAAAAAYQDAAAAhAMChQMBAAAAAYYDAQAAAAGHAxAAAAABiQMAAACJAwKKA0AAAAABiwMgAAAAAQEkAADoAwAgC-wCQAAAAAH4AgEAAAAB_gJAAAAAAYIDAQAAAAGEAwAAAIQDAoUDAQAAAAGGAwEAAAABhwMQAAAAAYkDAAAAiQMCigNAAAAAAYsDIAAAAAEBJAAA6gMAMAEkAADqAwAwDBoAANUFACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGCAwEAsgUAIYQDAADRBYQDIoUDAQC7BQAhhgMBALsFACGHAxAA0gUAIYkDAADTBYkDIooDQADUBQAhiwMgALwFACECAAAATQAgJAAA7QMAIAvsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGCAwEAsgUAIYQDAADRBYQDIoUDAQC7BQAhhgMBALsFACGHAxAA0gUAIYkDAADTBYkDIooDQADUBQAhiwMgALwFACECAAAASwAgJAAA7wMAIAIAAABLACAkAADvAwAgAwAAAE0AICsAAOgDACAsAADtAwAgAQAAAE0AIAEAAABLACAICwAAzAUAIDEAAM8FACAyAADOBQAgowEAAM0FACCkAQAA0AUAIIUDAAC3BQAghgMAALcFACCKAwAAtwUAIA7nAgAAvgQAMOgCAAD2AwAQ6QIAAL4EADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGCAwEAqQQAIYQDAAC_BIQDIoUDAQCxBAAhhgMBALEEACGHAxAAwAQAIYkDAADBBIkDIooDQADCBAAhiwMgALIEACEDAAAASwAgAQAA9QMAMDAAAPYDACADAAAASwAgAQAATAAwAgAATQAgDAoAAL0EACDnAgAAuAQAMOgCAAD8AwAQ6QIAALgEADDsAkAAvAQAIfgCAQAAAAH5AgEAuQQAIfoCAQAAAAH7AgEAugQAIfwCAQC6BAAh_QIgALsEACH-AkAAvAQAIQEAAAD5AwAgAQAAAPkDACAMCgAAvQQAIOcCAAC4BAAw6AIAAPwDABDpAgAAuAQAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh-wIBALoEACH8AgEAugQAIf0CIAC7BAAh_gJAALwEACEDCgAAywUAIPsCAAC3BQAg_AIAALcFACADAAAA_AMAIAEAAP0DADACAAD5AwAgAwAAAPwDACABAAD9AwAwAgAA-QMAIAMAAAD8AwAgAQAA_QMAMAIAAPkDACAJCgAAygUAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAf0CIAAAAAH-AkAAAAABASQAAIEEACAI7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAAB_QIgAAAAAf4CQAAAAAEBJAAAgwQAMAEkAACDBAAwCQoAAL0FACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_AIBALsFACH9AiAAvAUAIf4CQACxBQAhAgAAAPkDACAkAACGBAAgCOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH8AgEAuwUAIf0CIAC8BQAh_gJAALEFACECAAAA_AMAICQAAIgEACACAAAA_AMAICQAAIgEACADAAAA-QMAICsAAIEEACAsAACGBAAgAQAAAPkDACABAAAA_AMAIAULAAC4BQAgMQAAugUAIDIAALkFACD7AgAAtwUAIPwCAAC3BQAgC-cCAACwBAAw6AIAAI8EABDpAgAAsAQAMOwCQACqBAAh-AIBAKkEACH5AgEAqQQAIfoCAQCpBAAh-wIBALEEACH8AgEAsQQAIf0CIACyBAAh_gJAAKoEACEDAAAA_AMAIAEAAI4EADAwAACPBAAgAwAAAPwDACABAAD9AwAwAgAA-QMAIAEAAAA5ACABAAAAOQAgAwAAADcAIAEAADgAMAIAADkAIAMAAAA3ACABAAA4ADACAAA5ACADAAAANwAgAQAAOAAwAgAAOQAgBQ8AALUFACAVAAC2BQAg6gIBAAAAAesCAQAAAAHsAkAAAAABASQAAJcEACAD6gIBAAAAAesCAQAAAAHsAkAAAAABASQAAJkEADABJAAAmQQAMAUPAACzBQAgFQAAtAUAIOoCAQCyBQAh6wIBALIFACHsAkAAsQUAIQIAAAA5ACAkAACcBAAgA-oCAQCyBQAh6wIBALIFACHsAkAAsQUAIQIAAAA3ACAkAACeBAAgAgAAADcAICQAAJ4EACADAAAAOQAgKwAAlwQAICwAAJwEACABAAAAOQAgAQAAADcAIAMLAACuBQAgMQAAsAUAIDIAAK8FACAG5wIAAKgEADDoAgAApQQAEOkCAACoBAAw6gIBAKkEACHrAgEAqQQAIewCQACqBAAhAwAAADcAIAEAAKQEADAwAAClBAAgAwAAADcAIAEAADgAMAIAADkAIAbnAgAAqAQAMOgCAAClBAAQ6QIAAKgEADDqAgEAqQQAIesCAQCpBAAh7AJAAKoEACEOCwAArAQAIDEAAK8EACAyAACvBAAg7QIBAAAAAe4CAQAAAATvAgEAAAAE8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQCuBAAh9QIBAAAAAfYCAQAAAAH3AgEAAAABCwsAAKwEACAxAACtBAAgMgAArQQAIO0CQAAAAAHuAkAAAAAE7wJAAAAABPACQAAAAAHxAkAAAAAB8gJAAAAAAfMCQAAAAAH0AkAAqwQAIQsLAACsBAAgMQAArQQAIDIAAK0EACDtAkAAAAAB7gJAAAAABO8CQAAAAATwAkAAAAAB8QJAAAAAAfICQAAAAAHzAkAAAAAB9AJAAKsEACEI7QICAAAAAe4CAgAAAATvAgIAAAAE8AICAAAAAfECAgAAAAHyAgIAAAAB8wICAAAAAfQCAgCsBAAhCO0CQAAAAAHuAkAAAAAE7wJAAAAABPACQAAAAAHxAkAAAAAB8gJAAAAAAfMCQAAAAAH0AkAArQQAIQ4LAACsBAAgMQAArwQAIDIAAK8EACDtAgEAAAAB7gIBAAAABO8CAQAAAATwAgEAAAAB8QIBAAAAAfICAQAAAAHzAgEAAAAB9AIBAK4EACH1AgEAAAAB9gIBAAAAAfcCAQAAAAEL7QIBAAAAAe4CAQAAAATvAgEAAAAE8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQCvBAAh9QIBAAAAAfYCAQAAAAH3AgEAAAABC-cCAACwBAAw6AIAAI8EABDpAgAAsAQAMOwCQACqBAAh-AIBAKkEACH5AgEAqQQAIfoCAQCpBAAh-wIBALEEACH8AgEAsQQAIf0CIACyBAAh_gJAAKoEACEOCwAAtgQAIDEAALcEACAyAAC3BAAg7QIBAAAAAe4CAQAAAAXvAgEAAAAF8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQC1BAAh9QIBAAAAAfYCAQAAAAH3AgEAAAABBQsAAKwEACAxAAC0BAAgMgAAtAQAIO0CIAAAAAH0AiAAswQAIQULAACsBAAgMQAAtAQAIDIAALQEACDtAiAAAAAB9AIgALMEACEC7QIgAAAAAfQCIAC0BAAhDgsAALYEACAxAAC3BAAgMgAAtwQAIO0CAQAAAAHuAgEAAAAF7wIBAAAABfACAQAAAAHxAgEAAAAB8gIBAAAAAfMCAQAAAAH0AgEAtQQAIfUCAQAAAAH2AgEAAAAB9wIBAAAAAQjtAgIAAAAB7gICAAAABe8CAgAAAAXwAgIAAAAB8QICAAAAAfICAgAAAAHzAgIAAAAB9AICALYEACEL7QIBAAAAAe4CAQAAAAXvAgEAAAAF8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQC3BAAh9QIBAAAAAfYCAQAAAAH3AgEAAAABDAoAAL0EACDnAgAAuAQAMOgCAAD8AwAQ6QIAALgEADDsAkAAvAQAIfgCAQC5BAAh-QIBALkEACH6AgEAuQQAIfsCAQC6BAAh_AIBALoEACH9AiAAuwQAIf4CQAC8BAAhC-0CAQAAAAHuAgEAAAAE7wIBAAAABPACAQAAAAHxAgEAAAAB8gIBAAAAAfMCAQAAAAH0AgEArwQAIfUCAQAAAAH2AgEAAAAB9wIBAAAAAQvtAgEAAAAB7gIBAAAABe8CAQAAAAXwAgEAAAAB8QIBAAAAAfICAQAAAAHzAgEAAAAB9AIBALcEACH1AgEAAAAB9gIBAAAAAfcCAQAAAAEC7QIgAAAAAfQCIAC0BAAhCO0CQAAAAAHuAkAAAAAE7wJAAAAABPACQAAAAAHxAkAAAAAB8gJAAAAAAfMCQAAAAAH0AkAArQQAIQP_AgAANwAggAMAADcAIIEDAAA3ACAO5wIAAL4EADDoAgAA9gMAEOkCAAC-BAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhggMBAKkEACGEAwAAvwSEAyKFAwEAsQQAIYYDAQCxBAAhhwMQAMAEACGJAwAAwQSJAyKKA0AAwgQAIYsDIACyBAAhBwsAAKwEACAxAADKBAAgMgAAygQAIO0CAAAAhAMC7gIAAACEAwjvAgAAAIQDCPQCAADJBIQDIg0LAACsBAAgMQAAyAQAIDIAAMgEACCjAQAAyAQAIKQBAADIBAAg7QIQAAAAAe4CEAAAAATvAhAAAAAE8AIQAAAAAfECEAAAAAHyAhAAAAAB8wIQAAAAAfQCEADHBAAhBwsAAKwEACAxAADGBAAgMgAAxgQAIO0CAAAAiQMC7gIAAACJAwjvAgAAAIkDCPQCAADFBIkDIgsLAAC2BAAgMQAAxAQAIDIAAMQEACDtAkAAAAAB7gJAAAAABe8CQAAAAAXwAkAAAAAB8QJAAAAAAfICQAAAAAHzAkAAAAAB9AJAAMMEACELCwAAtgQAIDEAAMQEACAyAADEBAAg7QJAAAAAAe4CQAAAAAXvAkAAAAAF8AJAAAAAAfECQAAAAAHyAkAAAAAB8wJAAAAAAfQCQADDBAAhCO0CQAAAAAHuAkAAAAAF7wJAAAAABfACQAAAAAHxAkAAAAAB8gJAAAAAAfMCQAAAAAH0AkAAxAQAIQcLAACsBAAgMQAAxgQAIDIAAMYEACDtAgAAAIkDAu4CAAAAiQMI7wIAAACJAwj0AgAAxQSJAyIE7QIAAACJAwLuAgAAAIkDCO8CAAAAiQMI9AIAAMYEiQMiDQsAAKwEACAxAADIBAAgMgAAyAQAIKMBAADIBAAgpAEAAMgEACDtAhAAAAAB7gIQAAAABO8CEAAAAATwAhAAAAAB8QIQAAAAAfICEAAAAAHzAhAAAAAB9AIQAMcEACEI7QIQAAAAAe4CEAAAAATvAhAAAAAE8AIQAAAAAfECEAAAAAHyAhAAAAAB8wIQAAAAAfQCEADIBAAhBwsAAKwEACAxAADKBAAgMgAAygQAIO0CAAAAhAMC7gIAAACEAwjvAgAAAIQDCPQCAADJBIQDIgTtAgAAAIQDAu4CAAAAhAMI7wIAAACEAwj0AgAAygSEAyIP5wIAAMsEADDoAgAA4AMAEOkCAADLBAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhggMBAKkEACGLAyAAsgQAIYwDAQCpBAAhjQMBAKkEACGOAwEAqQQAIY8DEADABAAhkAMCAMwEACGRAxAAwAQAIZIDQADCBAAhDQsAAKwEACAxAACsBAAgMgAArAQAIKMBAADOBAAgpAEAAKwEACDtAgIAAAAB7gICAAAABO8CAgAAAATwAgIAAAAB8QICAAAAAfICAgAAAAHzAgIAAAAB9AICAM0EACENCwAArAQAIDEAAKwEACAyAACsBAAgowEAAM4EACCkAQAArAQAIO0CAgAAAAHuAgIAAAAE7wICAAAABPACAgAAAAHxAgIAAAAB8gICAAAAAfMCAgAAAAH0AgIAzQQAIQjtAggAAAAB7gIIAAAABO8CCAAAAATwAggAAAAB8QIIAAAAAfICCAAAAAHzAggAAAAB9AIIAM4EACEW5wIAAM8EADDoAgAAygMAEOkCAADPBAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhiQMAANAElgMiiwMgALIEACGSA0AAwgQAIZMDAQCpBAAhlAMBAKkEACGWAxAAwAQAIZcDEADABAAhmAMQAMAEACGZAxAAwAQAIZoDEADABAAhmwMBAKkEACGcAwEAqQQAIZ0DAQCpBAAhngMBAKkEACGfAwEAsQQAIaADAQCpBAAhBwsAAKwEACAxAADSBAAgMgAA0gQAIO0CAAAAlgMC7gIAAACWAwjvAgAAAJYDCPQCAADRBJYDIgcLAACsBAAgMQAA0gQAIDIAANIEACDtAgAAAJYDAu4CAAAAlgMI7wIAAACWAwj0AgAA0QSWAyIE7QIAAACWAwLuAgAAAJYDCO8CAAAAlgMI9AIAANIElgMiC-cCAADTBAAw6AIAALQDABDpAgAA0wQAMOwCQACqBAAh-AIBAKkEACH-AkAAqgQAIYsDIACyBAAhjAMBAKkEACGQAwIAzAQAIZIDQADCBAAhoQMBAKkEACEJ5wIAANQEADDoAgAAngMAEOkCAADUBAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhiwMgALIEACGSA0AAwgQAIZQDAQCpBAAhCwMAANcEACAZAADYBAAg5wIAANUEADDoAgAADQAQ6QIAANUEADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGLAyAAuwQAIZIDQADWBAAhlAMBALkEACEI7QJAAAAAAe4CQAAAAAXvAkAAAAAF8AJAAAAAAfECQAAAAAHyAkAAAAAB8wJAAAAAAfQCQADEBAAhFgQAAPsEACAFAAD8BAAgBgAA_QQAIAcAAP4EACAeAAD_BAAg5wIAAPgEADDoAgAAXgAQ6QIAAPgEADDsAkAAvAQAIfgCAQC5BAAh-QIBALkEACH-AkAAvAQAIYkDAAD6BNoDIosDIAC7BAAhkgNAANYEACHUAwEAuQQAIdUDIAC7BAAh1gMBALoEACHYAwAA-QTYAyLaAyAAuwQAIeADAABeACDhAwAAXgAgA_8CAAAPACCAAwAADwAggQMAAA8AIA_nAgAA2QQAMOgCAACGAwAQ6QIAANkEADDsAkAAqgQAIfgCAQCpBAAh-QIBAKkEACH6AgEAqQQAIfsCAQCxBAAh_gJAAKoEACGLAyAAsgQAIZIDQADCBAAhogMBALEEACGjAwEAsQQAIaQDAQCxBAAhpQMBALEEACEQCgAA2wQAIOcCAADaBAAw6AIAAB4AEOkCAADaBAAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh-gIBALkEACH7AgEAugQAIf4CQAC8BAAhiwMgALsEACGSA0AA1gQAIaIDAQC6BAAhowMBALoEACGkAwEAugQAIaUDAQC6BAAhA_8CAAAYACCAAwAAGAAggQMAABgAIBDnAgAA3AQAMOgCAADuAgAQ6QIAANwEADDqAgEAqQQAIewCQACqBAAh-AIBAKkEACH-AkAAqgQAIYsDIACyBAAhkgNAAMIEACGmAwEAsQQAIacDAQCpBAAhqAMBAKkEACGpAwEAqQQAIaoDAQCpBAAhqwMCAMwEACGsAwEAsQQAIQXnAgAA3QQAMOgCAADWAgAQ6QIAAN0EADCMAwEAqQQAIaYDAQCpBAAhBucCAADeBAAw6AIAAMACABDpAgAA3gQAMPgCAQCpBAAhrQMBAKkEACGuAwEAqQQAIQbnAgAA3wQAMOgCAACqAgAQ6QIAAN8EADDqAgEAqQQAIfgCAQCpBAAh-QIBAKkEACEP5wIAAOAEADDoAgAAlAIAEOkCAADgBAAw6gIBAKkEACHsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGLAyAAsgQAIY4DAQCpBAAhkgNAAMIEACGrAwIAzAQAIa8DEADABAAhsAMQAOEEACGxAwIAzAQAIbIDAADiBAAgDQsAALYEACAxAADlBAAgMgAA5QQAIKMBAADlBAAgpAEAAOUEACDtAhAAAAAB7gIQAAAABe8CEAAAAAXwAhAAAAAB8QIQAAAAAfICEAAAAAHzAhAAAAAB9AIQAOQEACEPCwAArAQAIDEAAOMEACAyAADjBAAg7QKAAAAAAfACgAAAAAHxAoAAAAAB8gKAAAAAAfMCgAAAAAH0AoAAAAABswMBAAAAAbQDAQAAAAG1AwEAAAABtgOAAAAAAbcDgAAAAAG4A4AAAAABDO0CgAAAAAHwAoAAAAAB8QKAAAAAAfICgAAAAAHzAoAAAAAB9AKAAAAAAbMDAQAAAAG0AwEAAAABtQMBAAAAAbYDgAAAAAG3A4AAAAABuAOAAAAAAQ0LAAC2BAAgMQAA5QQAIDIAAOUEACCjAQAA5QQAIKQBAADlBAAg7QIQAAAAAe4CEAAAAAXvAhAAAAAF8AIQAAAAAfECEAAAAAHyAhAAAAAB8wIQAAAAAfQCEADkBAAhCO0CEAAAAAHuAhAAAAAF7wIQAAAABfACEAAAAAHxAhAAAAAB8gIQAAAAAfMCEAAAAAH0AhAA5QQAIQ_nAgAA5gQAMOgCAAD-AQAQ6QIAAOYEADDsAkAAqgQAIfgCAQCpBAAh-QIBAKkEACH6AgEAqQQAIfsCAQCxBAAh_gJAAKoEACGJAwAA5wS8AyKLAyAAsgQAIZIDQADCBAAhuQMBAKkEACG6AwEAsQQAIbwDAQCxBAAhBwsAAKwEACAxAADpBAAgMgAA6QQAIO0CAAAAvAMC7gIAAAC8AwjvAgAAALwDCPQCAADoBLwDIgcLAACsBAAgMQAA6QQAIDIAAOkEACDtAgAAALwDAu4CAAAAvAMI7wIAAAC8Awj0AgAA6AS8AyIE7QIAAAC8AwLuAgAAALwDCO8CAAAAvAMI9AIAAOkEvAMiC-cCAADqBAAw6AIAAOYBABDpAgAA6gQAMOwCQACqBAAh-AIBAKkEACH5AgEAqQQAIfoCAQCpBAAh_gJAAKoEACGLAyAAsgQAIZIDQADCBAAhvQMBALEEACEQ5wIAAOsEADDoAgAAzgEAEOkCAADrBAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhkgNAAMIEACGUAwEAqQQAIb4DAQCpBAAhvwMBAKkEACHAAwEAqQQAIcEDAQCxBAAhwgMBAKkEACHDAwEAqQQAIcQDAQCpBAAhxQMBAKkEACERAwAA1wQAIOcCAADsBAAw6AIAAAsAEOkCAADsBAAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhkgNAANYEACGUAwEAuQQAIb4DAQC5BAAhvwMBALkEACHAAwEAuQQAIcEDAQC6BAAhwgMBALkEACHDAwEAuQQAIcQDAQC5BAAhxQMBALkEACEJ5wIAAO0EADDoAgAAtgEAEOkCAADtBAAw7AJAAKoEACH4AgEAqQQAIf4CQACqBAAhrgMBAKkEACHGAwEAqQQAIccDQACqBAAhCecCAADuBAAw6AIAAKMBABDpAgAA7gQAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIa4DAQC5BAAhxgMBALkEACHHA0AAvAQAIRDnAgAA7wQAMOgCAACdAQAQ6QIAAO8EADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGUAwEAqQQAIcgDAQCpBAAhyQMBAKkEACHKAwEAsQQAIcsDAQCxBAAhzAMBALEEACHNA0AAwgQAIc4DQADCBAAhzwMBALEEACHQAwEAsQQAIQvnAgAA8AQAMOgCAACHAQAQ6QIAAPAEADDsAkAAqgQAIfgCAQCpBAAh_gJAAKoEACGUAwEAqQQAIccDQACqBAAh0QMBAKkEACHSAwEAsQQAIdMDAQCxBAAhD-cCAADxBAAw6AIAAHEAEOkCAADxBAAw7AJAAKoEACH4AgEAqQQAIfkCAQCpBAAh_gJAAKoEACGJAwAA8wTaAyKLAyAAsgQAIZIDQADCBAAh1AMBAKkEACHVAyAAsgQAIdYDAQCxBAAh2AMAAPIE2AMi2gMgALIEACEHCwAArAQAIDEAAPcEACAyAAD3BAAg7QIAAADYAwLuAgAAANgDCO8CAAAA2AMI9AIAAPYE2AMiBwsAAKwEACAxAAD1BAAgMgAA9QQAIO0CAAAA2gMC7gIAAADaAwjvAgAAANoDCPQCAAD0BNoDIgcLAACsBAAgMQAA9QQAIDIAAPUEACDtAgAAANoDAu4CAAAA2gMI7wIAAADaAwj0AgAA9ATaAyIE7QIAAADaAwLuAgAAANoDCO8CAAAA2gMI9AIAAPUE2gMiBwsAAKwEACAxAAD3BAAgMgAA9wQAIO0CAAAA2AMC7gIAAADYAwjvAgAAANgDCPQCAAD2BNgDIgTtAgAAANgDAu4CAAAA2AMI7wIAAADYAwj0AgAA9wTYAyIUBAAA-wQAIAUAAPwEACAGAAD9BAAgBwAA_gQAIB4AAP8EACDnAgAA-AQAMOgCAABeABDpAgAA-AQAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIf4CQAC8BAAhiQMAAPoE2gMiiwMgALsEACGSA0AA1gQAIdQDAQC5BAAh1QMgALsEACHWAwEAugQAIdgDAAD5BNgDItoDIAC7BAAhBO0CAAAA2AMC7gIAAADYAwjvAgAAANgDCPQCAAD3BNgDIgTtAgAAANoDAu4CAAAA2gMI7wIAAADaAwj0AgAA9QTaAyID_wIAAAMAIIADAAADACCBAwAAAwAgA_8CAAAHACCAAwAABwAggQMAAAcAIBMDAADXBAAg5wIAAOwEADDoAgAACwAQ6QIAAOwEADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGSA0AA1gQAIZQDAQC5BAAhvgMBALkEACG_AwEAuQQAIcADAQC5BAAhwQMBALoEACHCAwEAuQQAIcMDAQC5BAAhxAMBALkEACHFAwEAuQQAIeADAAALACDhAwAACwAgDQMAANcEACAZAADYBAAg5wIAANUEADDoAgAADQAQ6QIAANUEADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGLAyAAuwQAIZIDQADWBAAhlAMBALkEACHgAwAADQAg4QMAAA0AIAP_AgAAVgAggAMAAFYAIIEDAABWACAZAwAA1wQAIBkAAIMFACAbAACEBQAg5wIAAIAFADDoAgAAVgAQ6QIAAIAFADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGJAwAAgQWWAyKLAyAAuwQAIZIDQADWBAAhkwMBALkEACGUAwEAuQQAIZYDEACCBQAhlwMQAIIFACGYAxAAggUAIZkDEACCBQAhmgMQAIIFACGbAwEAuQQAIZwDAQC5BAAhnQMBALkEACGeAwEAuQQAIZ8DAQC6BAAhoAMBALkEACEE7QIAAACWAwLuAgAAAJYDCO8CAAAAlgMI9AIAANIElgMiCO0CEAAAAAHuAhAAAAAE7wIQAAAABPACEAAAAAHxAhAAAAAB8gIQAAAAAfMCEAAAAAH0AhAAyAQAIQP_AgAARgAggAMAAEYAIIEDAABGACAD_wIAAEsAIIADAABLACCBAwAASwAgDxoAAIgFACDnAgAAhQUAMOgCAABLABDpAgAAhQUAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIYIDAQC5BAAhhAMAAIYFhAMihQMBALoEACGGAwEAugQAIYcDEACCBQAhiQMAAIcFiQMiigNAANYEACGLAyAAuwQAIQTtAgAAAIQDAu4CAAAAhAMI7wIAAACEAwj0AgAAygSEAyIE7QIAAACJAwLuAgAAAIkDCO8CAAAAiQMI9AIAAMYEiQMiGwMAANcEACAZAACDBQAgGwAAhAUAIOcCAACABQAw6AIAAFYAEOkCAACABQAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiQMAAIEFlgMiiwMgALsEACGSA0AA1gQAIZMDAQC5BAAhlAMBALkEACGWAxAAggUAIZcDEACCBQAhmAMQAIIFACGZAxAAggUAIZoDEACCBQAhmwMBALkEACGcAwEAuQQAIZ0DAQC5BAAhngMBALkEACGfAwEAugQAIaADAQC5BAAh4AMAAFYAIOEDAABWACAREgAAiwUAIBoAAIgFACDnAgAAiQUAMOgCAABGABDpAgAAiQUAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIYIDAQC5BAAhiwMgALsEACGMAwEAuQQAIY0DAQC5BAAhjgMBALkEACGPAxAAggUAIZADAgCKBQAhkQMQAIIFACGSA0AA1gQAIQjtAgIAAAAB7gICAAAABO8CAgAAAATwAgIAAAAB8QICAAAAAfICAgAAAAHzAgIAAAAB9AICAKwEACEVDwAAjgUAIBgAANgEACAcAACDBQAgHQAAmQUAIOcCAACdBQAw6AIAACIAEOkCAACdBQAw6gIBALkEACHsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGLAyAAuwQAIY4DAQC5BAAhkgNAANYEACGrAwIAigUAIa8DEACCBQAhsAMQAJ4FACGxAwIAigUAIbIDAACfBQAg4AMAACIAIOEDAAAiACAC6gIBAAAAAfkCAQAAAAEIDwAAjgUAIBAAAI8FACDnAgAAjQUAMOgCAAA9ABDpAgAAjQUAMOoCAQC5BAAh-AIBALkEACH5AgEAuQQAIRcMAACiBQAgDQAAowUAIA4AAKQFACAUAACaBQAgFgAAvQQAIBcAAKUFACDnAgAAoAUAMOgCAAAYABDpAgAAoAUAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh-wIBALoEACH-AkAAvAQAIYkDAAChBbwDIosDIAC7BAAhkgNAANYEACG5AwEAuQQAIboDAQC6BAAhvAMBALoEACHgAwAAGAAg4QMAABgAIAP_AgAAKgAggAMAACoAIIEDAAAqACAC6gIBAAAAAesCAQAAAAEIDwAAjgUAIBUAAJIFACDnAgAAkQUAMOgCAAA3ABDpAgAAkQUAMOoCAQC5BAAh6wIBALkEACHsAkAAvAQAIQ4KAAC9BAAg5wIAALgEADDoAgAA_AMAEOkCAAC4BAAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh-gIBALkEACH7AgEAugQAIfwCAQC6BAAh_QIgALsEACH-AkAAvAQAIeADAAD8AwAg4QMAAPwDACACjAMBAAAAAaYDAQAAAAEHEgAAiwUAIBMAAJUFACDnAgAAlAUAMOgCAAAwABDpAgAAlAUAMIwDAQC5BAAhpgMBALkEACELDgAAmQUAIBEAAJgFACAUAACaBQAg5wIAAJcFADDoAgAAKgAQ6QIAAJcFADD4AgEAuQQAIa0DAQC5BAAhrgMBALkEACHgAwAAKgAg4QMAACoAIAKtAwEAAAABrgMBAAAAAQkOAACZBQAgEQAAmAUAIBQAAJoFACDnAgAAlwUAMOgCAAAqABDpAgAAlwUAMPgCAQC5BAAhrQMBALkEACGuAwEAuQQAIQoPAACOBQAgEAAAjwUAIOcCAACNBQAw6AIAAD0AEOkCAACNBQAw6gIBALkEACH4AgEAuQQAIfkCAQC5BAAh4AMAAD0AIOEDAAA9ACAD_wIAADAAIIADAAAwACCBAwAAMAAgA_8CAAAmACCAAwAAJgAggQMAACYAIBIPAACOBQAgEwAAnAUAIOcCAACbBQAw6AIAACYAEOkCAACbBQAw6gIBALkEACHsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGLAyAAuwQAIZIDQADWBAAhpgMBALoEACGnAwEAuQQAIagDAQC5BAAhqQMBALkEACGqAwEAuQQAIasDAgCKBQAhrAMBALoEACELDgAAmQUAIBEAAJgFACAUAACaBQAg5wIAAJcFADDoAgAAKgAQ6QIAAJcFADD4AgEAuQQAIa0DAQC5BAAhrgMBALkEACHgAwAAKgAg4QMAACoAIBMPAACOBQAgGAAA2AQAIBwAAIMFACAdAACZBQAg5wIAAJ0FADDoAgAAIgAQ6QIAAJ0FADDqAgEAuQQAIewCQAC8BAAh-AIBALkEACH-AkAAvAQAIYsDIAC7BAAhjgMBALkEACGSA0AA1gQAIasDAgCKBQAhrwMQAIIFACGwAxAAngUAIbEDAgCKBQAhsgMAAJ8FACAI7QIQAAAAAe4CEAAAAAXvAhAAAAAF8AIQAAAAAfECEAAAAAHyAhAAAAAB8wIQAAAAAfQCEADlBAAhDO0CgAAAAAHwAoAAAAAB8QKAAAAAAfICgAAAAAHzAoAAAAAB9AKAAAAAAbMDAQAAAAG0AwEAAAABtQMBAAAAAbYDgAAAAAG3A4AAAAABuAOAAAAAARUMAACiBQAgDQAAowUAIA4AAKQFACAUAACaBQAgFgAAvQQAIBcAAKUFACDnAgAAoAUAMOgCAAAYABDpAgAAoAUAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh-wIBALoEACH-AkAAvAQAIYkDAAChBbwDIosDIAC7BAAhkgNAANYEACG5AwEAuQQAIboDAQC6BAAhvAMBALoEACEE7QIAAAC8AwLuAgAAALwDCO8CAAAAvAMI9AIAAOkEvAMiEAgAAKcFACAJAACoBQAgCgAA2wQAIOcCAACmBQAw6AIAABMAEOkCAACmBQAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh-gIBALkEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACG9AwEAugQAIeADAAATACDhAwAAEwAgEgoAANsEACDnAgAA2gQAMOgCAAAeABDpAgAA2gQAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh-wIBALoEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACGiAwEAugQAIaMDAQC6BAAhpAMBALoEACGlAwEAugQAIeADAAAeACDhAwAAHgAgA_8CAAAiACCAAwAAIgAggQMAACIAIAP_AgAAPQAggAMAAD0AIIEDAAA9ACAOCAAApwUAIAkAAKgFACAKAADbBAAg5wIAAKYFADDoAgAAEwAQ6QIAAKYFADDsAkAAvAQAIfgCAQC5BAAh-QIBALkEACH6AgEAuQQAIf4CQAC8BAAhiwMgALsEACGSA0AA1gQAIb0DAQC6BAAhEAgAAKcFACAJAACoBQAgCgAA2wQAIOcCAACmBQAw6AIAABMAEOkCAACmBQAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh-gIBALkEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACG9AwEAugQAIeADAAATACDhAwAAEwAgA_8CAAATACCAAwAAEwAggQMAABMAIAKMAwEAAAABoQMBAAAAAQ0HAACrBQAgEgAAiwUAIOcCAACqBQAw6AIAAA8AEOkCAACqBQAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiwMgALsEACGMAwEAuQQAIZADAgCKBQAhkgNAANYEACGhAwEAuQQAIQ0DAADXBAAgGQAA2AQAIOcCAADVBAAw6AIAAA0AEOkCAADVBAAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiwMgALsEACGSA0AA1gQAIZQDAQC5BAAh4AMAAA0AIOEDAAANACARAwAA1wQAIOcCAACsBQAw6AIAAAcAEOkCAACsBQAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhlAMBALkEACHIAwEAuQQAIckDAQC5BAAhygMBALoEACHLAwEAugQAIcwDAQC6BAAhzQNAANYEACHOA0AA1gQAIc8DAQC6BAAh0AMBALoEACEMAwAA1wQAIOcCAACtBQAw6AIAAAMAEOkCAACtBQAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhlAMBALkEACHHA0AAvAQAIdEDAQC5BAAh0gMBALoEACHTAwEAugQAIQAAAAHlA0AAAAABAeUDAQAAAAEFKwAA2AkAICwAAN4JACDiAwAA2QkAIOMDAADdCQAg6AMAABoAIAUrAADWCQAgLAAA2wkAIOIDAADXCQAg4wMAANoJACDoAwAA-QMAIAMrAADYCQAg4gMAANkJACDoAwAAGgAgAysAANYJACDiAwAA1wkAIOgDAAD5AwAgAAAAAAHlAwEAAAABAeUDIAAAAAELKwAAvgUAMCwAAMMFADDiAwAAvwUAMOMDAADABQAw5AMAAMEFACDlAwAAwgUAMOYDAADCBQAw5wMAAMIFADDoAwAAwgUAMOkDAADEBQAw6gMAAMUFADADDwAAtQUAIOoCAQAAAAHsAkAAAAABAgAAADkAICsAAMkFACADAAAAOQAgKwAAyQUAICwAAMgFACABJAAA1QkAMAkPAACOBQAgFQAAkgUAIOcCAACRBQAw6AIAADcAEOkCAACRBQAw6gIBALkEACHrAgEAuQQAIewCQAC8BAAh3AMAAJAFACACAAAAOQAgJAAAyAUAIAIAAADGBQAgJAAAxwUAIAbnAgAAxQUAMOgCAADGBQAQ6QIAAMUFADDqAgEAuQQAIesCAQC5BAAh7AJAALwEACEG5wIAAMUFADDoAgAAxgUAEOkCAADFBQAw6gIBALkEACHrAgEAuQQAIewCQAC8BAAhAuoCAQCyBQAh7AJAALEFACEDDwAAswUAIOoCAQCyBQAh7AJAALEFACEDDwAAtQUAIOoCAQAAAAHsAkAAAAABBCsAAL4FADDiAwAAvwUAMOQDAADBBQAg6AMAAMIFADAAAAAAAAAB5QMAAACEAwIF5QMQAAAAAesDEAAAAAHsAxAAAAAB7QMQAAAAAe4DEAAAAAEB5QMAAACJAwIB5QNAAAAAAQUrAADQCQAgLAAA0wkAIOIDAADRCQAg4wMAANIJACDoAwAAWAAgAysAANAJACDiAwAA0QkAIOgDAABYACAAAAAAAAXlAwIAAAAB6wMCAAAAAewDAgAAAAHtAwIAAAAB7gMCAAAAAQUrAADICQAgLAAAzgkAIOIDAADJCQAg4wMAAM0JACDoAwAAWAAgBSsAAMYJACAsAADLCQAg4gMAAMcJACDjAwAAygkAIOgDAAAkACADKwAAyAkAIOIDAADJCQAg6AMAAFgAIAMrAADGCQAg4gMAAMcJACDoAwAAJAAgAAAAAAAB5QMAAACWAwIFKwAAvwkAICwAAMQJACDiAwAAwAkAIOMDAADDCQAg6AMAAAEAIAsrAAD2BQAwLAAA-wUAMOIDAAD3BQAw4wMAAPgFADDkAwAA-QUAIOUDAAD6BQAw5gMAAPoFADDnAwAA-gUAMOgDAAD6BQAw6QMAAPwFADDqAwAA_QUAMAsrAADqBQAwLAAA7wUAMOIDAADrBQAw4wMAAOwFADDkAwAA7QUAIOUDAADuBQAw5gMAAO4FADDnAwAA7gUAMOgDAADuBQAw6QMAAPAFADDqAwAA8QUAMArsAkAAAAAB-AIBAAAAAf4CQAAAAAGEAwAAAIQDAoUDAQAAAAGGAwEAAAABhwMQAAAAAYkDAAAAiQMCigNAAAAAAYsDIAAAAAECAAAATQAgKwAA9QUAIAMAAABNACArAAD1BQAgLAAA9AUAIAEkAADCCQAwDxoAAIgFACDnAgAAhQUAMOgCAABLABDpAgAAhQUAMOwCQAC8BAAh-AIBAAAAAf4CQAC8BAAhggMBALkEACGEAwAAhgWEAyKFAwEAugQAIYYDAQAAAAGHAxAAggUAIYkDAACHBYkDIooDQADWBAAhiwMgALsEACECAAAATQAgJAAA9AUAIAIAAADyBQAgJAAA8wUAIA7nAgAA8QUAMOgCAADyBQAQ6QIAAPEFADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGCAwEAuQQAIYQDAACGBYQDIoUDAQC6BAAhhgMBALoEACGHAxAAggUAIYkDAACHBYkDIooDQADWBAAhiwMgALsEACEO5wIAAPEFADDoAgAA8gUAEOkCAADxBQAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhggMBALkEACGEAwAAhgWEAyKFAwEAugQAIYYDAQC6BAAhhwMQAIIFACGJAwAAhwWJAyKKA0AA1gQAIYsDIAC7BAAhCuwCQACxBQAh-AIBALIFACH-AkAAsQUAIYQDAADRBYQDIoUDAQC7BQAhhgMBALsFACGHAxAA0gUAIYkDAADTBYkDIooDQADUBQAhiwMgALwFACEK7AJAALEFACH4AgEAsgUAIf4CQACxBQAhhAMAANEFhAMihQMBALsFACGGAwEAuwUAIYcDEADSBQAhiQMAANMFiQMiigNAANQFACGLAyAAvAUAIQrsAkAAAAAB-AIBAAAAAf4CQAAAAAGEAwAAAIQDAoUDAQAAAAGGAwEAAAABhwMQAAAAAYkDAAAAiQMCigNAAAAAAYsDIAAAAAEMEgAA4AUAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGMAwEAAAABjQMBAAAAAY4DAQAAAAGPAxAAAAABkAMCAAAAAZEDEAAAAAGSA0AAAAABAgAAAEgAICsAAIEGACADAAAASAAgKwAAgQYAICwAAIAGACABJAAAwQkAMBESAACLBQAgGgAAiAUAIOcCAACJBQAw6AIAAEYAEOkCAACJBQAw7AJAALwEACH4AgEAAAAB_gJAALwEACGCAwEAuQQAIYsDIAC7BAAhjAMBALkEACGNAwEAuQQAIY4DAQC5BAAhjwMQAIIFACGQAwIAigUAIZEDEACCBQAhkgNAANYEACECAAAASAAgJAAAgAYAIAIAAAD-BQAgJAAA_wUAIA_nAgAA_QUAMOgCAAD-BQAQ6QIAAP0FADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGCAwEAuQQAIYsDIAC7BAAhjAMBALkEACGNAwEAuQQAIY4DAQC5BAAhjwMQAIIFACGQAwIAigUAIZEDEACCBQAhkgNAANYEACEP5wIAAP0FADDoAgAA_gUAEOkCAAD9BQAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhggMBALkEACGLAyAAuwQAIYwDAQC5BAAhjQMBALkEACGOAwEAuQQAIY8DEACCBQAhkAMCAIoFACGRAxAAggUAIZIDQADWBAAhC-wCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjAMBALIFACGNAwEAsgUAIY4DAQCyBQAhjwMQANIFACGQAwIA3AUAIZEDEADSBQAhkgNAANQFACEMEgAA3gUAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjAMBALIFACGNAwEAsgUAIY4DAQCyBQAhjwMQANIFACGQAwIA3AUAIZEDEADSBQAhkgNAANQFACEMEgAA4AUAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGMAwEAAAABjQMBAAAAAY4DAQAAAAGPAxAAAAABkAMCAAAAAZEDEAAAAAGSA0AAAAABAysAAL8JACDiAwAAwAkAIOgDAAABACAEKwAA9gUAMOIDAAD3BQAw5AMAAPkFACDoAwAA-gUAMAQrAADqBQAw4gMAAOsFADDkAwAA7QUAIOgDAADuBQAwAAAAAAAFKwAAtwkAICwAAL0JACDiAwAAuAkAIOMDAAC8CQAg6AMAAIkDACAFKwAAtQkAICwAALoJACDiAwAAtgkAIOMDAAC5CQAg6AMAACQAIAMrAAC3CQAg4gMAALgJACDoAwAAiQMAIAMrAAC1CQAg4gMAALYJACDoAwAAJAAgAAAABSsAAK8JACAsAACzCQAg4gMAALAJACDjAwAAsgkAIOgDAAABACALKwAAkwYAMCwAAJgGADDiAwAAlAYAMOMDAACVBgAw5AMAAJYGACDlAwAAlwYAMOYDAACXBgAw5wMAAJcGADDoAwAAlwYAMOkDAACZBgAw6gMAAJoGADAIEgAAjQYAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGMAwEAAAABkAMCAAAAAZIDQAAAAAECAAAAEQAgKwAAngYAIAMAAAARACArAACeBgAgLAAAnQYAIAEkAACxCQAwDgcAAKsFACASAACLBQAg5wIAAKoFADDoAgAADwAQ6QIAAKoFADDsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIYsDIAC7BAAhjAMBALkEACGQAwIAigUAIZIDQADWBAAhoQMBALkEACHfAwAAqQUAIAIAAAARACAkAACdBgAgAgAAAJsGACAkAACcBgAgC-cCAACaBgAw6AIAAJsGABDpAgAAmgYAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIYsDIAC7BAAhjAMBALkEACGQAwIAigUAIZIDQADWBAAhoQMBALkEACEL5wIAAJoGADDoAgAAmwYAEOkCAACaBgAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiwMgALsEACGMAwEAuQQAIZADAgCKBQAhkgNAANYEACGhAwEAuQQAIQfsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIYwDAQCyBQAhkAMCANwFACGSA0AA1AUAIQgSAACLBgAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGMAwEAsgUAIZADAgDcBQAhkgNAANQFACEIEgAAjQYAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGMAwEAAAABkAMCAAAAAZIDQAAAAAEDKwAArwkAIOIDAACwCQAg6AMAAAEAIAQrAACTBgAw4gMAAJQGADDkAwAAlgYAIOgDAACXBgAwBwQAAMkIACAFAADKCAAgBgAAywgAIAcAAMwIACAeAADNCAAgkgMAALcFACDWAwAAtwUAIAAAAAALKwAApwYAMCwAAKwGADDiAwAAqAYAMOMDAACpBgAw5AMAAKoGACDlAwAAqwYAMOYDAACrBgAw5wMAAKsGADDoAwAAqwYAMOkDAACtBgAw6gMAAK4GADAQDAAAtwcAIA4AALgHACAUAAC5BwAgFgAAugcAIBcAALsHACDsAkAAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAf4CQAAAAAGJAwAAALwDAosDIAAAAAGSA0AAAAABuQMBAAAAAbwDAQAAAAECAAAAGgAgKwAAtgcAIAMAAAAaACArAAC2BwAgLAAAsgYAIAEkAACuCQAwFQwAAKIFACANAACjBQAgDgAApAUAIBQAAJoFACAWAAC9BAAgFwAApQUAIOcCAACgBQAw6AIAABgAEOkCAACgBQAw7AJAALwEACH4AgEAAAAB-QIBALkEACH6AgEAAAAB-wIBALoEACH-AkAAvAQAIYkDAAChBbwDIosDIAC7BAAhkgNAANYEACG5AwEAuQQAIboDAQC6BAAhvAMBALoEACECAAAAGgAgJAAAsgYAIAIAAACvBgAgJAAAsAYAIA_nAgAArgYAMOgCAACvBgAQ6QIAAK4GADDsAkAAvAQAIfgCAQC5BAAh-QIBALkEACH6AgEAuQQAIfsCAQC6BAAh_gJAALwEACGJAwAAoQW8AyKLAyAAuwQAIZIDQADWBAAhuQMBALkEACG6AwEAugQAIbwDAQC6BAAhD-cCAACuBgAw6AIAAK8GABDpAgAArgYAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh-wIBALoEACH-AkAAvAQAIYkDAAChBbwDIosDIAC7BAAhkgNAANYEACG5AwEAuQQAIboDAQC6BAAhvAMBALoEACEL7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH7AgEAuwUAIf4CQACxBQAhiQMAALEGvAMiiwMgALwFACGSA0AA1AUAIbkDAQCyBQAhvAMBALsFACEB5QMAAAC8AwIQDAAAswYAIA4AALQGACAUAAC1BgAgFgAAtgYAIBcAALcGACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGJAwAAsQa8AyKLAyAAvAUAIZIDQADUBQAhuQMBALIFACG8AwEAuwUAIQUrAACLCQAgLAAArAkAIOIDAACMCQAg4wMAAKsJACDoAwAAFgAgCysAAIYHADAsAACLBwAw4gMAAIcHADDjAwAAiAcAMOQDAACJBwAg5QMAAIoHADDmAwAAigcAMOcDAACKBwAw6AMAAIoHADDpAwAAjAcAMOoDAACNBwAwCysAAPsGADAsAAD_BgAw4gMAAPwGADDjAwAA_QYAMOQDAAD-BgAg5QMAANUGADDmAwAA1QYAMOcDAADVBgAw6AMAANUGADDpAwAAgAcAMOoDAADYBgAwCysAAPIGADAsAAD2BgAw4gMAAPMGADDjAwAA9AYAMOQDAAD1BgAg5QMAAMIFADDmAwAAwgUAMOcDAADCBQAw6AMAAMIFADDpAwAA9wYAMOoDAADFBQAwCysAALgGADAsAAC9BgAw4gMAALkGADDjAwAAugYAMOQDAAC7BgAg5QMAALwGADDmAwAAvAYAMOcDAAC8BgAw6AMAALwGADDpAwAAvgYAMOoDAAC_BgAwAxAAAPEGACD4AgEAAAAB-QIBAAAAAQIAAAA_ACArAADwBgAgAwAAAD8AICsAAPAGACAsAADCBgAgASQAAKoJADAJDwAAjgUAIBAAAI8FACDnAgAAjQUAMOgCAAA9ABDpAgAAjQUAMOoCAQC5BAAh-AIBAAAAAfkCAQC5BAAh2wMAAIwFACACAAAAPwAgJAAAwgYAIAIAAADABgAgJAAAwQYAIAbnAgAAvwYAMOgCAADABgAQ6QIAAL8GADDqAgEAuQQAIfgCAQC5BAAh-QIBALkEACEG5wIAAL8GADDoAgAAwAYAEOkCAAC_BgAw6gIBALkEACH4AgEAuQQAIfkCAQC5BAAhAvgCAQCyBQAh-QIBALIFACEDEAAAwwYAIPgCAQCyBQAh-QIBALIFACELKwAAxAYAMCwAAMkGADDiAwAAxQYAMOMDAADGBgAw5AMAAMcGACDlAwAAyAYAMOYDAADIBgAw5wMAAMgGADDoAwAAyAYAMOkDAADKBgAw6gMAAMsGADAEDgAA7gYAIBQAAO8GACD4AgEAAAABrgMBAAAAAQIAAAAtACArAADtBgAgAwAAAC0AICsAAO0GACAsAADOBgAgASQAAKkJADAKDgAAmQUAIBEAAJgFACAUAACaBQAg5wIAAJcFADDoAgAAKgAQ6QIAAJcFADD4AgEAAAABrQMBALkEACGuAwEAuQQAId4DAACWBQAgAgAAAC0AICQAAM4GACACAAAAzAYAICQAAM0GACAG5wIAAMsGADDoAgAAzAYAEOkCAADLBgAw-AIBALkEACGtAwEAuQQAIa4DAQC5BAAhBucCAADLBgAw6AIAAMwGABDpAgAAywYAMPgCAQC5BAAhrQMBALkEACGuAwEAuQQAIQL4AgEAsgUAIa4DAQCyBQAhBA4AAM8GACAUAADQBgAg-AIBALIFACGuAwEAsgUAIQsrAADfBgAwLAAA5AYAMOIDAADgBgAw4wMAAOEGADDkAwAA4gYAIOUDAADjBgAw5gMAAOMGADDnAwAA4wYAMOgDAADjBgAw6QMAAOUGADDqAwAA5gYAMAsrAADRBgAwLAAA1gYAMOIDAADSBgAw4wMAANMGADDkAwAA1AYAIOUDAADVBgAw5gMAANUGADDnAwAA1QYAMOgDAADVBgAw6QMAANcGADDqAwAA2AYAMA0PAADeBgAg6gIBAAAAAewCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGSA0AAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAgAAAAGsAwEAAAABAgAAACgAICsAAN0GACADAAAAKAAgKwAA3QYAICwAANsGACABJAAAqAkAMBIPAACOBQAgEwAAnAUAIOcCAACbBQAw6AIAACYAEOkCAACbBQAw6gIBALkEACHsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACGmAwEAugQAIacDAQC5BAAhqAMBALkEACGpAwEAuQQAIaoDAQC5BAAhqwMCAIoFACGsAwEAugQAIQIAAAAoACAkAADbBgAgAgAAANkGACAkAADaBgAgEOcCAADYBgAw6AIAANkGABDpAgAA2AYAMOoCAQC5BAAh7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiwMgALsEACGSA0AA1gQAIaYDAQC6BAAhpwMBALkEACGoAwEAuQQAIakDAQC5BAAhqgMBALkEACGrAwIAigUAIawDAQC6BAAhEOcCAADYBgAw6AIAANkGABDpAgAA2AYAMOoCAQC5BAAh7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiwMgALsEACGSA0AA1gQAIaYDAQC6BAAhpwMBALkEACGoAwEAuQQAIakDAQC5BAAhqgMBALkEACGrAwIAigUAIawDAQC6BAAhDOoCAQCyBQAh7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIacDAQCyBQAhqAMBALIFACGpAwEAsgUAIaoDAQCyBQAhqwMCANwFACGsAwEAuwUAIQ0PAADcBgAg6gIBALIFACHsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhpwMBALIFACGoAwEAsgUAIakDAQCyBQAhqgMBALIFACGrAwIA3AUAIawDAQC7BQAhBSsAAKMJACAsAACmCQAg4gMAAKQJACDjAwAApQkAIOgDAAAaACANDwAA3gYAIOoCAQAAAAHsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwIAAAABrAMBAAAAAQMrAACjCQAg4gMAAKQJACDoAwAAGgAgAhIAAOwGACCMAwEAAAABAgAAADIAICsAAOsGACADAAAAMgAgKwAA6wYAICwAAOkGACABJAAAogkAMAgSAACLBQAgEwAAlQUAIOcCAACUBQAw6AIAADAAEOkCAACUBQAwjAMBALkEACGmAwEAuQQAId0DAACTBQAgAgAAADIAICQAAOkGACACAAAA5wYAICQAAOgGACAF5wIAAOYGADDoAgAA5wYAEOkCAADmBgAwjAMBALkEACGmAwEAuQQAIQXnAgAA5gYAMOgCAADnBgAQ6QIAAOYGADCMAwEAuQQAIaYDAQC5BAAhAYwDAQCyBQAhAhIAAOoGACCMAwEAsgUAIQUrAACdCQAgLAAAoAkAIOIDAACeCQAg4wMAAJ8JACDoAwAAJAAgAhIAAOwGACCMAwEAAAABAysAAJ0JACDiAwAAngkAIOgDAAAkACAEDgAA7gYAIBQAAO8GACD4AgEAAAABrgMBAAAAAQQrAADfBgAw4gMAAOAGADDkAwAA4gYAIOgDAADjBgAwBCsAANEGADDiAwAA0gYAMOQDAADUBgAg6AMAANUGADADEAAA8QYAIPgCAQAAAAH5AgEAAAABBCsAAMQGADDiAwAAxQYAMOQDAADHBgAg6AMAAMgGADADFQAAtgUAIOsCAQAAAAHsAkAAAAABAgAAADkAICsAAPoGACADAAAAOQAgKwAA-gYAICwAAPkGACABJAAAnAkAMAIAAAA5ACAkAAD5BgAgAgAAAMYFACAkAAD4BgAgAusCAQCyBQAh7AJAALEFACEDFQAAtAUAIOsCAQCyBQAh7AJAALEFACEDFQAAtgUAIOsCAQAAAAHsAkAAAAABDRMAAIUHACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMCAAAAAawDAQAAAAECAAAAKAAgKwAAhAcAIAMAAAAoACArAACEBwAgLAAAggcAIAEkAACbCQAwAgAAACgAICQAAIIHACACAAAA2QYAICQAAIEHACAM7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIaYDAQC7BQAhpwMBALIFACGoAwEAsgUAIakDAQCyBQAhqgMBALIFACGrAwIA3AUAIawDAQC7BQAhDRMAAIMHACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhpgMBALsFACGnAwEAsgUAIagDAQCyBQAhqQMBALIFACGqAwEAsgUAIasDAgDcBQAhrAMBALsFACEHKwAAlgkAICwAAJkJACDiAwAAlwkAIOMDAACYCQAg5gMAACoAIOcDAAAqACDoAwAALQAgDRMAAIUHACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMCAAAAAawDAQAAAAEDKwAAlgkAIOIDAACXCQAg6AMAAC0AIA4YAACzBwAgHAAAtAcAIB0AALUHACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABjgMBAAAAAZIDQAAAAAGrAwIAAAABrwMQAAAAAbADEAAAAAGxAwIAAAABsgOAAAAAAQIAAAAkACArAACyBwAgAwAAACQAICsAALIHACAsAACRBwAgASQAAJUJADATDwAAjgUAIBgAANgEACAcAACDBQAgHQAAmQUAIOcCAACdBQAw6AIAACIAEOkCAACdBQAw6gIBALkEACHsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIYsDIAC7BAAhjgMBAAAAAZIDQADWBAAhqwMCAIoFACGvAxAAggUAIbADEACeBQAhsQMCAIoFACGyAwAAnwUAIAIAAAAkACAkAACRBwAgAgAAAI4HACAkAACPBwAgD-cCAACNBwAw6AIAAI4HABDpAgAAjQcAMOoCAQC5BAAh7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiwMgALsEACGOAwEAuQQAIZIDQADWBAAhqwMCAIoFACGvAxAAggUAIbADEACeBQAhsQMCAIoFACGyAwAAnwUAIA_nAgAAjQcAMOgCAACOBwAQ6QIAAI0HADDqAgEAuQQAIewCQAC8BAAh-AIBALkEACH-AkAAvAQAIYsDIAC7BAAhjgMBALkEACGSA0AA1gQAIasDAgCKBQAhrwMQAIIFACGwAxAAngUAIbEDAgCKBQAhsgMAAJ8FACAL7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGOAwEAsgUAIZIDQADUBQAhqwMCANwFACGvAxAA0gUAIbADEACQBwAhsQMCANwFACGyA4AAAAABBeUDEAAAAAHrAxAAAAAB7AMQAAAAAe0DEAAAAAHuAxAAAAABDhgAAJIHACAcAACTBwAgHQAAlAcAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjgMBALIFACGSA0AA1AUAIasDAgDcBQAhrwMQANIFACGwAxAAkAcAIbEDAgDcBQAhsgOAAAAAAQsrAACpBwAwLAAArQcAMOIDAACqBwAw4wMAAKsHADDkAwAArAcAIOUDAACXBgAw5gMAAJcGADDnAwAAlwYAMOgDAACXBgAw6QMAAK4HADDqAwAAmgYAMAsrAACgBwAwLAAApAcAMOIDAAChBwAw4wMAAKIHADDkAwAAowcAIOUDAAD6BQAw5gMAAPoFADDnAwAA-gUAMOgDAAD6BQAw6QMAAKUHADDqAwAA_QUAMAsrAACVBwAwLAAAmQcAMOIDAACWBwAw4wMAAJcHADDkAwAAmAcAIOUDAADjBgAw5gMAAOMGADDnAwAA4wYAMOgDAADjBgAw6QMAAJoHADDqAwAA5gYAMAITAACfBwAgpgMBAAAAAQIAAAAyACArAACeBwAgAwAAADIAICsAAJ4HACAsAACcBwAgASQAAJQJADACAAAAMgAgJAAAnAcAIAIAAADnBgAgJAAAmwcAIAGmAwEAsgUAIQITAACdBwAgpgMBALIFACEFKwAAjwkAICwAAJIJACDiAwAAkAkAIOMDAACRCQAg6AMAAC0AIAITAACfBwAgpgMBAAAAAQMrAACPCQAg4gMAAJAJACDoAwAALQAgDBoAAN8FACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGCAwEAAAABiwMgAAAAAY0DAQAAAAGOAwEAAAABjwMQAAAAAZADAgAAAAGRAxAAAAABkgNAAAAAAQIAAABIACArAACoBwAgAwAAAEgAICsAAKgHACAsAACnBwAgASQAAI4JADACAAAASAAgJAAApwcAIAIAAAD-BQAgJAAApgcAIAvsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGCAwEAsgUAIYsDIAC8BQAhjQMBALIFACGOAwEAsgUAIY8DEADSBQAhkAMCANwFACGRAxAA0gUAIZIDQADUBQAhDBoAAN0FACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGCAwEAsgUAIYsDIAC8BQAhjQMBALIFACGOAwEAsgUAIY8DEADSBQAhkAMCANwFACGRAxAA0gUAIZIDQADUBQAhDBoAAN8FACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGCAwEAAAABiwMgAAAAAY0DAQAAAAGOAwEAAAABjwMQAAAAAZADAgAAAAGRAxAAAAABkgNAAAAAAQgHAACMBgAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAZADAgAAAAGSA0AAAAABoQMBAAAAAQIAAAARACArAACxBwAgAwAAABEAICsAALEHACAsAACwBwAgASQAAI0JADACAAAAEQAgJAAAsAcAIAIAAACbBgAgJAAArwcAIAfsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZADAgDcBQAhkgNAANQFACGhAwEAsgUAIQgHAACKBgAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGQAwIA3AUAIZIDQADUBQAhoQMBALIFACEIBwAAjAYAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGQAwIAAAABkgNAAAAAAaEDAQAAAAEOGAAAswcAIBwAALQHACAdAAC1BwAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAY4DAQAAAAGSA0AAAAABqwMCAAAAAa8DEAAAAAGwAxAAAAABsQMCAAAAAbIDgAAAAAEEKwAAqQcAMOIDAACqBwAw5AMAAKwHACDoAwAAlwYAMAQrAACgBwAw4gMAAKEHADDkAwAAowcAIOgDAAD6BQAwBCsAAJUHADDiAwAAlgcAMOQDAACYBwAg6AMAAOMGADAQDAAAtwcAIA4AALgHACAUAAC5BwAgFgAAugcAIBcAALsHACDsAkAAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAf4CQAAAAAGJAwAAALwDAosDIAAAAAGSA0AAAAABuQMBAAAAAbwDAQAAAAEDKwAAiwkAIOIDAACMCQAg6AMAABYAIAQrAACGBwAw4gMAAIcHADDkAwAAiQcAIOgDAACKBwAwBCsAAPsGADDiAwAA_AYAMOQDAAD-BgAg6AMAANUGADAEKwAA8gYAMOIDAADzBgAw5AMAAPUGACDoAwAAwgUAMAQrAAC4BgAw4gMAALkGADDkAwAAuwYAIOgDAAC8BgAwBCsAAKcGADDiAwAAqAYAMOQDAACqBgAg6AMAAKsGADAAAAAAAAAAAAAAAAAFKwAAhgkAICwAAIkJACDiAwAAhwkAIOMDAACICQAg6AMAAD8AIAMrAACGCQAg4gMAAIcJACDoAwAAPwAgAAAABSsAAIEJACAsAACECQAg4gMAAIIJACDjAwAAgwkAIOgDAAAaACADKwAAgQkAIOIDAACCCQAg6AMAABoAIAAAAAAABSsAAPwIACAsAAD_CAAg4gMAAP0IACDjAwAA_ggAIOgDAAAaACADKwAA_AgAIOIDAAD9CAAg6AMAABoAIAAAAAcrAAD3CAAgLAAA-ggAIOIDAAD4CAAg4wMAAPkIACDmAwAAHgAg5wMAAB4AIOgDAADxAgAgAysAAPcIACDiAwAA-AgAIOgDAADxAgAgAAAABysAAPAIACAsAAD1CAAg4gMAAPEIACDjAwAA9AgAIOYDAAATACDnAwAAEwAg6AMAABYAIAsrAADrBwAwLAAA8AcAMOIDAADsBwAw4wMAAO0HADDkAwAA7gcAIOUDAADvBwAw5gMAAO8HADDnAwAA7wcAMOgDAADvBwAw6QMAAPEHADDqAwAA8gcAMAsrAADiBwAwLAAA5gcAMOIDAADjBwAw4wMAAOQHADDkAwAA5QcAIOUDAACrBgAw5gMAAKsGADDnAwAAqwYAMOgDAACrBgAw6QMAAOcHADDqAwAArgYAMBANAADbBwAgDgAAuAcAIBQAALkHACAWAAC6BwAgFwAAuwcAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_gJAAAAAAYkDAAAAvAMCiwMgAAAAAZIDQAAAAAG6AwEAAAABvAMBAAAAAQIAAAAaACArAADqBwAgAwAAABoAICsAAOoHACAsAADpBwAgASQAAPMIADACAAAAGgAgJAAA6QcAIAIAAACvBgAgJAAA6AcAIAvsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGJAwAAsQa8AyKLAyAAvAUAIZIDQADUBQAhugMBALsFACG8AwEAuwUAIRANAADaBwAgDgAAtAYAIBQAALUGACAWAAC2BgAgFwAAtwYAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH-AkAAsQUAIYkDAACxBrwDIosDIAC8BQAhkgNAANQFACG6AwEAuwUAIbwDAQC7BQAhEA0AANsHACAOAAC4BwAgFAAAuQcAIBYAALoHACAXAAC7BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH-AkAAAAABiQMAAAC8AwKLAyAAAAABkgNAAAAAAboDAQAAAAG8AwEAAAABCQkAAPcHACAKAAD4BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAQIAAAAWACArAAD2BwAgAwAAABYAICsAAPYHACAsAAD1BwAgASQAAPIIADAOCAAApwUAIAkAAKgFACAKAADbBAAg5wIAAKYFADDoAgAAEwAQ6QIAAKYFADDsAkAAvAQAIfgCAQAAAAH5AgEAuQQAIfoCAQAAAAH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACG9AwEAugQAIQIAAAAWACAkAAD1BwAgAgAAAPMHACAkAAD0BwAgC-cCAADyBwAw6AIAAPMHABDpAgAA8gcAMOwCQAC8BAAh-AIBALkEACH5AgEAuQQAIfoCAQC5BAAh_gJAALwEACGLAyAAuwQAIZIDQADWBAAhvQMBALoEACEL5wIAAPIHADDoAgAA8wcAEOkCAADyBwAw7AJAALwEACH4AgEAuQQAIfkCAQC5BAAh-gIBALkEACH-AkAAvAQAIYsDIAC7BAAhkgNAANYEACG9AwEAugQAIQfsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIQkJAADgBwAgCgAA4QcAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhCQkAAPcHACAKAAD4BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAQQrAADrBwAw4gMAAOwHADDkAwAA7gcAIOgDAADvBwAwBCsAAOIHADDiAwAA4wcAMOQDAADlBwAg6AMAAKsGADADKwAA8AgAIOIDAADxCAAg6AMAABYAIAAAAAUrAADrCAAgLAAA7ggAIOIDAADsCAAg4wMAAO0IACDoAwAAAQAgAysAAOsIACDiAwAA7AgAIOgDAAABACAAAAAAAAAFKwAA5ggAICwAAOkIACDiAwAA5wgAIOMDAADoCAAg6AMAAAEAIAMrAADmCAAg4gMAAOcIACDoAwAAAQAgAAAABSsAAOEIACAsAADkCAAg4gMAAOIIACDjAwAA4wgAIOgDAAABACADKwAA4QgAIOIDAADiCAAg6AMAAAEAIAAAAAHlAwAAANgDAgHlAwAAANoDAgsrAAC4CAAwLAAAvQgAMOIDAAC5CAAw4wMAALoIADDkAwAAuwgAIOUDAAC8CAAw5gMAALwIADDnAwAAvAgAMOgDAAC8CAAw6QMAAL4IADDqAwAAvwgAMAsrAACsCAAwLAAAsQgAMOIDAACtCAAw4wMAAK4IADDkAwAArwgAIOUDAACwCAAw5gMAALAIADDnAwAAsAgAMOgDAACwCAAw6QMAALIIADDqAwAAswgAMAcrAACnCAAgLAAAqggAIOIDAACoCAAg4wMAAKkIACDmAwAACwAg5wMAAAsAIOgDAAC5AQAgBysAAKIIACAsAAClCAAg4gMAAKMIACDjAwAApAgAIOYDAAANACDnAwAADQAg6AMAAIkDACALKwAAlggAMCwAAJsIADDiAwAAlwgAMOMDAACYCAAw5AMAAJkIACDlAwAAmggAMOYDAACaCAAw5wMAAJoIADDoAwAAmggAMOkDAACcCAAw6gMAAJ0IADAUGQAAgwYAIBsAAIQGACDsAkAAAAAB-AIBAAAAAf4CQAAAAAGJAwAAAJYDAosDIAAAAAGSA0AAAAABkwMBAAAAAZYDEAAAAAGXAxAAAAABmAMQAAAAAZkDEAAAAAGaAxAAAAABmwMBAAAAAZwDAQAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABAgAAAFgAICsAAKEIACADAAAAWAAgKwAAoQgAICwAAKAIACABJAAA4AgAMBkDAADXBAAgGQAAgwUAIBsAAIQFACDnAgAAgAUAMOgCAABWABDpAgAAgAUAMOwCQAC8BAAh-AIBAAAAAf4CQAC8BAAhiQMAAIEFlgMiiwMgALsEACGSA0AA1gQAIZMDAQAAAAGUAwEAuQQAIZYDEACCBQAhlwMQAIIFACGYAxAAggUAIZkDEACCBQAhmgMQAIIFACGbAwEAuQQAIZwDAQC5BAAhnQMBALkEACGeAwEAuQQAIZ8DAQC6BAAhoAMBALkEACECAAAAWAAgJAAAoAgAIAIAAACeCAAgJAAAnwgAIBbnAgAAnQgAMOgCAACeCAAQ6QIAAJ0IADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGJAwAAgQWWAyKLAyAAuwQAIZIDQADWBAAhkwMBALkEACGUAwEAuQQAIZYDEACCBQAhlwMQAIIFACGYAxAAggUAIZkDEACCBQAhmgMQAIIFACGbAwEAuQQAIZwDAQC5BAAhnQMBALkEACGeAwEAuQQAIZ8DAQC6BAAhoAMBALkEACEW5wIAAJ0IADDoAgAAnggAEOkCAACdCAAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhiQMAAIEFlgMiiwMgALsEACGSA0AA1gQAIZMDAQC5BAAhlAMBALkEACGWAxAAggUAIZcDEACCBQAhmAMQAIIFACGZAxAAggUAIZoDEACCBQAhmwMBALkEACGcAwEAuQQAIZ0DAQC5BAAhngMBALkEACGfAwEAugQAIaADAQC5BAAhEuwCQACxBQAh-AIBALIFACH-AkAAsQUAIYkDAADmBZYDIosDIAC8BQAhkgNAANQFACGTAwEAsgUAIZYDEADSBQAhlwMQANIFACGYAxAA0gUAIZkDEADSBQAhmgMQANIFACGbAwEAsgUAIZwDAQCyBQAhnQMBALIFACGeAwEAsgUAIZ8DAQC7BQAhoAMBALIFACEUGQAA6AUAIBsAAOkFACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGJAwAA5gWWAyKLAyAAvAUAIZIDQADUBQAhkwMBALIFACGWAxAA0gUAIZcDEADSBQAhmAMQANIFACGZAxAA0gUAIZoDEADSBQAhmwMBALIFACGcAwEAsgUAIZ0DAQCyBQAhngMBALIFACGfAwEAuwUAIaADAQCyBQAhFBkAAIMGACAbAACEBgAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiQMAAACWAwKLAyAAAAABkgNAAAAAAZMDAQAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGZAxAAAAABmgMQAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAQYZAACgBgAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAECAAAAiQMAICsAAKIIACADAAAADQAgKwAAoggAICwAAKYIACAIAAAADQAgGQAAkgYAICQAAKYIACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhBhkAAJIGACDsAkAAsQUAIfgCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhDOwCQAAAAAH4AgEAAAAB_gJAAAAAAZIDQAAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQAAAAHEAwEAAAABxQMBAAAAAQIAAAC5AQAgKwAApwgAIAMAAAALACArAACnCAAgLAAAqwgAIA4AAAALACAkAACrCAAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhkgNAANQFACG-AwEAsgUAIb8DAQCyBQAhwAMBALIFACHBAwEAuwUAIcIDAQCyBQAhwwMBALIFACHEAwEAsgUAIcUDAQCyBQAhDOwCQACxBQAh-AIBALIFACH-AkAAsQUAIZIDQADUBQAhvgMBALIFACG_AwEAsgUAIcADAQCyBQAhwQMBALsFACHCAwEAsgUAIcMDAQCyBQAhxAMBALIFACHFAwEAsgUAIQzsAkAAAAAB-AIBAAAAAf4CQAAAAAHIAwEAAAAByQMBAAAAAcoDAQAAAAHLAwEAAAABzAMBAAAAAc0DQAAAAAHOA0AAAAABzwMBAAAAAdADAQAAAAECAAAACQAgKwAAtwgAIAMAAAAJACArAAC3CAAgLAAAtggAIAEkAADfCAAwEQMAANcEACDnAgAArAUAMOgCAAAHABDpAgAArAUAMOwCQAC8BAAh-AIBAAAAAf4CQAC8BAAhlAMBALkEACHIAwEAuQQAIckDAQC5BAAhygMBALoEACHLAwEAugQAIcwDAQC6BAAhzQNAANYEACHOA0AA1gQAIc8DAQC6BAAh0AMBALoEACECAAAACQAgJAAAtggAIAIAAAC0CAAgJAAAtQgAIBDnAgAAswgAMOgCAAC0CAAQ6QIAALMIADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGUAwEAuQQAIcgDAQC5BAAhyQMBALkEACHKAwEAugQAIcsDAQC6BAAhzAMBALoEACHNA0AA1gQAIc4DQADWBAAhzwMBALoEACHQAwEAugQAIRDnAgAAswgAMOgCAAC0CAAQ6QIAALMIADDsAkAAvAQAIfgCAQC5BAAh_gJAALwEACGUAwEAuQQAIcgDAQC5BAAhyQMBALkEACHKAwEAugQAIcsDAQC6BAAhzAMBALoEACHNA0AA1gQAIc4DQADWBAAhzwMBALoEACHQAwEAugQAIQzsAkAAsQUAIfgCAQCyBQAh_gJAALEFACHIAwEAsgUAIckDAQCyBQAhygMBALsFACHLAwEAuwUAIcwDAQC7BQAhzQNAANQFACHOA0AA1AUAIc8DAQC7BQAh0AMBALsFACEM7AJAALEFACH4AgEAsgUAIf4CQACxBQAhyAMBALIFACHJAwEAsgUAIcoDAQC7BQAhywMBALsFACHMAwEAuwUAIc0DQADUBQAhzgNAANQFACHPAwEAuwUAIdADAQC7BQAhDOwCQAAAAAH4AgEAAAAB_gJAAAAAAcgDAQAAAAHJAwEAAAABygMBAAAAAcsDAQAAAAHMAwEAAAABzQNAAAAAAc4DQAAAAAHPAwEAAAAB0AMBAAAAAQfsAkAAAAAB-AIBAAAAAf4CQAAAAAHHA0AAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAABAgAAAAUAICsAAMMIACADAAAABQAgKwAAwwgAICwAAMIIACABJAAA3ggAMAwDAADXBAAg5wIAAK0FADDoAgAAAwAQ6QIAAK0FADDsAkAAvAQAIfgCAQAAAAH-AkAAvAQAIZQDAQC5BAAhxwNAALwEACHRAwEAAAAB0gMBALoEACHTAwEAugQAIQIAAAAFACAkAADCCAAgAgAAAMAIACAkAADBCAAgC-cCAAC_CAAw6AIAAMAIABDpAgAAvwgAMOwCQAC8BAAh-AIBALkEACH-AkAAvAQAIZQDAQC5BAAhxwNAALwEACHRAwEAuQQAIdIDAQC6BAAh0wMBALoEACEL5wIAAL8IADDoAgAAwAgAEOkCAAC_CAAw7AJAALwEACH4AgEAuQQAIf4CQAC8BAAhlAMBALkEACHHA0AAvAQAIdEDAQC5BAAh0gMBALoEACHTAwEAugQAIQfsAkAAsQUAIfgCAQCyBQAh_gJAALEFACHHA0AAsQUAIdEDAQCyBQAh0gMBALsFACHTAwEAuwUAIQfsAkAAsQUAIfgCAQCyBQAh_gJAALEFACHHA0AAsQUAIdEDAQCyBQAh0gMBALsFACHTAwEAuwUAIQfsAkAAAAAB-AIBAAAAAf4CQAAAAAHHA0AAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAABBCsAALgIADDiAwAAuQgAMOQDAAC7CAAg6AMAALwIADAEKwAArAgAMOIDAACtCAAw5AMAAK8IACDoAwAAsAgAMAMrAACnCAAg4gMAAKgIACDoAwAAuQEAIAMrAACiCAAg4gMAAKMIACDoAwAAiQMAIAQrAACWCAAw4gMAAJcIADDkAwAAmQgAIOgDAACaCAAwAAADAwAAoQYAIJIDAAC3BQAgwQMAALcFACADAwAAoQYAIBkAAKIGACCSAwAAtwUAIAAAAAUDAAChBgAgGQAAzggAIBsAAM8IACCSAwAAtwUAIJ8DAAC3BQAgBg8AANIIACAYAACiBgAgHAAAzggAIB0AANcIACCSAwAAtwUAILADAAC3BQAgCgwAANkIACANAADaCAAgDgAA2wgAIBQAANgIACAWAADLBQAgFwAA3AgAIPsCAAC3BQAgkgMAALcFACC6AwAAtwUAILwDAAC3BQAgAAMKAADLBQAg-wIAALcFACD8AgAAtwUAIAMOAADXCAAgEQAA1ggAIBQAANgIACACDwAA0ggAIBAAANMIACAAAAUIAADZCAAgCQAA3QgAIAoAAL0HACCSAwAAtwUAIL0DAAC3BQAgBwoAAL0HACD7AgAAtwUAIJIDAAC3BQAgogMAALcFACCjAwAAtwUAIKQDAAC3BQAgpQMAALcFACAAAAAH7AJAAAAAAfgCAQAAAAH-AkAAAAABxwNAAAAAAdEDAQAAAAHSAwEAAAAB0wMBAAAAAQzsAkAAAAAB-AIBAAAAAf4CQAAAAAHIAwEAAAAByQMBAAAAAcoDAQAAAAHLAwEAAAABzAMBAAAAAc0DQAAAAAHOA0AAAAABzwMBAAAAAdADAQAAAAES7AJAAAAAAfgCAQAAAAH-AkAAAAABiQMAAACWAwKLAyAAAAABkgNAAAAAAZMDAQAAAAGWAxAAAAABlwMQAAAAAZgDEAAAAAGZAxAAAAABmgMQAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAARAFAADFCAAgBgAAxggAIAcAAMcIACAeAADICAAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB_gJAAAAAAYkDAAAA2gMCiwMgAAAAAZIDQAAAAAHUAwEAAAAB1QMgAAAAAdYDAQAAAAHYAwAAANgDAtoDIAAAAAECAAAAAQAgKwAA4QgAIAMAAABeACArAADhCAAgLAAA5QgAIBIAAABeACAFAACSCAAgBgAAkwgAIAcAAJQIACAeAACVCAAgJAAA5QgAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIf4CQACxBQAhiQMAAJAI2gMiiwMgALwFACGSA0AA1AUAIdQDAQCyBQAh1QMgALwFACHWAwEAuwUAIdgDAACPCNgDItoDIAC8BQAhEAUAAJIIACAGAACTCAAgBwAAlAgAIB4AAJUIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH-AkAAsQUAIYkDAACQCNoDIosDIAC8BQAhkgNAANQFACHUAwEAsgUAIdUDIAC8BQAh1gMBALsFACHYAwAAjwjYAyLaAyAAvAUAIRAEAADECAAgBgAAxggAIAcAAMcIACAeAADICAAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB_gJAAAAAAYkDAAAA2gMCiwMgAAAAAZIDQAAAAAHUAwEAAAAB1QMgAAAAAdYDAQAAAAHYAwAAANgDAtoDIAAAAAECAAAAAQAgKwAA5ggAIAMAAABeACArAADmCAAgLAAA6ggAIBIAAABeACAEAACRCAAgBgAAkwgAIAcAAJQIACAeAACVCAAgJAAA6ggAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIf4CQACxBQAhiQMAAJAI2gMiiwMgALwFACGSA0AA1AUAIdQDAQCyBQAh1QMgALwFACHWAwEAuwUAIdgDAACPCNgDItoDIAC8BQAhEAQAAJEIACAGAACTCAAgBwAAlAgAIB4AAJUIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH-AkAAsQUAIYkDAACQCNoDIosDIAC8BQAhkgNAANQFACHUAwEAsgUAIdUDIAC8BQAh1gMBALsFACHYAwAAjwjYAyLaAyAAvAUAIRAEAADECAAgBQAAxQgAIAcAAMcIACAeAADICAAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB_gJAAAAAAYkDAAAA2gMCiwMgAAAAAZIDQAAAAAHUAwEAAAAB1QMgAAAAAdYDAQAAAAHYAwAAANgDAtoDIAAAAAECAAAAAQAgKwAA6wgAIAMAAABeACArAADrCAAgLAAA7wgAIBIAAABeACAEAACRCAAgBQAAkggAIAcAAJQIACAeAACVCAAgJAAA7wgAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIf4CQACxBQAhiQMAAJAI2gMiiwMgALwFACGSA0AA1AUAIdQDAQCyBQAh1QMgALwFACHWAwEAuwUAIdgDAACPCNgDItoDIAC8BQAhEAQAAJEIACAFAACSCAAgBwAAlAgAIB4AAJUIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH-AkAAsQUAIYkDAACQCNoDIosDIAC8BQAhkgNAANQFACHUAwEAsgUAIdUDIAC8BQAh1gMBALsFACHYAwAAjwjYAyLaAyAAvAUAIQoIAAD5BwAgCgAA-AcAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAG9AwEAAAABAgAAABYAICsAAPAIACAH7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAQvsAkAAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAf4CQAAAAAGJAwAAALwDAosDIAAAAAGSA0AAAAABugMBAAAAAbwDAQAAAAEDAAAAEwAgKwAA8AgAICwAAPYIACAMAAAAEwAgCAAA3wcAIAoAAOEHACAkAAD2CAAg7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH-AkAAsQUAIYsDIAC8BQAhkgNAANQFACG9AwEAuwUAIQoIAADfBwAgCgAA4QcAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhvQMBALsFACEM7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAGiAwEAAAABowMBAAAAAaQDAQAAAAGlAwEAAAABAgAAAPECACArAAD3CAAgAwAAAB4AICsAAPcIACAsAAD7CAAgDgAAAB4AICQAAPsIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGLAyAAvAUAIZIDQADUBQAhogMBALsFACGjAwEAuwUAIaQDAQC7BQAhpQMBALsFACEM7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH7AgEAuwUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIaIDAQC7BQAhowMBALsFACGkAwEAuwUAIaUDAQC7BQAhEQwAALcHACANAADbBwAgFAAAuQcAIBYAALoHACAXAAC7BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH-AkAAAAABiQMAAAC8AwKLAyAAAAABkgNAAAAAAbkDAQAAAAG6AwEAAAABvAMBAAAAAQIAAAAaACArAAD8CAAgAwAAABgAICsAAPwIACAsAACACQAgEwAAABgAIAwAALMGACANAADaBwAgFAAAtQYAIBYAALYGACAXAAC3BgAgJAAAgAkAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH-AkAAsQUAIYkDAACxBrwDIosDIAC8BQAhkgNAANQFACG5AwEAsgUAIboDAQC7BQAhvAMBALsFACERDAAAswYAIA0AANoHACAUAAC1BgAgFgAAtgYAIBcAALcGACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGJAwAAsQa8AyKLAyAAvAUAIZIDQADUBQAhuQMBALIFACG6AwEAuwUAIbwDAQC7BQAhEQwAALcHACANAADbBwAgDgAAuAcAIBQAALkHACAWAAC6BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH-AkAAAAABiQMAAAC8AwKLAyAAAAABkgNAAAAAAbkDAQAAAAG6AwEAAAABvAMBAAAAAQIAAAAaACArAACBCQAgAwAAABgAICsAAIEJACAsAACFCQAgEwAAABgAIAwAALMGACANAADaBwAgDgAAtAYAIBQAALUGACAWAAC2BgAgJAAAhQkAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH-AkAAsQUAIYkDAACxBrwDIosDIAC8BQAhkgNAANQFACG5AwEAsgUAIboDAQC7BQAhvAMBALsFACERDAAAswYAIA0AANoHACAOAAC0BgAgFAAAtQYAIBYAALYGACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGJAwAAsQa8AyKLAyAAvAUAIZIDQADUBQAhuQMBALIFACG6AwEAuwUAIbwDAQC7BQAhBA8AAM8HACDqAgEAAAAB-AIBAAAAAfkCAQAAAAECAAAAPwAgKwAAhgkAIAMAAAA9ACArAACGCQAgLAAAigkAIAYAAAA9ACAPAADOBwAgJAAAigkAIOoCAQCyBQAh-AIBALIFACH5AgEAsgUAIQQPAADOBwAg6gIBALIFACH4AgEAsgUAIfkCAQCyBQAhCggAAPkHACAJAAD3BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAb0DAQAAAAECAAAAFgAgKwAAiwkAIAfsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABkAMCAAAAAZIDQAAAAAGhAwEAAAABC-wCQAAAAAH4AgEAAAAB_gJAAAAAAYIDAQAAAAGLAyAAAAABjQMBAAAAAY4DAQAAAAGPAxAAAAABkAMCAAAAAZEDEAAAAAGSA0AAAAABBREAAMoHACAUAADvBgAg-AIBAAAAAa0DAQAAAAGuAwEAAAABAgAAAC0AICsAAI8JACADAAAAKgAgKwAAjwkAICwAAJMJACAHAAAAKgAgEQAAyQcAIBQAANAGACAkAACTCQAg-AIBALIFACGtAwEAsgUAIa4DAQCyBQAhBREAAMkHACAUAADQBgAg-AIBALIFACGtAwEAsgUAIa4DAQCyBQAhAaYDAQAAAAEL7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAY4DAQAAAAGSA0AAAAABqwMCAAAAAa8DEAAAAAGwAxAAAAABsQMCAAAAAbIDgAAAAAEFDgAA7gYAIBEAAMoHACD4AgEAAAABrQMBAAAAAa4DAQAAAAECAAAALQAgKwAAlgkAIAMAAAAqACArAACWCQAgLAAAmgkAIAcAAAAqACAOAADPBgAgEQAAyQcAICQAAJoJACD4AgEAsgUAIa0DAQCyBQAhrgMBALIFACEFDgAAzwYAIBEAAMkHACD4AgEAsgUAIa0DAQCyBQAhrgMBALIFACEM7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAgAAAAGsAwEAAAABAusCAQAAAAHsAkAAAAABDw8AANYHACAYAACzBwAgHAAAtAcAIOoCAQAAAAHsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABjgMBAAAAAZIDQAAAAAGrAwIAAAABrwMQAAAAAbADEAAAAAGxAwIAAAABsgOAAAAAAQIAAAAkACArAACdCQAgAwAAACIAICsAAJ0JACAsAAChCQAgEQAAACIAIA8AANUHACAYAACSBwAgHAAAkwcAICQAAKEJACDqAgEAsgUAIewCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjgMBALIFACGSA0AA1AUAIasDAgDcBQAhrwMQANIFACGwAxAAkAcAIbEDAgDcBQAhsgOAAAAAAQ8PAADVBwAgGAAAkgcAIBwAAJMHACDqAgEAsgUAIewCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjgMBALIFACGSA0AA1AUAIasDAgDcBQAhrwMQANIFACGwAxAAkAcAIbEDAgDcBQAhsgOAAAAAAQGMAwEAAAABEQwAALcHACANAADbBwAgDgAAuAcAIBYAALoHACAXAAC7BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH-AkAAAAABiQMAAAC8AwKLAyAAAAABkgNAAAAAAbkDAQAAAAG6AwEAAAABvAMBAAAAAQIAAAAaACArAACjCQAgAwAAABgAICsAAKMJACAsAACnCQAgEwAAABgAIAwAALMGACANAADaBwAgDgAAtAYAIBYAALYGACAXAAC3BgAgJAAApwkAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH-AkAAsQUAIYkDAACxBrwDIosDIAC8BQAhkgNAANQFACG5AwEAsgUAIboDAQC7BQAhvAMBALsFACERDAAAswYAIA0AANoHACAOAAC0BgAgFgAAtgYAIBcAALcGACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGJAwAAsQa8AyKLAyAAvAUAIZIDQADUBQAhuQMBALIFACG6AwEAuwUAIbwDAQC7BQAhDOoCAQAAAAHsAkAAAAAB-AIBAAAAAf4CQAAAAAGLAyAAAAABkgNAAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwIAAAABrAMBAAAAAQL4AgEAAAABrgMBAAAAAQL4AgEAAAAB-QIBAAAAAQMAAAATACArAACLCQAgLAAArQkAIAwAAAATACAIAADfBwAgCQAA4AcAICQAAK0JACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIb0DAQC7BQAhCggAAN8HACAJAADgBwAg7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH-AkAAsQUAIYsDIAC8BQAhkgNAANQFACG9AwEAuwUAIQvsAkAAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAf4CQAAAAAGJAwAAALwDAosDIAAAAAGSA0AAAAABuQMBAAAAAbwDAQAAAAEQBAAAxAgAIAUAAMUIACAGAADGCAAgHgAAyAgAIOwCQAAAAAH4AgEAAAAB-QIBAAAAAf4CQAAAAAGJAwAAANoDAosDIAAAAAGSA0AAAAAB1AMBAAAAAdUDIAAAAAHWAwEAAAAB2AMAAADYAwLaAyAAAAABAgAAAAEAICsAAK8JACAH7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAYwDAQAAAAGQAwIAAAABkgNAAAAAAQMAAABeACArAACvCQAgLAAAtAkAIBIAAABeACAEAACRCAAgBQAAkggAIAYAAJMIACAeAACVCAAgJAAAtAkAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIf4CQACxBQAhiQMAAJAI2gMiiwMgALwFACGSA0AA1AUAIdQDAQCyBQAh1QMgALwFACHWAwEAuwUAIdgDAACPCNgDItoDIAC8BQAhEAQAAJEIACAFAACSCAAgBgAAkwgAIB4AAJUIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH-AkAAsQUAIYkDAACQCNoDIosDIAC8BQAhkgNAANQFACHUAwEAsgUAIdUDIAC8BQAh1gMBALsFACHYAwAAjwjYAyLaAyAAvAUAIQ8PAADWBwAgHAAAtAcAIB0AALUHACDqAgEAAAAB7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAY4DAQAAAAGSA0AAAAABqwMCAAAAAa8DEAAAAAGwAxAAAAABsQMCAAAAAbIDgAAAAAECAAAAJAAgKwAAtQkAIAcDAACfBgAg7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAZIDQAAAAAGUAwEAAAABAgAAAIkDACArAAC3CQAgAwAAACIAICsAALUJACAsAAC7CQAgEQAAACIAIA8AANUHACAcAACTBwAgHQAAlAcAICQAALsJACDqAgEAsgUAIewCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjgMBALIFACGSA0AA1AUAIasDAgDcBQAhrwMQANIFACGwAxAAkAcAIbEDAgDcBQAhsgOAAAAAAQ8PAADVBwAgHAAAkwcAIB0AAJQHACDqAgEAsgUAIewCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhjgMBALIFACGSA0AA1AUAIasDAgDcBQAhrwMQANIFACGwAxAAkAcAIbEDAgDcBQAhsgOAAAAAAQMAAAANACArAAC3CQAgLAAAvgkAIAkAAAANACADAACRBgAgJAAAvgkAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYsDIAC8BQAhkgNAANQFACGUAwEAsgUAIQcDAACRBgAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGSA0AA1AUAIZQDAQCyBQAhEAQAAMQIACAFAADFCAAgBgAAxggAIAcAAMcIACDsAkAAAAAB-AIBAAAAAfkCAQAAAAH-AkAAAAABiQMAAADaAwKLAyAAAAABkgNAAAAAAdQDAQAAAAHVAyAAAAAB1gMBAAAAAdgDAAAA2AMC2gMgAAAAAQIAAAABACArAAC_CQAgC-wCQAAAAAH4AgEAAAAB_gJAAAAAAYsDIAAAAAGMAwEAAAABjQMBAAAAAY4DAQAAAAGPAxAAAAABkAMCAAAAAZEDEAAAAAGSA0AAAAABCuwCQAAAAAH4AgEAAAAB_gJAAAAAAYQDAAAAhAMChQMBAAAAAYYDAQAAAAGHAxAAAAABiQMAAACJAwKKA0AAAAABiwMgAAAAAQMAAABeACArAAC_CQAgLAAAxQkAIBIAAABeACAEAACRCAAgBQAAkggAIAYAAJMIACAHAACUCAAgJAAAxQkAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIf4CQACxBQAhiQMAAJAI2gMiiwMgALwFACGSA0AA1AUAIdQDAQCyBQAh1QMgALwFACHWAwEAuwUAIdgDAACPCNgDItoDIAC8BQAhEAQAAJEIACAFAACSCAAgBgAAkwgAIAcAAJQIACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH-AkAAsQUAIYkDAACQCNoDIosDIAC8BQAhkgNAANQFACHUAwEAsgUAIdUDIAC8BQAh1gMBALsFACHYAwAAjwjYAyLaAyAAvAUAIQ8PAADWBwAgGAAAswcAIB0AALUHACDqAgEAAAAB7AJAAAAAAfgCAQAAAAH-AkAAAAABiwMgAAAAAY4DAQAAAAGSA0AAAAABqwMCAAAAAa8DEAAAAAGwAxAAAAABsQMCAAAAAbIDgAAAAAECAAAAJAAgKwAAxgkAIBUDAACCBgAgGwAAhAYAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYkDAAAAlgMCiwMgAAAAAZIDQAAAAAGTAwEAAAABlAMBAAAAAZYDEAAAAAGXAxAAAAABmAMQAAAAAZkDEAAAAAGaAxAAAAABmwMBAAAAAZwDAQAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABAgAAAFgAICsAAMgJACADAAAAIgAgKwAAxgkAICwAAMwJACARAAAAIgAgDwAA1QcAIBgAAJIHACAdAACUBwAgJAAAzAkAIOoCAQCyBQAh7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGOAwEAsgUAIZIDQADUBQAhqwMCANwFACGvAxAA0gUAIbADEACQBwAhsQMCANwFACGyA4AAAAABDw8AANUHACAYAACSBwAgHQAAlAcAIOoCAQCyBQAh7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiwMgALwFACGOAwEAsgUAIZIDQADUBQAhqwMCANwFACGvAxAA0gUAIbADEACQBwAhsQMCANwFACGyA4AAAAABAwAAAFYAICsAAMgJACAsAADPCQAgFwAAAFYAIAMAAOcFACAbAADpBQAgJAAAzwkAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYkDAADmBZYDIosDIAC8BQAhkgNAANQFACGTAwEAsgUAIZQDAQCyBQAhlgMQANIFACGXAxAA0gUAIZgDEADSBQAhmQMQANIFACGaAxAA0gUAIZsDAQCyBQAhnAMBALIFACGdAwEAsgUAIZ4DAQCyBQAhnwMBALsFACGgAwEAsgUAIRUDAADnBQAgGwAA6QUAIOwCQACxBQAh-AIBALIFACH-AkAAsQUAIYkDAADmBZYDIosDIAC8BQAhkgNAANQFACGTAwEAsgUAIZQDAQCyBQAhlgMQANIFACGXAxAA0gUAIZgDEADSBQAhmQMQANIFACGaAxAA0gUAIZsDAQCyBQAhnAMBALIFACGdAwEAsgUAIZ4DAQCyBQAhnwMBALsFACGgAwEAsgUAIRUDAACCBgAgGQAAgwYAIOwCQAAAAAH4AgEAAAAB_gJAAAAAAYkDAAAAlgMCiwMgAAAAAZIDQAAAAAGTAwEAAAABlAMBAAAAAZYDEAAAAAGXAxAAAAABmAMQAAAAAZkDEAAAAAGaAxAAAAABmwMBAAAAAZwDAQAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABAgAAAFgAICsAANAJACADAAAAVgAgKwAA0AkAICwAANQJACAXAAAAVgAgAwAA5wUAIBkAAOgFACAkAADUCQAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiQMAAOYFlgMiiwMgALwFACGSA0AA1AUAIZMDAQCyBQAhlAMBALIFACGWAxAA0gUAIZcDEADSBQAhmAMQANIFACGZAxAA0gUAIZoDEADSBQAhmwMBALIFACGcAwEAsgUAIZ0DAQCyBQAhngMBALIFACGfAwEAuwUAIaADAQCyBQAhFQMAAOcFACAZAADoBQAg7AJAALEFACH4AgEAsgUAIf4CQACxBQAhiQMAAOYFlgMiiwMgALwFACGSA0AA1AUAIZMDAQCyBQAhlAMBALIFACGWAxAA0gUAIZcDEADSBQAhmAMQANIFACGZAxAA0gUAIZoDEADSBQAhmwMBALIFACGcAwEAsgUAIZ0DAQCyBQAhngMBALIFACGfAwEAuwUAIaADAQCyBQAhAuoCAQAAAAHsAkAAAAABCOwCQAAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAf0CIAAAAAH-AkAAAAABAgAAAPkDACArAADWCQAgEQwAALcHACANAADbBwAgDgAAuAcAIBQAALkHACAXAAC7BwAg7AJAAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH-AkAAAAABiQMAAAC8AwKLAyAAAAABkgNAAAAAAbkDAQAAAAG6AwEAAAABvAMBAAAAAQIAAAAaACArAADYCQAgAwAAAPwDACArAADWCQAgLAAA3AkAIAoAAAD8AwAgJAAA3AkAIOwCQACxBQAh-AIBALIFACH5AgEAsgUAIfoCAQCyBQAh-wIBALsFACH8AgEAuwUAIf0CIAC8BQAh_gJAALEFACEI7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH7AgEAuwUAIfwCAQC7BQAh_QIgALwFACH-AkAAsQUAIQMAAAAYACArAADYCQAgLAAA3wkAIBMAAAAYACAMAACzBgAgDQAA2gcAIA4AALQGACAUAAC1BgAgFwAAtwYAICQAAN8JACDsAkAAsQUAIfgCAQCyBQAh-QIBALIFACH6AgEAsgUAIfsCAQC7BQAh_gJAALEFACGJAwAAsQa8AyKLAyAAvAUAIZIDQADUBQAhuQMBALIFACG6AwEAuwUAIbwDAQC7BQAhEQwAALMGACANAADaBwAgDgAAtAYAIBQAALUGACAXAAC3BgAg7AJAALEFACH4AgEAsgUAIfkCAQCyBQAh-gIBALIFACH7AgEAuwUAIf4CQACxBQAhiQMAALEGvAMiiwMgALwFACGSA0AA1AUAIbkDAQCyBQAhugMBALsFACG8AwEAuwUAIQYEBgIFCgMGDAQHDgULAB0eWRgBAwABAQMAAQEDAAEDAwABCwAcGRIGAgcABRIABwULABsPAAgYRQYcSRcdUREHCwAWDAAJDR8LDiUHFCkNFjoTF0APBAgUCQkXCQobCAsACgIJHAAKHQACCiAICwAMAQohAAIPAAgTKw4ECwASDjMREQAPFDQNAwsAEA8ACBAuDgEQLwACEgAHEwAOAg41ABQ2AAIPAAgVABQCCjsTCwAVAQo8AAQOQQAUQgAWQwAXRAACEgAHGgAYBAMAAQsAGhlKFxtOGQEaABgCGU8AG1AAAxhSABxTAB1UAAEZVQADBFoABVsAHlwAAAAAAwsAIjEAIzIAJAAAAAMLACIxACMyACQBAwABAQMAAQMLACkxACoyACsAAAADCwApMQAqMgArAQMAAQEDAAEDCwAwMQAxMgAyAAAAAwsAMDEAMTIAMgAAAAMLADgxADkyADoAAAADCwA4MQA5MgA6AQMAAQEDAAEDCwA_MQBAMgBBAAAAAwsAPzEAQDIAQQEI2wEJAQjhAQkDCwBGMQBHMgBIAAAAAwsARjEARzIASAIMAAkN8wELAgwACQ35AQsDCwBNMQBOMgBPAAAAAwsATTEATjIATwEPAAgBDwAIBQsAVDEAVzIAWKMBAFWkAQBWAAAAAAAFCwBUMQBXMgBYowEAVaQBAFYBDwAIAQ8ACAMLAF0xAF4yAF8AAAADCwBdMQBeMgBfAREADwERAA8DCwBkMQBlMgBmAAAAAwsAZDEAZTIAZgISAAcTAA4CEgAHEwAOAwsAazEAbDIAbQAAAAMLAGsxAGwyAG0CDwAIE-MCDgIPAAgT6QIOBQsAcjEAdTIAdqMBAHOkAQB0AAAAAAAFCwByMQB1MgB2owEAc6QBAHQAAAMLAHsxAHwyAH0AAAADCwB7MQB8MgB9AQMAAQEDAAEDCwCCATEAgwEyAIQBAAAAAwsAggExAIMBMgCEAQIHAAUSAAcCBwAFEgAHBQsAiQExAIwBMgCNAaMBAIoBpAEAiwEAAAAAAAULAIkBMQCMATIAjQGjAQCKAaQBAIsBAQMAAQEDAAEFCwCSATEAlQEyAJYBowEAkwGkAQCUAQAAAAAABQsAkgExAJUBMgCWAaMBAJMBpAEAlAECEgAHGgAYAhIABxoAGAULAJsBMQCeATIAnwGjAQCcAaQBAJ0BAAAAAAAFCwCbATEAngEyAJ8BowEAnAGkAQCdAQEaABgBGgAYBQsApAExAKcBMgCoAaMBAKUBpAEApgEAAAAAAAULAKQBMQCnATIAqAGjAQClAaQBAKYBAAADCwCtATEArgEyAK8BAAAAAwsArQExAK4BMgCvAQIPAAgVABQCDwAIFQAUAwsAtAExALUBMgC2AQAAAAMLALQBMQC1ATIAtgEfAgEgXQEhYAEiYQEjYgElZAEmZh4nZx8oaQEpax4qbCAtbQEubgEvbx4zciE0cyU1dAI2dQI3dgI4dwI5eAI6egI7fB48fSY9fwI-gQEeP4IBJ0CDAQJBhAECQoUBHkOIAShEiQEsRYoBA0aLAQNHjAEDSI0BA0mOAQNKkAEDS5IBHkyTAS1NlQEDTpcBHk-YAS5QmQEDUZoBA1KbAR5TngEvVJ8BM1WhATRWogE0V6UBNFimATRZpwE0WqkBNFurAR5crAE1Xa4BNF6wAR5fsQE2YLIBNGGzATRitAEeY7cBN2S4ATtlugEEZrsBBGe9AQRovgEEab8BBGrBAQRrwwEebMQBPG3GAQRuyAEeb8kBPXDKAQRxywEEcswBHnPPAT500AFCddEBCXbSAQl30wEJeNQBCXnVAQl61wEJe9kBHnzaAUN93QEJft8BHn_gAUSAAeIBCYEB4wEJggHkAR6DAecBRYQB6AFJhQHpAQiGAeoBCIcB6wEIiAHsAQiJAe0BCIoB7wEIiwHxAR6MAfIBSo0B9QEIjgH3AR6PAfgBS5AB-gEIkQH7AQiSAfwBHpMB_wFMlAGAAlCVAYECB5YBggIHlwGDAgeYAYQCB5kBhQIHmgGHAgebAYkCHpwBigJRnQGMAgeeAY4CHp8BjwJSoAGQAgehAZECB6IBkgIepQGVAlOmAZYCWacBlwIPqAGYAg-pAZkCD6oBmgIPqwGbAg-sAZ0CD60BnwIergGgAlqvAaICD7ABpAIesQGlAluyAaYCD7MBpwIPtAGoAh61AasCXLYBrAJgtwGtAg64Aa4CDrkBrwIOugGwAg67AbECDrwBswIOvQG1Ah6-AbYCYb8BuAIOwAG6Ah7BAbsCYsIBvAIOwwG9Ag7EAb4CHsUBwQJjxgHCAmfHAcMCEcgBxAIRyQHFAhHKAcYCEcsBxwIRzAHJAhHNAcsCHs4BzAJozwHOAhHQAdACHtEB0QJp0gHSAhHTAdMCEdQB1AIe1QHXAmrWAdgCbtcB2QIN2AHaAg3ZAdsCDdoB3AIN2wHdAg3cAd8CDd0B4QIe3gHiAm_fAeUCDeAB5wIe4QHoAnDiAeoCDeMB6wIN5AHsAh7lAe8CceYB8AJ35wHyAgvoAfMCC-kB9QIL6gH2AgvrAfcCC-wB-QIL7QH7Ah7uAfwCeO8B_gIL8AGAAx7xAYEDefIBggML8wGDAwv0AYQDHvUBhwN69gGIA373AYoDBfgBiwMF-QGNAwX6AY4DBfsBjwMF_AGRAwX9AZMDHv4BlAN__wGWAwWAApgDHoECmQOAAYICmgMFgwKbAwWEApwDHoUCnwOBAYYCoAOFAYcCoQMGiAKiAwaJAqMDBooCpAMGiwKlAwaMAqcDBo0CqQMejgKqA4YBjwKsAwaQAq4DHpECrwOHAZICsAMGkwKxAwaUArIDHpUCtQOIAZYCtgOOAZcCtwMYmAK4AxiZArkDGJoCugMYmwK7AxicAr0DGJ0CvwMengLAA48BnwLCAxigAsQDHqECxQOQAaICxgMYowLHAxikAsgDHqUCywORAaYCzAOXAacCzQMXqALOAxepAs8DF6oC0AMXqwLRAxesAtMDF60C1QMergLWA5gBrwLYAxewAtoDHrEC2wOZAbIC3AMXswLdAxe0At4DHrUC4QOaAbYC4gOgAbcC4wMZuALkAxm5AuUDGboC5gMZuwLnAxm8AukDGb0C6wMevgLsA6EBvwLuAxnAAvADHsEC8QOiAcIC8gMZwwLzAxnEAvQDHsUC9wOjAcYC-AOpAccC-gMUyAL7AxTJAv4DFMoC_wMUywKABBTMAoIEFM0ChAQezgKFBKoBzwKHBBTQAokEHtECigSrAdICiwQU0wKMBBTUAo0EHtUCkASsAdYCkQSwAdcCkgQT2AKTBBPZApQEE9oClQQT2wKWBBPcApgEE90CmgQe3gKbBLEB3wKdBBPgAp8EHuECoASyAeICoQQT4wKiBBPkAqMEHuUCpgSzAeYCpwS3AQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AddressScalarFieldEnum: () => AddressScalarFieldEnum,
  AnyNull: () => AnyNull2,
  BrandScalarFieldEnum: () => BrandScalarFieldEnum,
  CartItemScalarFieldEnum: () => CartItemScalarFieldEnum,
  CartScalarFieldEnum: () => CartScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  CollectionScalarFieldEnum: () => CollectionScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  JsonNullValueInput: () => JsonNullValueInput,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OptionValueScalarFieldEnum: () => OptionValueScalarFieldEnum,
  OrderItemScalarFieldEnum: () => OrderItemScalarFieldEnum,
  OrderScalarFieldEnum: () => OrderScalarFieldEnum,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  ProductCollectionScalarFieldEnum: () => ProductCollectionScalarFieldEnum,
  ProductImageScalarFieldEnum: () => ProductImageScalarFieldEnum,
  ProductOptionScalarFieldEnum: () => ProductOptionScalarFieldEnum,
  ProductScalarFieldEnum: () => ProductScalarFieldEnum,
  ProductVariantScalarFieldEnum: () => ProductVariantScalarFieldEnum,
  QueryMode: () => QueryMode,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VariantOptionValueScalarFieldEnum: () => VariantOptionValueScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Address: "Address",
  Category: "Category",
  Product: "Product",
  ProductVariant: "ProductVariant",
  ProductOption: "ProductOption",
  OptionValue: "OptionValue",
  VariantOptionValue: "VariantOptionValue",
  ProductImage: "ProductImage",
  Brand: "Brand",
  Cart: "Cart",
  CartItem: "CartItem",
  Order: "Order",
  OrderItem: "OrderItem",
  Payment: "Payment",
  Collection: "Collection",
  ProductCollection: "ProductCollection"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  role: "role",
  status: "status",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AddressScalarFieldEnum = {
  id: "id",
  userId: "userId",
  fullName: "fullName",
  phone: "phone",
  address1: "address1",
  address2: "address2",
  city: "city",
  upozila: "upozila",
  district: "district",
  country: "country",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  parentId: "parentId",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var ProductScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  categoryId: "categoryId",
  brandId: "brandId",
  status: "status",
  imageAttribute: "imageAttribute",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var ProductVariantScalarFieldEnum = {
  id: "id",
  productId: "productId",
  sku: "sku",
  price: "price",
  compareAtPrice: "compareAtPrice",
  stockQuantity: "stockQuantity",
  attributes: "attributes",
  position: "position",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var ProductOptionScalarFieldEnum = {
  id: "id",
  name: "name",
  productId: "productId"
};
var OptionValueScalarFieldEnum = {
  id: "id",
  optionId: "optionId",
  value: "value"
};
var VariantOptionValueScalarFieldEnum = {
  variantId: "variantId",
  optionValueId: "optionValueId"
};
var ProductImageScalarFieldEnum = {
  id: "id",
  productId: "productId",
  optionValueId: "optionValueId",
  url: "url",
  urlName: "urlName",
  publicId: "publicId",
  type: "type",
  position: "position",
  groupValue: "groupValue",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var BrandScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  logoUrl: "logoUrl",
  logoUrlPublicId: "logoUrlPublicId",
  logoUrlName: "logoUrlName",
  logoUrlType: "logoUrlType",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var CartScalarFieldEnum = {
  id: "id",
  userId: "userId",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var CartItemScalarFieldEnum = {
  id: "id",
  cartId: "cartId",
  variantId: "variantId",
  quantity: "quantity",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var OrderScalarFieldEnum = {
  id: "id",
  orderNumber: "orderNumber",
  userId: "userId",
  status: "status",
  subtotal: "subtotal",
  discountTotal: "discountTotal",
  shippingFee: "shippingFee",
  tax: "tax",
  grandTotal: "grandTotal",
  shippingName: "shippingName",
  shippingPhone: "shippingPhone",
  shippingAddress: "shippingAddress",
  shippingCity: "shippingCity",
  shippingPostalCode: "shippingPostalCode",
  shippingCountry: "shippingCountry",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var OrderItemScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  variantId: "variantId",
  productName: "productName",
  sku: "sku",
  unitPrice: "unitPrice",
  quantity: "quantity",
  totalPrice: "totalPrice",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  method: "method",
  provider: "provider",
  transactionId: "transactionId",
  amount: "amount",
  status: "status",
  paidAt: "paidAt",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CollectionScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  imageUrl: "imageUrl",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ProductCollectionScalarFieldEnum = {
  productId: "productId",
  collectionId: "collectionId",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var JsonNullValueInput = {
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/enums.ts
var UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
  MODERATOR: "MODERATOR"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BANNED: "BANNED"
};

// src/generated/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    __publicField(this, "statusCode");
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/config/env.ts
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "FRONTEND_URL",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    }
  };
};
var envVars = loadEnvVariables();

// src/app/errorHelpers/handlePrismaErrors.ts
import status2 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status2.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status2.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status2.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status2.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status2.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status2.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status2.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status2.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status2.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status2.INTERNAL_SERVER_ERROR;
  }
  return status2.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status2.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch?.[1] ?? "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status2.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status2.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [
    {
      path: "Rust Engine Crashed",
      message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
    }
  ];
  return {
    success: false,
    statusCode: status2.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/errorHelpers/handleZodError.ts
import status3 from "http-status";
var handelZodError = (err) => {
  const statusCode = status3.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: true,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let errorSources = [];
  let statusCode = status4.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handelZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status4.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    ...envVars.NODE_ENV === "development" && { error: err },
    ...envVars.NODE_ENV === "development" && stack && { stack }
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/middleware/notFound.ts
import status5 from "http-status";
var notFound = (req, res) => {
  res.status(status5.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app/routes/index.ts
import { Router as Router5 } from "express";

// src/app/modules/auth/auth.routes.ts
import { Router } from "express";

// src/app/middleware/auth.ts
import status6 from "http-status";

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/middleware/auth.ts
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1] || null;
    }
    if (!token) {
      token = req.cookies?.accessToken;
    }
    if (!token) {
      throw new AppError_default(status6.UNAUTHORIZED, "Unauthorized access!");
    }
    const verifiedToken = jwtUtils.verifyToken(
      token,
      envVars.ACCESS_TOKEN_SECRET
    );
    if (!verifiedToken.success) {
      throw new AppError_default(
        status6.UNAUTHORIZED,
        "Invalid access token."
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: verifiedToken.data.userId
      }
    });
    if (!user) {
      throw new AppError_default(status6.UNAUTHORIZED, "User not found.");
    }
    if (user.isDeleted) {
      throw new AppError_default(status6.UNAUTHORIZED, "User deleted.");
    }
    if (user.status === "BANNED") {
      throw new AppError_default(status6.UNAUTHORIZED, "User banned.");
    }
    if (authRoles.length && !authRoles.includes(user.role)) {
      throw new AppError_default(status6.FORBIDDEN, "Forbidden access.");
    }
    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/modules/auth/auth.controller.ts
import status9 from "http-status";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";

// src/app/utils/email.ts
import ejs from "ejs";
import status7 from "http-status";
import nodemailer from "nodemailer";
import path2 from "path";
var port = Number(envVars.EMAIL_SENDER.SMTP_PORT);
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: port === 465,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments
}) => {
  try {
    const templatePath = path2.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`
    );
    const html = await ejs.renderFile(templatePath, {
      ...templateData,
      subject
    });
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(
      status7.INTERNAL_SERVER_ERROR,
      "Failed to send email"
    );
  }
};

// src/lib/auth.ts
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.USER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(
              `User with email ${email} not found. Cannot send verification OTP.`
            );
            return;
          }
          if (user && user.role === UserRole.ADMIN) {
            console.log(
              `User with email ${email} is Admin. Skipping sending verification OTP.`
            );
            return;
          }
          if (user && !user.emailVerified) {
            await sendEmail({
              to: email,
              subject: "Verify Email OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            await sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:5000",
    envVars.FRONTEND_URL
  ],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/modules/auth/auth.service.ts
import status8 from "http-status";
var registerUser = async (payload) => {
  const { name, email, password } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (isUserExist) {
    throw new AppError_default(status8.BAD_REQUEST, "User already exists");
  }
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
    }
  });
  return data;
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BANNED) {
    throw new AppError_default(status8.FORBIDDEN, "User is banned");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.INACTIVE) {
    throw new AppError_default(status8.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var getNewToken = async (refreshToken, sessionToken) => {
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken
    },
    include: {
      user: true
    }
  });
  if (!isSessionTokenExists) {
    throw new AppError_default(status8.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET
  );
  if (!verifiedRefreshToken.success && verifiedRefreshToken.error) {
    throw new AppError_default(status8.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status8.UNAUTHORIZED, "Invalid Session Token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status8.BAD_REQUEST, "Email not verified!");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.INACTIVE) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: { email }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status8.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.INACTIVE) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var googleLoginSuccess = async (session) => {
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var AuthService = {
  registerUser,
  loginUser,
  getNewToken,
  changePassword,
  logoutUser,
  forgetPassword,
  resetPassword,
  verifyEmail,
  googleLoginSuccess
};

// src/app/modules/auth/auth.controller.ts
var registerUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.registerUser(payload);
  sendResponse(res, {
    httpStatusCode: status9.CREATED,
    success: true,
    message: "User registered successfully",
    data: result
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "User Logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var verifyEmail2 = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Email verified successfully"
  });
});
var changePassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies["__Secure-better-auth.session_token"] || req.cookies["better-auth.session_token"] || req.headers["x-session-token"] || // ✅ mobile sends this
  payload.sessionToken || // ✅ or in body
  null;
  if (!betterAuthSessionToken) {
    throw new AppError_default(status9.UNAUTHORIZED, "No session token found");
  }
  const { sessionToken: _, ...cleanPayload } = payload;
  const result = await AuthService.changePassword(
    cleanPayload,
    betterAuthSessionToken
  );
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var logoutUser2 = catchAsync(async (req, res) => {
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.logoutUser(betterAuthSessionToken);
  CookieUtils.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  CookieUtils.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  CookieUtils.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "User logged out successfully",
    data: result
  });
});
var forgetPassword2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Passwrd reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Password reset successfully"
  });
});
var getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};
var getNewToken2 = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  if (!refreshToken) {
    throw new AppError_default(status9.UNAUTHORIZED, "Refresh token is missing");
  }
  const result = await AuthService.getNewToken(
    refreshToken,
    betterAuthSessionToken
  );
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "New tokens generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken
    }
  });
});
var googleLogin = catchAsync((req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL
  });
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(
      `${envVars.FRONTEND_URL}/login?error=no_session_found`
    );
  }
  if (session && !session.user) {
    return res.redirect(
      `${envVars.FRONTEND_URL}/login?error=no_user_found`
    );
  }
  const result = await AuthService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});
var handleOAuthError = catchAsync((req, res) => {
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  verifyEmail: verifyEmail2,
  changePassword: changePassword2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  getMe,
  getNewToken: getNewToken2,
  logoutUser: logoutUser2,
  handleOAuthError,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2
};

// src/app/modules/auth/auth.routes.ts
var router = Router();
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR),
  getMe
);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  checkAuth(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR),
  AuthController.changePassword
);
router.post(
  "/logout",
  checkAuth(UserRole.ADMIN, UserRole.USER, UserRole.MODERATOR),
  AuthController.logoutUser
);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
var AuthRoutes = router;

// src/app/modules/brand/brand.routes.ts
import { Router as Router2 } from "express";

// src/app/middleware/upload.ts
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage()
});

// src/app/modules/brand/brand.controller.ts
import status10 from "http-status";

// src/services/cloudinary/cloudinary.service.ts
import streamifier from "streamifier";

// src/app/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var cloudinary_default = cloudinary;

// src/services/cloudinary/cloudinary.service.ts
var CloudinaryService = class {
  async upload(file, options = {}) {
    const uploadOptions = {
      resource_type: options.resourceType ?? "image"
    };
    if (options.folder) {
      uploadOptions.folder = options.folder;
    }
    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }
    if (options.overwrite !== void 0) {
      uploadOptions.overwrite = options.overwrite;
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary_default.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Cloudinary upload failed."));
          }
          resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }
  async delete(publicId) {
    return cloudinary_default.uploader.destroy(publicId);
  }
};
var cloudinary_service_default = new CloudinaryService();

// src/app/config/cloudinary.folders.ts
var ROOT = "spark-ecommerce";
var CloudinaryFolders = {
  brand: {
    brandLogo: `${ROOT}/brand/brandLogo`
    // authoritySign: `${ROOT}/employees/AuthoritySign`,
    // employeeSign: `${ROOT}/employees/EmoloyeeSign`,
    // experience: `${ROOT}/employees/Experience`,
  },
  student: {
    profile: `${ROOT}/students/profile`,
    studentSign: `${ROOT}/students/studentSign`,
    guardianSign: `${ROOT}/students/guardianSign`,
    authoritySign: `${ROOT}/students/AuthoritySign`
  },
  product: {
    productImage: `${ROOT}/products/productImages`,
    variantImage: `${ROOT}/products/variantImages`
  }
  // add more as your project grows
};

// src/app/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    __publicField(this, "model", model);
    __publicField(this, "queryParams", queryParams);
    __publicField(this, "config", config2);
    __publicField(this, "query");
    __publicField(this, "countQuery");
    __publicField(this, "page", 1);
    __publicField(this, "limit", 10);
    __publicField(this, "skip", 0);
    __publicField(this, "sortBy", "createdAt");
    __publicField(this, "sortOrder", "desc");
    __publicField(this, "selectFields");
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => {
        if (field.includes(".")) {
          const parts = field.split(".");
          if (parts.length === 2) {
            const [relation, nestedField] = parts;
            const stringFilter2 = relation === "user" && nestedField === "email" ? {
              startsWith: searchTerm,
              mode: "insensitive"
            } : {
              contains: searchTerm,
              mode: "insensitive"
            };
            return {
              [relation]: {
                some: {
                  [nestedField]: stringFilter2
                }
              }
            };
          } else if (parts.length === 3) {
            const [relation, nestedRelation, nestedField] = parts;
            const stringFilter2 = {
              contains: searchTerm,
              mode: "insensitive"
            };
            return {
              [relation]: {
                some: {
                  [nestedRelation]: {
                    [nestedField]: stringFilter2
                  }
                }
              }
            };
          }
        }
        const stringFilter = {
          contains: searchTerm,
          mode: "insensitive"
        };
        return {
          [field]: stringFilter
        };
      });
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  // /doctors?searchTerm=john&page=1&sortBy=name&specialty=cardiology&appointmentFee[lt]=100 => {}
  // { specialty: 'cardiology', appointmentFee: { lt: '100' } }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include"
    ];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(
          value
        );
        countQueryWhere[key] = this.parseRangeFilter(
          value
        );
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = {
      ...this.query.include,
      ...relation
    };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = {
      ...this.query.include,
      ...result
    };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(
      this.query.where,
      condition
    );
    this.countQuery.where = this.deepMerge(
      this.countQuery.where,
      condition
    );
    return this;
  }
  select(select) {
    this.query.select = select;
    delete this.query.include;
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(
        this.countQuery
      ),
      this.model.findMany(
        this.query
      )
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(
      this.countQuery
    );
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(
            result[key],
            source[key]
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      if (operatorValue === void 0) {
        return;
      }
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/app/modules/brand/brand.constant.ts
var brandSearchableFields = ["name", "slug"];
var brandFilterableFields = [];

// src/app/modules/brand/brand.service.ts
var getAllBrand = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.brand, query, {
    searchableFields: brandSearchableFields,
    filterableFields: brandFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).include({
    _count: {
      select: {
        products: true
      }
    }
  }).paginate().sort().fields().execute();
  const brands = result.data;
  return {
    data: brands.map(({ _count, ...brand }) => ({
      ...brand,
      products: _count.products
    })),
    meta: result.meta
  };
};
var getBrandbyId = async (id) => {
  const result = await prisma.brand.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      _count: {
        select: {
          products: true
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(404, "Brand not found");
  }
  const { _count, ...brand } = result;
  return {
    ...brand,
    products: _count.products
  };
};
var createBrand = async (payload, files) => {
  const { name, slug, description } = payload;
  const brandLogoFile = files?.brandLogo?.[0];
  const brandLogo = brandLogoFile ? await cloudinary_service_default.upload(brandLogoFile, {
    folder: CloudinaryFolders.brand.brandLogo
  }) : null;
  const uploadedPublicIds = brandLogo?.public_id ? [brandLogo.public_id] : [];
  try {
    const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const existingBrand = await prisma.brand.findFirst({
      where: {
        slug: formattedSlug
      }
    });
    if (existingBrand) {
      if (existingBrand.isDeleted) {
        throw new AppError_default(
          409,
          "A deleted brand with this slug already exists. Please restore it instead."
        );
      }
      throw new AppError_default(409, "A brand with this slug already exists.");
    }
    const result = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: formattedSlug,
        ...description && { description },
        ...brandLogo && {
          logoUrl: brandLogo.secure_url,
          logoUrlName: brandLogoFile?.originalname,
          logoUrlPublicId: brandLogo.public_id,
          logoUrlType: brandLogoFile?.mimetype
        }
      }
    });
    return result;
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var updateBrand = async (id, payload, files) => {
  const { name, slug, description } = payload;
  const existingBrand = await prisma.brand.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
  if (!existingBrand) {
    throw new AppError_default(404, "Brand not found");
  }
  const formattedSlug = slug ? slug.trim().toLowerCase().replace(/\s+/g, "-") : void 0;
  if (formattedSlug && formattedSlug !== existingBrand.slug) {
    const existingSlug = await prisma.brand.findFirst({
      where: {
        slug: formattedSlug,
        id: {
          not: id
        }
      }
    });
    if (existingSlug) {
      if (existingSlug.isDeleted) {
        throw new AppError_default(
          409,
          "A deleted brand with this slug already exists. Please restore it instead."
        );
      }
      throw new AppError_default(409, "A brand with this slug already exists.");
    }
  }
  const brandLogoFile = files?.brandLogo?.[0];
  const brandLogo = brandLogoFile ? await cloudinary_service_default.upload(brandLogoFile, {
    folder: CloudinaryFolders.brand.brandLogo
  }) : null;
  const uploadedPublicIds = brandLogo?.public_id ? [brandLogo.public_id] : [];
  try {
    const result = await prisma.brand.update({
      where: {
        id
      },
      data: {
        ...name !== void 0 && {
          name: name.trim()
        },
        ...formattedSlug !== void 0 && {
          slug: formattedSlug
        },
        ...description !== void 0 && {
          description: description.trim()
        },
        ...brandLogo && {
          logoUrl: brandLogo.secure_url,
          logoUrlName: brandLogoFile?.originalname,
          logoUrlPublicId: brandLogo.public_id,
          logoUrlType: brandLogoFile?.mimetype
        }
      }
    });
    if (brandLogo && existingBrand.logoUrlPublicId) {
      await cloudinary_service_default.delete(existingBrand.logoUrlPublicId);
    }
    return result;
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var deleteBrand = async (id) => {
  const existingBrand = await prisma.brand.findFirst({
    where: {
      id
    }
  });
  if (!existingBrand || existingBrand.isDeleted) {
    throw new AppError_default(404, "Brand not found!");
  }
  const result = await prisma.brand.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var restoreBrand = async (id) => {
  const existingBrand = await prisma.brand.findFirst({
    where: {
      id
    }
  });
  if (!existingBrand) {
    throw new AppError_default(404, "Brand not found");
  }
  if (!existingBrand.isDeleted) {
    throw new AppError_default(400, "Brand is already active");
  }
  const result = await prisma.brand.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null
    }
  });
  return result;
};
var BrandServices = {
  getAllBrand,
  getBrandbyId,
  createBrand,
  updateBrand,
  deleteBrand,
  restoreBrand
};

// src/app/modules/brand/brand.validation.ts
import { z as z2 } from "zod";
var createBrandSchema = z2.object({
  name: z2.string().trim().min(1, "Brand name is required"),
  slug: z2.string().trim().min(1, "Brand slug is required"),
  description: z2.string().optional()
});
var updateBrandSchema = z2.object({
  name: z2.string().trim().optional(),
  slug: z2.string().trim().optional(),
  description: z2.string().optional()
});

// src/app/modules/brand/brand.controller.ts
var getAllBrand2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await BrandServices.getAllBrand(query);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Brands fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getBrandById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BrandServices.getBrandbyId(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Brand by Id fetched successfully",
    data: result
  });
});
var createBrand2 = catchAsync(async (req, res) => {
  const payload = createBrandSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  const result = await BrandServices.createBrand(payload, files);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Brand created successfully",
    data: result
  });
});
var updateBrand2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = updateBrandSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  const result = await BrandServices.updateBrand(
    id,
    payload,
    files
  );
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Brand updated successfully",
    data: result
  });
});
var deleteBrand2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BrandServices.deleteBrand(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Brand deleted successfully",
    data: result
  });
});
var restoreBrand2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await BrandServices.restoreBrand(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Brand restored successfully",
    data: result
  });
});
var BrandController = {
  getAllBrand: getAllBrand2,
  getBrandById,
  createBrand: createBrand2,
  updateBrand: updateBrand2,
  deleteBrand: deleteBrand2,
  restoreBrand: restoreBrand2
};

// src/app/modules/brand/brand.routes.ts
var router2 = Router2();
router2.get("/", BrandController.getAllBrand);
router2.get("/:id", BrandController.getBrandById);
router2.post(
  "/",
  checkAuth(UserRole.ADMIN),
  upload.fields([
    {
      name: "brandLogo",
      maxCount: 1
    }
  ]),
  BrandController.createBrand
);
router2.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  upload.fields([
    {
      name: "brandLogo",
      maxCount: 1
    }
  ]),
  BrandController.updateBrand
);
router2.delete("/:id", checkAuth(UserRole.ADMIN), BrandController.deleteBrand);
router2.patch(
  "/restore/:id",
  checkAuth(UserRole.ADMIN),
  BrandController.restoreBrand
);
var BrandRoutes = router2;

// src/app/modules/categories/categories.routes.ts
import { Router as Router3 } from "express";

// src/app/modules/categories/categories.controller.ts
import status11 from "http-status";

// src/app/modules/categories/categories.constant.ts
var categorySearchableFields = [
  "name",
  "slug",
  "children.name",
  "children.slug"
];
var categoryFilterableFields = [];
var categoryIncludeConfig = {
  children: true
};

// src/app/modules/categories/categories.services.ts
var getAllCategory = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.category, query, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false,
    parentId: null
  }).dynamicInclude(categoryIncludeConfig, ["children"]).paginate().sort().fields().execute();
  return result;
};
var getCategoryById = async (id) => {
  const result = prisma.category.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
  if (!result) {
    throw new AppError_default(404, "Category not found");
  }
  return result;
};
var createCategory = async (payload) => {
  const { parentId, slug, name } = payload;
  const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
  const existingCategory = await prisma.category.findUnique({
    where: {
      slug
    }
  });
  if (existingCategory) {
    if (existingCategory.isDeleted) {
      throw new AppError_default(
        409,
        "A deleted category already exists with this name/slug. Please restore it instead."
      );
    }
    throw new AppError_default(409, "Category with this name already exists");
  }
  if (parentId) {
    const parentCategory = await prisma.category.findFirst({
      where: {
        id: parentId,
        isDeleted: false
      }
    });
    if (!parentCategory) {
      throw new AppError_default(404, "Parent category not found");
    }
  }
  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug: formattedSlug,
      parentId: parentId || null
    }
  });
  return category;
};
var updateCategory = async (id, payload) => {
  const { name, slug, parentId } = payload;
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });
  if (!existingCategory) {
    throw new AppError_default(404, "Category not found");
  }
  const formattedSlug = slug ? slug.trim().toLowerCase().replace(/\s+/g, "-") : void 0;
  if (formattedSlug && formattedSlug !== existingCategory.slug) {
    const existingSlug = await prisma.category.findUnique({
      where: {
        slug: formattedSlug
      }
    });
    if (existingSlug) {
      throw new AppError_default(409, "Category with this slug already exists");
    }
  }
  if (parentId) {
    if (parentId === id) {
      throw new AppError_default(400, "A category cannot be its own parent");
    }
    const parentCategory = await prisma.category.findFirst({
      where: {
        id: parentId,
        isDeleted: false
      }
    });
    if (!parentCategory) {
      throw new AppError_default(404, "Parent category not found");
    }
  }
  const updatedCategory = await prisma.category.update({
    where: {
      id
    },
    data: {
      ...name !== void 0 && {
        name: name.trim()
      },
      ...formattedSlug !== void 0 && {
        slug: formattedSlug
      },
      ...parentId !== void 0 && {
        parentId: parentId || null
      }
    }
  });
  return updatedCategory;
};
var deleteCategory = async (id) => {
  const existingCategory = await prisma.category.findFirst({
    where: { id }
  });
  if (!existingCategory || existingCategory.isDeleted) {
    throw new AppError_default(404, "Category not found");
  }
  const result = await prisma.category.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var restoreCategory = async (id) => {
  const existingCategory = await prisma.category.findFirst({
    where: { id }
  });
  if (!existingCategory) {
    throw new AppError_default(404, "Category not found");
  }
  if (!existingCategory.isDeleted) {
    throw new AppError_default(400, "Category is already Active");
  }
  const result = await prisma.category.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null
    }
  });
  return result;
};
var CategoryService = {
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
};

// src/app/modules/categories/categories.validation.ts
import { z as z3 } from "zod";
var createCategorySchema = z3.object({
  name: z3.string().trim().min(1, "Category name is required"),
  slug: z3.string().trim().min(1, "Category slug is required"),
  parentId: z3.string().optional()
});
var updateCategorySchema = z3.object({
  name: z3.string().trim().optional(),
  slug: z3.string().trim().optional(),
  parentId: z3.string().optional()
});

// src/app/modules/categories/categories.controller.ts
var getAllCategory2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await CategoryService.getAllCategory(query);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getCategoryById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.getCategoryById(id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Category by Id fetched successfully",
    data: result
  });
});
var createCategory2 = catchAsync(async (req, res) => {
  const payload = createCategorySchema.parse(req.body);
  const result = await CategoryService.createCategory(payload);
  sendResponse(res, {
    httpStatusCode: status11.CREATED,
    success: true,
    message: "Category Created successfully",
    data: result
  });
});
var updateCategory2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = updateCategorySchema.parse(req.body);
  const result = await CategoryService.updateCategory(id, payload);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Category Updated Successfully",
    data: result
  });
});
var deleteCategory2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategory(id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Category Deleted Successfully",
    data: result
  });
});
var restoreCategory2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.restoreCategory(id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Category Restored Successfully",
    data: result
  });
});
var CategoryController = {
  getAllCategory: getAllCategory2,
  getCategoryById: getCategoryById2,
  createCategory: createCategory2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2,
  restoreCategory: restoreCategory2
};

// src/app/modules/categories/categories.routes.ts
var router3 = Router3();
router3.get("/", checkAuth(UserRole.ADMIN), CategoryController.getAllCategory);
router3.get(
  "/:id",
  checkAuth(UserRole.ADMIN),
  CategoryController.getCategoryById
);
router3.post("/", checkAuth(UserRole.ADMIN), CategoryController.createCategory);
router3.patch(
  "/restore/:id",
  checkAuth(UserRole.ADMIN),
  CategoryController.restoreCategory
);
router3.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  CategoryController.updateCategory
);
router3.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  CategoryController.deleteCategory
);
var CategoryRoutes = router3;

// src/app/modules/product/product.routes.ts
import { Router as Router4 } from "express";

// src/app/modules/product/playground.controller.ts
import status12 from "http-status";

// src/app/modules/product/playgound.validation.ts
import { z as z4 } from "zod";
var attributesSchema = z4.record(
  z4.string().trim().min(1, "Attribute name is required"),
  z4.string().trim().min(1, "Attribute value is required")
);
var productVariantSchema = z4.object({
  sku: z4.string().trim().min(1, "SKU is required"),
  price: z4.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z4.coerce.number().positive("Compare at price must be greater than 0").optional(),
  stockQuantity: z4.coerce.number().int("Stock quantity must be an integer").min(0, "Stock quantity cannot be negative"),
  // e.g. { color: "Black", size: "M" }. Images are NOT linked here:
  // they are matched by the uploaded file names (variantImages_<value>)
  attributes: attributesSchema
}).refine(
  (v) => v.compareAtPrice === void 0 || v.compareAtPrice >= v.price,
  {
    message: "Compare at price must not be lower than the price",
    path: ["compareAtPrice"]
  }
);
var createProductSchema = z4.object({
  name: z4.string().trim().min(1, "Product name is required"),
  slug: z4.string().trim().min(1, "Product slug is required"),
  description: z4.string().trim().optional(),
  categoryId: z4.string().uuid("Invalid category ID"),
  brandId: z4.string().uuid("Invalid brand ID").optional(),
  status: z4.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  variants: z4.array(productVariantSchema).min(1, "At least one product variant is required")
});
var updateProductSchema = z4.object({
  name: z4.string().trim().min(1).optional(),
  slug: z4.string().trim().min(1).optional(),
  description: z4.string().trim().optional(),
  categoryId: z4.string().uuid("Invalid category ID").optional(),
  brandId: z4.string().uuid("Invalid brand ID").nullable().optional(),
  status: z4.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  // existing variants are matched by sku; attributes cannot be edited here
  // (delete the variant and add a new one instead)
  variants: z4.array(
    z4.object({
      sku: z4.string().trim().min(1),
      price: z4.number().positive().optional(),
      compareAtPrice: z4.number().positive().nullable().optional(),
      stockQuantity: z4.number().int().min(0).optional()
    })
  ).optional()
});

// src/app/modules/product/product.helpers.ts
var UPLOAD_CONCURRENCY = 5;
var VARIANT_IMAGE_PREFIX = "variantImages_";
var cleanAttrs = (attrs) => Object.fromEntries(
  Object.entries(attrs ?? {}).map(([k, v]) => [
    k.trim(),
    String(v).trim()
  ])
);
var attrKeys = (attrs) => Object.keys(attrs).sort().join("|");
var comboKey = (attrs) => Object.keys(attrs).sort().map((k) => `${k}=${attrs[k]}`).join("|");
var prepareVariants = (variants) => {
  if (!variants?.length) {
    throw new AppError_default(400, "At least one variant is required.");
  }
  const cleaned = variants.map((v) => ({
    ...v,
    sku: v.sku.trim(),
    attributes: cleanAttrs(v.attributes)
  }));
  if (new Set(cleaned.map((v) => v.sku)).size !== cleaned.length) {
    throw new AppError_default(409, "Duplicate SKU found in product variants.");
  }
  const keys = attrKeys(cleaned[0].attributes);
  const seen = /* @__PURE__ */ new Set();
  for (const v of cleaned) {
    if (attrKeys(v.attributes) !== keys) {
      throw new AppError_default(
        400,
        `Variant "${v.sku}" must use the same attributes as the other variants.`
      );
    }
    const combo = comboKey(v.attributes);
    if (seen.has(combo)) {
      throw new AppError_default(
        409,
        `Duplicate variant combination${combo ? `: ${combo}` : ""}.`
      );
    }
    seen.add(combo);
  }
  return cleaned;
};
var resolveImageAttribute = (variantAttrs, groupNames) => {
  if (groupNames.length === 0) return null;
  const valuesByAttribute = /* @__PURE__ */ new Map();
  for (const attrs of variantAttrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (!valuesByAttribute.has(key))
        valuesByAttribute.set(key, /* @__PURE__ */ new Set());
      valuesByAttribute.get(key).add(value);
    }
  }
  const groups = new Set(groupNames);
  const matches = [...valuesByAttribute].filter(
    ([, values]) => values.size === groups.size && [...values].every((v) => groups.has(v))
  ).map(([key]) => key);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new AppError_default(
      400,
      `Image groups match more than one attribute (${matches.join(", ")}), so the images are ambiguous.`
    );
  }
  const available = [...valuesByAttribute].map(([key, values]) => `${key}: ${[...values].join(", ")}`).join(" | ");
  throw new AppError_default(
    400,
    `Variant images must be uploaded for every value of exactly one attribute. Got: ${groupNames.join(", ")}. Available: ${available || "none"}.`
  );
};
var toAttrs = (json) => json;
var splitImageFiles = (files) => {
  const generalFiles = files.productImages ?? [];
  const groupedFiles = Object.entries(files).filter(([field]) => field.startsWith(VARIANT_IMAGE_PREFIX)).map(([field, list]) => ({
    group: field.slice(VARIANT_IMAGE_PREFIX.length).trim(),
    files: list
  })).filter((g) => g.files.length > 0);
  return { generalFiles, groupedFiles };
};
var uploadImageJobs = async (jobs, startPosition, uploadedPublicIds) => {
  const rows = [];
  for (let start = 0; start < jobs.length; start += UPLOAD_CONCURRENCY) {
    const batch = jobs.slice(start, start + UPLOAD_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (job, i) => {
        if (!job.file.mimetype) {
          throw new AppError_default(400, "Image MIME type is missing.");
        }
        const uploaded = await cloudinary_service_default.upload(job.file, {
          folder: job.folder
        });
        if (!uploaded.public_id) {
          throw new AppError_default(
            500,
            "Uploaded image public ID is missing."
          );
        }
        uploadedPublicIds.push(uploaded.public_id);
        return {
          groupValue: job.groupValue,
          url: uploaded.secure_url,
          urlName: job.file.originalname,
          publicId: uploaded.public_id,
          type: job.file.mimetype,
          position: startPosition + start + i
        };
      })
    );
    for (const result of results) {
      if (result.status === "rejected") throw result.reason;
      rows.push(result.value);
    }
  }
  return rows;
};

// src/app/modules/product/playground.ts
var productSearchableFields = ["name", "slug", "variants.sku"];
var productFilterableFields = [
  "categoryId",
  "brandId",
  "status",
  "category.slug",
  "brand.slug"
];
var productSortableFields = ["createdAt", "updatedAt", "name"];
var toNumber = (value) => {
  const n = Number(value);
  return value !== void 0 && value !== "" && Number.isFinite(n) ? n : void 0;
};
var getAllProductsServ = async (query, options = {}) => {
  const sortBy = typeof query.sortBy === "string" && productSortableFields.includes(query.sortBy) ? query.sortBy : "createdAt";
  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  const rawAttributes = query.attributes;
  const attributeFilters = typeof rawAttributes === "object" && rawAttributes !== null && !Array.isArray(rawAttributes) ? Object.entries(rawAttributes).filter(
    (entry) => typeof entry[1] === "string" && entry[1] !== ""
  ) : [];
  const needsVariantFilter = minPrice !== void 0 || maxPrice !== void 0 || attributeFilters.length > 0;
  const variantFilter = {
    isDeleted: false,
    ...minPrice !== void 0 || maxPrice !== void 0 ? {
      price: {
        ...minPrice !== void 0 ? { gte: minPrice } : {},
        ...maxPrice !== void 0 ? { lte: maxPrice } : {}
      }
    } : {},
    ...attributeFilters.length > 0 ? {
      AND: attributeFilters.map(([key, value]) => ({
        attributes: { path: [key], equals: value }
      }))
    } : {}
  };
  const queryBuilder = new QueryBuilder(
    prisma.product,
    { ...query, sortBy },
    {
      searchableFields: productSearchableFields,
      filterableFields: productFilterableFields
    }
  );
  const result = await queryBuilder.search().filter().where({
    isDeleted: false,
    ...options.publicOnly && { status: "ACTIVE" },
    ...needsVariantFilter && { variants: { some: variantFilter } }
  }).include({
    images: {
      where: { isDeleted: false },
      orderBy: { position: "asc" },
      take: 1,
      // cover image
      select: { url: true }
    },
    variants: {
      where: { isDeleted: false },
      orderBy: { position: "asc" },
      select: {
        id: true,
        price: true,
        compareAtPrice: true,
        stockQuantity: true
      }
    },
    brand: { select: { id: true, name: true, slug: true } },
    category: { select: { id: true, name: true, slug: true } }
  }).paginate().sort().execute();
  const products = result.data;
  return {
    data: products.map((product) => {
      const prices = product.variants.map((v) => Number(v.price));
      const defaultVariant = product.variants.find((v) => v.stockQuantity > 0) ?? product.variants[0];
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        status: product.status,
        createdAt: product.createdAt,
        brand: product.brand,
        category: product.category,
        image: product.images[0]?.url ?? null,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        inStock: product.variants.some((v) => v.stockQuantity > 0),
        isSingleVariant: product.variants.length === 1,
        variantCount: product.variants.length,
        defaultVariantId: defaultVariant?.id ?? null
      };
    }),
    meta: result.meta
  };
};
var createProductServ = async (payload, files = {}) => {
  const { name, slug, description, categoryId, brandId, status: status14 } = payload;
  const uploadedPublicIds = [];
  try {
    const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const existingProduct = await prisma.product.findFirst({
      where: { slug: formattedSlug }
    });
    if (existingProduct) {
      if (existingProduct.isDeleted) {
        throw new AppError_default(
          409,
          "A deleted product with this slug already exists. Please restore it instead."
        );
      }
      throw new AppError_default(409, "A product with this slug already exists.");
    }
    const category = await prisma.category.findFirst({
      where: { id: categoryId, isDeleted: false }
    });
    if (!category) throw new AppError_default(404, "Category not found");
    if (brandId) {
      const brand = await prisma.brand.findFirst({
        where: { id: brandId, isDeleted: false }
      });
      if (!brand) throw new AppError_default(404, "Brand not found");
    }
    const variants = prepareVariants(payload.variants);
    const existingVariant = await prisma.productVariant.findFirst({
      where: { sku: { in: variants.map((v) => v.sku) } }
    });
    if (existingVariant) {
      throw new AppError_default(
        409,
        `Variant with SKU "${existingVariant.sku}" already exists.`
      );
    }
    const generalFiles = files.productImages ?? [];
    const groupedFiles = Object.entries(files).filter(([field]) => field.startsWith(VARIANT_IMAGE_PREFIX)).map(([field, list]) => ({
      group: field.slice(VARIANT_IMAGE_PREFIX.length).trim(),
      files: list
    })).filter((g) => g.files.length > 0);
    const totalFiles = generalFiles.length + groupedFiles.reduce((sum, g) => sum + g.files.length, 0);
    if (totalFiles === 0) {
      throw new AppError_default(400, "At least one product image is required.");
    }
    const imageAttribute = resolveImageAttribute(
      variants.map((v) => v.attributes),
      groupedFiles.map((g) => g.group)
    );
    const jobs = [
      ...generalFiles.map((file) => ({
        file,
        folder: CloudinaryFolders.product.productImage,
        groupValue: null
      })),
      ...groupedFiles.flatMap(
        ({ group, files: groupFiles }) => groupFiles.map((file) => ({
          file,
          folder: CloudinaryFolders.product.variantImage,
          groupValue: group
        }))
      )
    ];
    const uploadImage = async ({ file, folder, groupValue }, position) => {
      if (!file.mimetype) {
        throw new AppError_default(400, "Image MIME type is missing.");
      }
      const uploaded = await cloudinary_service_default.upload(file, { folder });
      if (!uploaded.public_id) {
        throw new AppError_default(500, "Uploaded image public ID is missing.");
      }
      uploadedPublicIds.push(uploaded.public_id);
      return {
        groupValue,
        url: uploaded.secure_url,
        urlName: file.originalname,
        publicId: uploaded.public_id,
        type: file.mimetype,
        position
      };
    };
    const imageRows = [];
    for (let start = 0; start < jobs.length; start += UPLOAD_CONCURRENCY) {
      const batch = jobs.slice(start, start + UPLOAD_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((job, i) => uploadImage(job, start + i))
      );
      for (const result of results) {
        if (result.status === "rejected") throw result.reason;
        imageRows.push(result.value);
      }
    }
    return await prisma.product.create({
      data: {
        name: name.trim(),
        slug: formattedSlug,
        ...description !== void 0 && {
          description: description.trim()
        },
        categoryId,
        ...brandId && { brandId },
        status: status14,
        imageAttribute: imageAttribute ?? null,
        images: { create: imageRows },
        variants: {
          create: variants.map((variant, index) => ({
            sku: variant.sku,
            price: variant.price,
            ...variant.compareAtPrice !== void 0 && {
              compareAtPrice: variant.compareAtPrice
            },
            stockQuantity: variant.stockQuantity,
            attributes: variant.attributes,
            position: index
          }))
        }
      },
      include: {
        images: {
          where: { isDeleted: false },
          orderBy: { position: "asc" }
        },
        variants: {
          where: { isDeleted: false },
          orderBy: { position: "asc" }
        },
        brand: true,
        category: true
      }
    });
  } catch (error) {
    await Promise.allSettled(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};

// src/app/modules/product/playground.controller.ts
var createProduct = catchAsync(async (req, res) => {
  let rawData;
  try {
    rawData = JSON.parse(req.body.data);
  } catch {
    throw new AppError_default(
      status12.BAD_REQUEST,
      "`data` must be a valid JSON string"
    );
  }
  const payload = createProductSchema.parse(rawData);
  const uploadedFiles = req.files ?? [];
  const files = {};
  for (const file of uploadedFiles) {
    const field = file.fieldname;
    if (field !== "productImages" && !field.startsWith(VARIANT_IMAGE_PREFIX)) {
      throw new AppError_default(
        status12.BAD_REQUEST,
        `Unexpected file field "${field}"`
      );
    }
    (files[field] ?? (files[field] = [])).push(file);
  }
  const result = await createProductServ(payload, files);
  sendResponse(res, {
    httpStatusCode: status12.CREATED,
    success: true,
    message: "Product created successfully",
    data: result
  });
});
var getAllProducts = catchAsync(
  async (req, res) => {
    const result = await getAllProductsServ(req.query, {
      publicOnly: true
    });
    sendResponse(res, {
      httpStatusCode: status12.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var getAllProductsForAdmin = catchAsync(
  async (req, res) => {
    const result = await getAllProductsServ(req.query);
    sendResponse(res, {
      httpStatusCode: status12.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);

// src/app/modules/product/product.controller.ts
import status13 from "http-status";

// src/app/modules/product/product.constant.ts
var productSearchableFields2 = ["name", "slug", "variants.sku"];
var productFilterableFields2 = [
  "categoryId",
  "brandId",
  "status",
  "category.slug",
  "brand.slug"
];
var productSortableFields2 = ["createdAt", "updatedAt", "name"];

// src/app/modules/product/product.service.ts
var UPLOAD_CONCURRENCY2 = 5;
var toNumber2 = (value) => {
  const n = Number(value);
  return value !== void 0 && value !== "" && Number.isFinite(n) ? n : void 0;
};
var getAllProducts2 = async (query, options = {}) => {
  const sortBy = typeof query.sortBy === "string" && productSortableFields2.includes(query.sortBy) ? query.sortBy : "createdAt";
  const minPrice = toNumber2(query.minPrice);
  const maxPrice = toNumber2(query.maxPrice);
  const rawAttributes = query.attributes;
  const attributeFilters = typeof rawAttributes === "object" && rawAttributes !== null && !Array.isArray(rawAttributes) ? Object.entries(rawAttributes).filter(
    (entry) => typeof entry[1] === "string" && entry[1] !== ""
  ) : [];
  const needsVariantFilter = minPrice !== void 0 || maxPrice !== void 0 || attributeFilters.length > 0;
  const variantFilter = {
    isDeleted: false,
    ...minPrice !== void 0 || maxPrice !== void 0 ? {
      price: {
        ...minPrice !== void 0 ? { gte: minPrice } : {},
        ...maxPrice !== void 0 ? { lte: maxPrice } : {}
      }
    } : {},
    ...attributeFilters.length > 0 ? {
      AND: attributeFilters.map(([key, value]) => ({
        attributes: { path: [key], equals: value }
      }))
    } : {}
  };
  const queryBuilder = new QueryBuilder(
    prisma.product,
    { ...query, sortBy },
    {
      searchableFields: productSearchableFields2,
      filterableFields: productFilterableFields2
    }
  );
  const result = await queryBuilder.search().filter().where({
    isDeleted: false,
    ...options.publicOnly && { status: "ACTIVE" },
    ...needsVariantFilter && { variants: { some: variantFilter } }
  }).include({
    images: {
      where: { isDeleted: false },
      orderBy: { position: "asc" },
      take: 1,
      // cover image
      select: { url: true }
    },
    variants: {
      where: { isDeleted: false },
      orderBy: { position: "asc" },
      select: {
        id: true,
        price: true,
        compareAtPrice: true,
        stockQuantity: true
      }
    },
    brand: { select: { id: true, name: true, slug: true } },
    category: { select: { id: true, name: true, slug: true } }
  }).paginate().sort().execute();
  const products = result.data;
  return {
    data: products.map((product) => {
      const prices = product.variants.map((v) => Number(v.price));
      const defaultVariant = product.variants.find((v) => v.stockQuantity > 0) ?? product.variants[0];
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        status: product.status,
        createdAt: product.createdAt,
        brand: product.brand,
        category: product.category,
        image: product.images[0]?.url ?? null,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        inStock: product.variants.some((v) => v.stockQuantity > 0),
        isSingleVariant: product.variants.length === 1,
        variantCount: product.variants.length,
        defaultVariantId: defaultVariant?.id ?? null
      };
    }),
    meta: result.meta
  };
};
var createProduct2 = async (payload, files = {}) => {
  const { name, slug, description, categoryId, brandId, status: status14 } = payload;
  const uploadedPublicIds = [];
  try {
    const formattedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
    const existingProduct = await prisma.product.findFirst({
      where: { slug: formattedSlug }
    });
    if (existingProduct) {
      if (existingProduct.isDeleted) {
        throw new AppError_default(
          409,
          "A deleted product with this slug already exists. Please restore it instead."
        );
      }
      throw new AppError_default(409, "A product with this slug already exists.");
    }
    const category = await prisma.category.findFirst({
      where: { id: categoryId, isDeleted: false }
    });
    if (!category) throw new AppError_default(404, "Category not found");
    if (brandId) {
      const brand = await prisma.brand.findFirst({
        where: { id: brandId, isDeleted: false }
      });
      if (!brand) throw new AppError_default(404, "Brand not found");
    }
    const variants = prepareVariants(payload.variants);
    const existingVariant = await prisma.productVariant.findFirst({
      where: { sku: { in: variants.map((v) => v.sku) } }
    });
    if (existingVariant) {
      throw new AppError_default(
        409,
        `Variant with SKU "${existingVariant.sku}" already exists.`
      );
    }
    const generalFiles = files.productImages ?? [];
    const groupedFiles = Object.entries(files).filter(([field]) => field.startsWith(VARIANT_IMAGE_PREFIX)).map(([field, list]) => ({
      group: field.slice(VARIANT_IMAGE_PREFIX.length).trim(),
      files: list
    })).filter((g) => g.files.length > 0);
    const totalFiles = generalFiles.length + groupedFiles.reduce((sum, g) => sum + g.files.length, 0);
    if (totalFiles === 0) {
      throw new AppError_default(400, "At least one product image is required.");
    }
    const imageAttribute = resolveImageAttribute(
      variants.map((v) => v.attributes),
      groupedFiles.map((g) => g.group)
    );
    const jobs = [
      ...generalFiles.map((file) => ({
        file,
        folder: CloudinaryFolders.product.productImage,
        groupValue: null
      })),
      ...groupedFiles.flatMap(
        ({ group, files: groupFiles }) => groupFiles.map((file) => ({
          file,
          folder: CloudinaryFolders.product.variantImage,
          groupValue: group
        }))
      )
    ];
    const uploadImage = async ({ file, folder, groupValue }, position) => {
      if (!file.mimetype) {
        throw new AppError_default(400, "Image MIME type is missing.");
      }
      const uploaded = await cloudinary_service_default.upload(file, { folder });
      if (!uploaded.public_id) {
        throw new AppError_default(500, "Uploaded image public ID is missing.");
      }
      uploadedPublicIds.push(uploaded.public_id);
      return {
        groupValue,
        url: uploaded.secure_url,
        urlName: file.originalname,
        publicId: uploaded.public_id,
        type: file.mimetype,
        position
      };
    };
    const imageRows = [];
    for (let start = 0; start < jobs.length; start += UPLOAD_CONCURRENCY2) {
      const batch = jobs.slice(start, start + UPLOAD_CONCURRENCY2);
      const results = await Promise.allSettled(
        batch.map((job, i) => uploadImage(job, start + i))
      );
      for (const result of results) {
        if (result.status === "rejected") throw result.reason;
        imageRows.push(result.value);
      }
    }
    return await prisma.product.create({
      data: {
        name: name.trim(),
        slug: formattedSlug,
        ...description !== void 0 && {
          description: description.trim()
        },
        categoryId,
        ...brandId && { brandId },
        status: status14,
        imageAttribute: imageAttribute ?? null,
        images: { create: imageRows },
        variants: {
          create: variants.map((variant, index) => ({
            sku: variant.sku,
            price: variant.price,
            ...variant.compareAtPrice !== void 0 && {
              compareAtPrice: variant.compareAtPrice
            },
            stockQuantity: variant.stockQuantity,
            attributes: variant.attributes,
            position: index
          }))
        }
      },
      include: {
        images: {
          where: { isDeleted: false },
          orderBy: { position: "asc" }
        },
        variants: {
          where: { isDeleted: false },
          orderBy: { position: "asc" }
        },
        brand: true,
        category: true
      }
    });
  } catch (error) {
    await Promise.allSettled(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var updateProduct = async (productId, payload, files = {}) => {
  const uploadedPublicIds = [];
  try {
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false },
      select: {
        id: true,
        slug: true,
        imageAttribute: true,
        variants: {
          where: { isDeleted: false },
          select: {
            id: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            attributes: true
          }
        }
      }
    });
    if (!product) throw new AppError_default(404, "Product not found");
    const { generalFiles, groupedFiles } = splitImageFiles(files);
    const variantUpdates = payload.variants ?? [];
    const hasFiles = generalFiles.length > 0 || groupedFiles.length > 0;
    const hasFieldUpdates = [
      "name",
      "slug",
      "description",
      "categoryId",
      "brandId",
      "status"
    ].some((key) => payload[key] !== void 0);
    if (!hasFieldUpdates && variantUpdates.length === 0 && !hasFiles) {
      throw new AppError_default(400, "Nothing to update.");
    }
    let formattedSlug;
    if (payload.slug !== void 0) {
      formattedSlug = payload.slug.trim().toLowerCase().replace(/\s+/g, "-");
      if (formattedSlug !== product.slug) {
        const taken = await prisma.product.findFirst({
          where: { slug: formattedSlug, id: { not: productId } }
        });
        if (taken) {
          throw new AppError_default(
            409,
            taken.isDeleted ? "A deleted product with this slug already exists. Please restore it instead." : "A product with this slug already exists."
          );
        }
      }
    }
    if (payload.categoryId !== void 0) {
      const category = await prisma.category.findFirst({
        where: { id: payload.categoryId, isDeleted: false }
      });
      if (!category) throw new AppError_default(404, "Category not found");
    }
    if (payload.brandId) {
      const brand = await prisma.brand.findFirst({
        where: { id: payload.brandId, isDeleted: false }
      });
      if (!brand) throw new AppError_default(404, "Brand not found");
    }
    const variantBySku = new Map(
      product.variants.map((v) => [v.sku, v])
    );
    const seenSkus = /* @__PURE__ */ new Set();
    for (const update of variantUpdates) {
      if (seenSkus.has(update.sku)) {
        throw new AppError_default(
          409,
          `SKU "${update.sku}" appears twice in the request.`
        );
      }
      seenSkus.add(update.sku);
      const current = variantBySku.get(update.sku);
      if (!current) {
        throw new AppError_default(
          404,
          `Variant with SKU "${update.sku}" not found on this product.`
        );
      }
      const nextPrice = update.price ?? Number(current.price);
      const nextCompare = update.compareAtPrice !== void 0 ? update.compareAtPrice : current.compareAtPrice === null ? null : Number(current.compareAtPrice);
      if (nextCompare !== null && nextCompare < nextPrice) {
        throw new AppError_default(
          400,
          `Variant "${update.sku}": compare at price must not be lower than the price.`
        );
      }
    }
    const { imageAttribute } = product;
    if (groupedFiles.length > 0) {
      if (!imageAttribute) {
        throw new AppError_default(
          400,
          "This product shares one gallery across all variants. Upload to productImages instead."
        );
      }
      const validValues = new Set(
        product.variants.map(
          (v) => toAttrs(v.attributes)[imageAttribute] ?? ""
        )
      );
      for (const { group } of groupedFiles) {
        if (!validValues.has(group)) {
          throw new AppError_default(
            400,
            `"${group}" is not a ${imageAttribute} of this product. Existing: ${[...validValues].join(", ")}.`
          );
        }
      }
    }
    let imageRows = [];
    if (hasFiles) {
      const last = await prisma.productImage.aggregate({
        where: { productId, isDeleted: false },
        _max: { position: true }
      });
      const startPosition = (last._max.position ?? -1) + 1;
      const jobs = [
        ...generalFiles.map((file) => ({
          file,
          folder: CloudinaryFolders.product.productImage,
          groupValue: null
        })),
        ...groupedFiles.flatMap(
          ({ group, files: groupFiles }) => groupFiles.map((file) => ({
            file,
            folder: CloudinaryFolders.product.variantImage,
            groupValue: group
          }))
        )
      ];
      imageRows = await uploadImageJobs(
        jobs,
        startPosition,
        uploadedPublicIds
      );
    }
    return await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          ...payload.name !== void 0 && {
            name: payload.name.trim()
          },
          ...formattedSlug !== void 0 && { slug: formattedSlug },
          ...payload.description !== void 0 && {
            description: payload.description.trim()
          },
          ...payload.categoryId !== void 0 && {
            categoryId: payload.categoryId
          },
          ...payload.brandId !== void 0 && {
            brandId: payload.brandId
          },
          ...payload.status !== void 0 && {
            status: payload.status
          }
        }
      });
      for (const update of variantUpdates) {
        await tx.productVariant.update({
          where: { id: variantBySku.get(update.sku).id },
          data: {
            ...update.price !== void 0 && {
              price: update.price
            },
            ...update.compareAtPrice !== void 0 && {
              compareAtPrice: update.compareAtPrice
            },
            ...update.stockQuantity !== void 0 && {
              stockQuantity: update.stockQuantity
            }
          }
        });
      }
      if (imageRows.length > 0) {
        await tx.productImage.createMany({
          data: imageRows.map((row) => ({ ...row, productId }))
        });
      }
      return tx.product.findUniqueOrThrow({
        where: { id: productId },
        include: {
          images: {
            where: { isDeleted: false },
            orderBy: { position: "asc" }
          },
          variants: {
            where: { isDeleted: false },
            orderBy: { position: "asc" }
          },
          brand: true,
          category: true
        }
      });
    });
  } catch (error) {
    await Promise.allSettled(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var ProductServices = { getAllProducts: getAllProducts2, createProduct: createProduct2, updateProduct };

// src/app/modules/product/product.validation.ts
import { z as z5 } from "zod";
var productVariantSchema2 = z5.object({
  sku: z5.string().trim().min(1, "SKU is required"),
  price: z5.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z5.coerce.number().positive("Compare at price must be greater than 0").optional(),
  stockQuantity: z5.coerce.number().int("Stock quantity must be an integer").min(0, "Stock quantity cannot be negative"),
  attributes: z5.record(z5.string(), z5.string().trim().min(1)),
  imageGroup: z5.string().trim().min(1)
});
var createProductSchema2 = z5.object({
  name: z5.string().trim().min(1, "Product name is required"),
  slug: z5.string().trim().min(1, "Product slug is required"),
  description: z5.string().trim().optional(),
  categoryId: z5.string().uuid("Invalid category ID"),
  brandId: z5.string().uuid("Invalid brand ID").optional(),
  status: z5.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  variants: z5.array(productVariantSchema2).min(1, "At least one product variant is required")
});
var updateProductSchema2 = z5.object({
  name: z5.string().trim().min(1).optional(),
  slug: z5.string().trim().min(1).optional(),
  description: z5.string().trim().optional(),
  categoryId: z5.string().uuid("Invalid category ID").optional(),
  brandId: z5.string().uuid("Invalid brand ID").nullable().optional(),
  status: z5.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  // existing variants are matched by sku; attributes cannot be edited here
  // (delete the variant and add a new one instead)
  variants: z5.array(
    z5.object({
      sku: z5.string().trim().min(1),
      price: z5.number().positive().optional(),
      compareAtPrice: z5.number().positive().nullable().optional(),
      stockQuantity: z5.number().int().min(0).optional()
    })
  ).optional()
});

// src/app/modules/product/product.controller.ts
var getAllProducts3 = catchAsync(async (req, res) => {
  const result = await ProductServices.getAllProducts(
    req.query,
    {
      publicOnly: true
    }
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Products retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var getAllProductsForAdmin2 = catchAsync(
  async (req, res) => {
    const result = await ProductServices.getAllProducts(
      req.query
    );
    sendResponse(res, {
      httpStatusCode: status13.OK,
      success: true,
      message: "Products retrieved successfully",
      data: result.data,
      meta: result.meta
    });
  }
);
var createProduct3 = catchAsync(async (req, res) => {
  let rawData;
  try {
    rawData = JSON.parse(req.body.data);
  } catch {
    throw new AppError_default(
      status13.BAD_REQUEST,
      "`data` must be a valid JSON string"
    );
  }
  const payload = createProductSchema2.parse(rawData);
  const uploadedFiles = req.files ?? [];
  const files = {};
  for (const file of uploadedFiles) {
    const field = file.fieldname;
    if (field !== "productImages" && !field.startsWith(VARIANT_IMAGE_PREFIX)) {
      throw new AppError_default(
        status13.BAD_REQUEST,
        `Unexpected file field "${field}"`
      );
    }
    (files[field] ?? (files[field] = [])).push(file);
  }
  const result = await ProductServices.createProduct(payload, files);
  sendResponse(res, {
    httpStatusCode: status13.CREATED,
    success: true,
    message: "Product created successfully",
    data: result
  });
});
var updateProduct2 = catchAsync(async (req, res) => {
  var _a;
  const { id } = req.params;
  const payload = updateProductSchema2.parse(JSON.parse(req.body.data));
  const uploadedFiles = req.files ?? [];
  const files = {};
  for (const file of uploadedFiles) {
    (files[_a = file.fieldname] ?? (files[_a] = [])).push(file);
  }
  const result = await ProductServices.updateProduct(
    id,
    payload,
    files
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Product updated successfully",
    data: result
  });
});
var ProductController = {
  getAllProducts: getAllProducts3,
  getAllProductsForAdmin: getAllProductsForAdmin2,
  createProduct: createProduct3,
  updateProduct: updateProduct2
};

// src/app/modules/product/product.routes.ts
var router4 = Router4();
router4.get("/", ProductController.getAllProducts);
router4.get(
  "/admin/all",
  checkAuth(UserRole.ADMIN),
  ProductController.getAllProductsForAdmin
);
router4.post(
  "/test",
  checkAuth(UserRole.ADMIN),
  // upload.fields([
  //     { name: "productImages", maxCount: 10 },
  //     { name: "variantImages_TSHIRT-BLACK-M", maxCount: 5 },
  //     { name: "variantImages_TSHIRT-BLACK-L", maxCount: 5 },
  //     { name: "variantImages_TSHIRT-WHITE-M", maxCount: 5 },
  // ]),
  upload.any(),
  createProduct
);
router4.post(
  "/",
  checkAuth(UserRole.ADMIN),
  // upload.fields([
  //     { name: "productImages", maxCount: 10 },
  //     { name: "variantImages_TSHIRT-BLACK-M", maxCount: 5 },
  //     { name: "variantImages_TSHIRT-BLACK-L", maxCount: 5 },
  //     { name: "variantImages_TSHIRT-WHITE-M", maxCount: 5 },
  // ]),
  upload.any(),
  ProductController.createProduct
);
router4.patch(
  "/:id",
  checkAuth(UserRole.ADMIN),
  upload.any(),
  ProductController.updateProduct
);
var ProductRoutes = router4;

// src/app/routes/index.ts
var routes = Router5();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/categories",
    route: CategoryRoutes
  },
  {
    path: "/brands",
    route: BrandRoutes
  },
  {
    path: "/product",
    route: ProductRoutes
  }
];
moduleRoutes.forEach((route) => routes.use(route.path, route.route));
var routes_default = routes;

// src/app.ts
var app = express();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path3.resolve(process.cwd(), `src/app/templates`));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // allowedHeaders: [["Content-Type", "Authorization", "Cookie"],
  })
);
app.use("/api/auth", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes_default);
app.get("/", async (req, res) => {
  res.status(201).json({
    success: true,
    message: "Spark E-Commerce Application"
  });
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/utils/seed.ts
var seedAdmin = async () => {
  try {
    const isAdminExists = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN
      }
    });
    if (isAdminExists) {
      console.log("Admin already exists. Skipping seeding admin.");
      return;
    }
    const adminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "Admin",
        role: UserRole.ADMIN,
        needPasswordChange: false,
        rememberMe: false
      }
    });
    await prisma.user.update({
      where: { id: adminUser.user.id },
      data: {
        emailVerified: true
      }
    });
    const admin = await prisma.user.findUnique({
      where: {
        id: adminUser.user.id
      }
    });
    console.log("Admin Created:", admin);
  } catch (error) {
    console.error("Error seeding admin: ", error);
    await prisma.user.delete({
      where: {
        email: envVars.ADMIN_EMAIL
      }
    });
  }
};

// src/server.ts
var bootstrap = async () => {
  try {
    await prisma.$connect();
    await seedAdmin();
    app_default.listen(envVars.PORT, () => {
      console.log(
        `Server is running on http://localhost:${envVars.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};
if (process.env.NODE_ENV !== "production") {
  bootstrap();
}
var server_default = app_default;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map