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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  ADMIN\n  USER\n  MODERATOR\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BANNED\n}\n\nenum ProductStatus {\n  DRAFT\n  ACTIVE\n  ARCHIVED\n}\n\nenum OrderStatus {\n  PENDING\n  CONFIRMED\n  PROCESSING\n  SHIPPED\n  DELIVERED\n  CANCELLED\n  REFUNDED\n}\n\nenum PaymentMethod {\n  CASH_ON_DELIVERY\n  CARD\n  MOBILE_BANKING\n  BANK_TRANSFER\n}\n\nenum PaymentStatus {\n  PENDING\n  PROCESSING\n  PAID\n  FAILED\n  REFUNDED\n  CANCELLED\n}\n\n// Tables\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  emailVerified      Boolean    @default(false)\n  image              String?\n  role               UserRole   @default(USER)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  sessions           Session[]\n  accounts           Account[]\n  address            Address?\n  cart               Cart?\n  orders             Order[]\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Address {\n  id        String    @id @default(uuid())\n  userId    String    @unique\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  fullName  String\n  phone     String\n  address1  String\n  address2  String?\n  city      String\n  upozila   String\n  district  String\n  country   String    @default("Bangladesh")\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Category {\n  id   String @id @default(cuid())\n  name String\n  slug String @unique\n\n  parentId String?\n  parent   Category?  @relation("CategoryChildren", fields: [parentId], references: [id])\n  children Category[] @relation("CategoryChildren")\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  products Product[]\n\n  @@index([parentId])\n}\n\nmodel Product {\n  id          String  @id @default(cuid())\n  name        String\n  slug        String  @unique\n  description String?\n\n  categoryId String\n  category   Category @relation(fields: [categoryId], references: [id])\n\n  brandId String?\n  brand   Brand?  @relation(fields: [brandId], references: [id])\n\n  status ProductStatus @default(DRAFT)\n\n  variants    ProductVariant[]\n  images      ProductImage[]\n  collections ProductCollection[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([categoryId])\n  @@index([brandId])\n  @@index([status])\n}\n\nmodel ProductVariant {\n  id String @id @default(cuid())\n\n  productId String\n  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n\n  sku String @unique\n\n  price          Decimal  @db.Decimal(10, 2)\n  compareAtPrice Decimal? @db.Decimal(10, 2)\n\n  stockQuantity Int @default(0)\n\n  attributes Json?\n\n  productVariantImages ProductVariantImage[]\n  cartItems            CartItem[]\n  orderItems           OrderItem[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([productId])\n}\n\nmodel ProductImage {\n  id String @id @default(cuid())\n\n  productId String\n  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n\n  url      String\n  position Int    @default(0)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([productId])\n}\n\nmodel ProductVariantImage {\n  id String @id @default(cuid())\n\n  variantId String\n  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)\n\n  url      String\n  position Int    @default(0)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([variantId])\n}\n\nmodel Brand {\n  id          String  @id @default(cuid())\n  name        String\n  slug        String  @unique\n  description String?\n  logoUrl     String?\n\n  products Product[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Cart {\n  id String @id @default(cuid())\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  items CartItem[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel CartItem {\n  id String @id @default(cuid())\n\n  cartId String\n  cart   Cart   @relation(fields: [cartId], references: [id], onDelete: Cascade)\n\n  variantId String\n  variant   ProductVariant @relation(fields: [variantId], references: [id])\n\n  quantity Int @default(1)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@unique([cartId, variantId])\n  @@index([variantId])\n}\n\nmodel Order {\n  id String @id @default(cuid())\n\n  orderNumber String @unique\n\n  userId String\n  user   User   @relation(fields: [userId], references: [id])\n\n  status OrderStatus @default(PENDING)\n\n  subtotal      Decimal @db.Decimal(10, 2)\n  discountTotal Decimal @default(0) @db.Decimal(10, 2)\n  shippingFee   Decimal @default(0) @db.Decimal(10, 2)\n  tax           Decimal @default(0) @db.Decimal(10, 2)\n  grandTotal    Decimal @db.Decimal(10, 2)\n\n  // Shipping address snapshot\n  shippingName       String\n  shippingPhone      String\n  shippingAddress    String\n  shippingCity       String\n  shippingPostalCode String?\n  shippingCountry    String  @default("Bangladesh")\n\n  items    OrderItem[]\n  payments Payment[]\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([userId])\n  @@index([status])\n}\n\nmodel OrderItem {\n  id String @id @default(cuid())\n\n  orderId String\n  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  variantId String\n  variant   ProductVariant @relation(fields: [variantId], references: [id])\n\n  productName String\n  sku         String\n\n  unitPrice Decimal @db.Decimal(10, 2)\n  quantity  Int\n\n  totalPrice Decimal @db.Decimal(10, 2)\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([orderId])\n  @@index([variantId])\n}\n\nmodel Payment {\n  id String @id @default(cuid())\n\n  orderId String\n  order   Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  method   PaymentMethod\n  provider String?\n\n  transactionId String? @unique\n\n  amount Decimal @db.Decimal(10, 2)\n\n  status PaymentStatus @default(PENDING)\n\n  paidAt DateTime?\n\n  isDeleted Boolean @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([orderId])\n  @@index([status])\n}\n\nmodel Collection {\n  id          String  @id @default(cuid())\n  name        String\n  slug        String  @unique\n  description String?\n  imageUrl    String?\n  isActive    Boolean @default(true)\n\n  products ProductCollection[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel ProductCollection {\n  productId    String\n  collectionId String\n\n  product    Product    @relation(fields: [productId], references: [id], onDelete: Cascade)\n  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n\n  @@id([productId, collectionId])\n  @@index([collectionId])\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToUser"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToUser"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AddressToUser"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address1","kind":"scalar","type":"String"},{"name":"address2","kind":"scalar","type":"String"},{"name":"city","kind":"scalar","type":"String"},{"name":"upozila","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"parentId","kind":"scalar","type":"String"},{"name":"parent","kind":"object","type":"Category","relationName":"CategoryChildren"},{"name":"children","kind":"object","type":"Category","relationName":"CategoryChildren"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"products","kind":"object","type":"Product","relationName":"CategoryToProduct"}],"dbName":null},"Product":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToProduct"},{"name":"brandId","kind":"scalar","type":"String"},{"name":"brand","kind":"object","type":"Brand","relationName":"BrandToProduct"},{"name":"status","kind":"enum","type":"ProductStatus"},{"name":"variants","kind":"object","type":"ProductVariant","relationName":"ProductToProductVariant"},{"name":"images","kind":"object","type":"ProductImage","relationName":"ProductToProductImage"},{"name":"collections","kind":"object","type":"ProductCollection","relationName":"ProductToProductCollection"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ProductVariant":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductVariant"},{"name":"sku","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"compareAtPrice","kind":"scalar","type":"Decimal"},{"name":"stockQuantity","kind":"scalar","type":"Int"},{"name":"attributes","kind":"scalar","type":"Json"},{"name":"productVariantImages","kind":"object","type":"ProductVariantImage","relationName":"ProductVariantToProductVariantImage"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToProductVariant"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToProductVariant"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ProductImage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"productId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductImage"},{"name":"url","kind":"scalar","type":"String"},{"name":"position","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ProductVariantImage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"variantId","kind":"scalar","type":"String"},{"name":"variant","kind":"object","type":"ProductVariant","relationName":"ProductVariantToProductVariantImage"},{"name":"url","kind":"scalar","type":"String"},{"name":"position","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Brand":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"products","kind":"object","type":"Product","relationName":"BrandToProduct"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Cart":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"CartToUser"},{"name":"items","kind":"object","type":"CartItem","relationName":"CartToCartItem"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cartId","kind":"scalar","type":"String"},{"name":"cart","kind":"object","type":"Cart","relationName":"CartToCartItem"},{"name":"variantId","kind":"scalar","type":"String"},{"name":"variant","kind":"object","type":"ProductVariant","relationName":"CartItemToProductVariant"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"subtotal","kind":"scalar","type":"Decimal"},{"name":"discountTotal","kind":"scalar","type":"Decimal"},{"name":"shippingFee","kind":"scalar","type":"Decimal"},{"name":"tax","kind":"scalar","type":"Decimal"},{"name":"grandTotal","kind":"scalar","type":"Decimal"},{"name":"shippingName","kind":"scalar","type":"String"},{"name":"shippingPhone","kind":"scalar","type":"String"},{"name":"shippingAddress","kind":"scalar","type":"String"},{"name":"shippingCity","kind":"scalar","type":"String"},{"name":"shippingPostalCode","kind":"scalar","type":"String"},{"name":"shippingCountry","kind":"scalar","type":"String"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"},{"name":"payments","kind":"object","type":"Payment","relationName":"OrderToPayment"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"},{"name":"variantId","kind":"scalar","type":"String"},{"name":"variant","kind":"object","type":"ProductVariant","relationName":"OrderItemToProductVariant"},{"name":"productName","kind":"scalar","type":"String"},{"name":"sku","kind":"scalar","type":"String"},{"name":"unitPrice","kind":"scalar","type":"Decimal"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"totalPrice","kind":"scalar","type":"Decimal"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToPayment"},{"name":"method","kind":"enum","type":"PaymentMethod"},{"name":"provider","kind":"scalar","type":"String"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Collection":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"products","kind":"object","type":"ProductCollection","relationName":"CollectionToProductCollection"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ProductCollection":{"fields":[{"name":"productId","kind":"scalar","type":"String"},{"name":"collectionId","kind":"scalar","type":"String"},{"name":"product","kind":"object","type":"Product","relationName":"ProductToProductCollection"},{"name":"collection","kind":"object","type":"Collection","relationName":"CollectionToProductCollection"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","address","cart","parent","children","products","_count","category","brand","variants","product","images","collection","collections","variant","productVariantImages","cartItems","items","order","payments","orderItems","orders","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Product.findUnique","Product.findUniqueOrThrow","Product.findFirst","Product.findFirstOrThrow","Product.findMany","Product.createOne","Product.createMany","Product.createManyAndReturn","Product.updateOne","Product.updateMany","Product.updateManyAndReturn","Product.upsertOne","Product.deleteOne","Product.deleteMany","Product.groupBy","Product.aggregate","ProductVariant.findUnique","ProductVariant.findUniqueOrThrow","ProductVariant.findFirst","ProductVariant.findFirstOrThrow","ProductVariant.findMany","ProductVariant.createOne","ProductVariant.createMany","ProductVariant.createManyAndReturn","ProductVariant.updateOne","ProductVariant.updateMany","ProductVariant.updateManyAndReturn","ProductVariant.upsertOne","ProductVariant.deleteOne","ProductVariant.deleteMany","_avg","_sum","ProductVariant.groupBy","ProductVariant.aggregate","ProductImage.findUnique","ProductImage.findUniqueOrThrow","ProductImage.findFirst","ProductImage.findFirstOrThrow","ProductImage.findMany","ProductImage.createOne","ProductImage.createMany","ProductImage.createManyAndReturn","ProductImage.updateOne","ProductImage.updateMany","ProductImage.updateManyAndReturn","ProductImage.upsertOne","ProductImage.deleteOne","ProductImage.deleteMany","ProductImage.groupBy","ProductImage.aggregate","ProductVariantImage.findUnique","ProductVariantImage.findUniqueOrThrow","ProductVariantImage.findFirst","ProductVariantImage.findFirstOrThrow","ProductVariantImage.findMany","ProductVariantImage.createOne","ProductVariantImage.createMany","ProductVariantImage.createManyAndReturn","ProductVariantImage.updateOne","ProductVariantImage.updateMany","ProductVariantImage.updateManyAndReturn","ProductVariantImage.upsertOne","ProductVariantImage.deleteOne","ProductVariantImage.deleteMany","ProductVariantImage.groupBy","ProductVariantImage.aggregate","Brand.findUnique","Brand.findUniqueOrThrow","Brand.findFirst","Brand.findFirstOrThrow","Brand.findMany","Brand.createOne","Brand.createMany","Brand.createManyAndReturn","Brand.updateOne","Brand.updateMany","Brand.updateManyAndReturn","Brand.upsertOne","Brand.deleteOne","Brand.deleteMany","Brand.groupBy","Brand.aggregate","Cart.findUnique","Cart.findUniqueOrThrow","Cart.findFirst","Cart.findFirstOrThrow","Cart.findMany","Cart.createOne","Cart.createMany","Cart.createManyAndReturn","Cart.updateOne","Cart.updateMany","Cart.updateManyAndReturn","Cart.upsertOne","Cart.deleteOne","Cart.deleteMany","Cart.groupBy","Cart.aggregate","CartItem.findUnique","CartItem.findUniqueOrThrow","CartItem.findFirst","CartItem.findFirstOrThrow","CartItem.findMany","CartItem.createOne","CartItem.createMany","CartItem.createManyAndReturn","CartItem.updateOne","CartItem.updateMany","CartItem.updateManyAndReturn","CartItem.upsertOne","CartItem.deleteOne","CartItem.deleteMany","CartItem.groupBy","CartItem.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Collection.findUnique","Collection.findUniqueOrThrow","Collection.findFirst","Collection.findFirstOrThrow","Collection.findMany","Collection.createOne","Collection.createMany","Collection.createManyAndReturn","Collection.updateOne","Collection.updateMany","Collection.updateManyAndReturn","Collection.upsertOne","Collection.deleteOne","Collection.deleteMany","Collection.groupBy","Collection.aggregate","ProductCollection.findUnique","ProductCollection.findUniqueOrThrow","ProductCollection.findFirst","ProductCollection.findFirstOrThrow","ProductCollection.findMany","ProductCollection.createOne","ProductCollection.createMany","ProductCollection.createManyAndReturn","ProductCollection.updateOne","ProductCollection.updateMany","ProductCollection.updateManyAndReturn","ProductCollection.upsertOne","ProductCollection.deleteOne","ProductCollection.deleteMany","ProductCollection.groupBy","ProductCollection.aggregate","AND","OR","NOT","productId","collectionId","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","id","name","slug","description","imageUrl","isActive","updatedAt","every","some","none","orderId","PaymentMethod","method","provider","transactionId","amount","PaymentStatus","status","paidAt","isDeleted","variantId","productName","sku","unitPrice","quantity","totalPrice","deletedAt","orderNumber","userId","OrderStatus","subtotal","discountTotal","shippingFee","tax","grandTotal","shippingName","shippingPhone","shippingAddress","shippingCity","shippingPostalCode","shippingCountry","cartId","logoUrl","url","position","price","compareAtPrice","stockQuantity","attributes","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","categoryId","brandId","ProductStatus","parentId","fullName","phone","address1","address2","city","upozila","district","country","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","UserRole","role","UserStatus","needPasswordChange","productId_collectionId","cartId_variantId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "vAinAaACFAQAALwEACAFAAC9BAAgBgAAvgQAIAcAAL8EACAaAADABAAgwwIAALkEADDEAgAATwAQxQIAALkEADDIAkAA_wMAIdQCAQAAAAHVAgEA_AMAIdoCQAD_AwAh5QIAALsErAMi5wIgAP4DACHuAkAAmQQAIaYDAQAAAAGnAyAA_gMAIagDAQD9AwAhqgMAALoEqgMirAMgAP4DACEBAAAAAQAgDAMAAJoEACDDAgAA5AQAMMQCAAADABDFAgAA5AQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIfACAQD8AwAhmQNAAP8DACGjAwEA_AMAIaQDAQD9AwAhpQMBAP0DACEDAwAA2AUAIKQDAADuBAAgpQMAAO4EACAMAwAAmgQAIMMCAADkBAAwxAIAAAMAEMUCAADkBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHwAgEA_AMAIZkDQAD_AwAhowMBAAAAAaQDAQD9AwAhpQMBAP0DACEDAAAAAwAgAQAABAAwAgAABQAgEQMAAJoEACDDAgAA4wQAMMQCAAAHABDFAgAA4wQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIfACAQD8AwAhmgMBAPwDACGbAwEA_AMAIZwDAQD9AwAhnQMBAP0DACGeAwEA_QMAIZ8DQACZBAAhoANAAJkEACGhAwEA_QMAIaIDAQD9AwAhCAMAANgFACCcAwAA7gQAIJ0DAADuBAAgngMAAO4EACCfAwAA7gQAIKADAADuBAAgoQMAAO4EACCiAwAA7gQAIBEDAACaBAAgwwIAAOMEADDEAgAABwAQxQIAAOMEADDIAkAA_wMAIdQCAQAAAAHaAkAA_wMAIfACAQD8AwAhmgMBAPwDACGbAwEA_AMAIZwDAQD9AwAhnQMBAP0DACGeAwEA_QMAIZ8DQACZBAAhoANAAJkEACGhAwEA_QMAIaIDAQD9AwAhAwAAAAcAIAEAAAgAMAIAAAkAIBEDAACaBAAgwwIAAK0EADDEAgAACwAQxQIAAK0EADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHuAkAAmQQAIfACAQD8AwAhjwMBAPwDACGQAwEA_AMAIZEDAQD8AwAhkgMBAP0DACGTAwEA_AMAIZQDAQD8AwAhlQMBAPwDACGWAwEA_AMAIQEAAAALACALAwAAmgQAIBYAAJsEACDDAgAAmAQAMMQCAAANABDFAgAAmAQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACHwAgEA_AMAIQEAAAANACANBwAA4gQAIBMAAMwEACDDAgAA4QQAMMQCAAAPABDFAgAA4QQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh6AIBAPwDACHsAgIAywQAIe4CQACZBAAh_QIBAPwDACEDBwAAxQcAIBMAAMoHACDuAgAA7gQAIA4HAADiBAAgEwAAzAQAIMMCAADhBAAwxAIAAA8AEMUCAADhBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHnAiAA_gMAIegCAQD8AwAh7AICAMsEACHuAkAAmQQAIf0CAQD8AwAhrgMAAOAEACADAAAADwAgAQAAEAAwAgAAEQAgDggAAN4EACAJAADfBAAgCgAAngQAIMMCAADdBAAwxAIAABMAEMUCAADdBAAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACGOAwEA_QMAIQEAAAATACAFCAAAzgcAIAkAANIHACAKAAC6BgAg7gIAAO4EACCOAwAA7gQAIA4IAADeBAAgCQAA3wQAIAoAAJ4EACDDAgAA3QQAMMQCAAATABDFAgAA3QQAMMgCQAD_AwAh1AIBAAAAAdUCAQD8AwAh1gIBAAAAAdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIY4DAQD9AwAhAwAAABMAIAEAABUAMAIAABYAIBMMAADZBAAgDQAA2gQAIA4AANsEACAQAADcBAAgEgAAgAQAIMMCAADXBAAwxAIAABgAEMUCAADXBAAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHXAgEA_QMAIdoCQAD_AwAh5QIAANgEjgMi5wIgAP4DACHuAkAAmQQAIYsDAQD8AwAhjAMBAP0DACEIDAAAzgcAIA0AAM8HACAOAADQBwAgEAAA0QcAIBIAAIIFACDXAgAA7gQAIO4CAADuBAAgjAMAAO4EACATDAAA2QQAIA0AANoEACAOAADbBAAgEAAA3AQAIBIAAIAEACDDAgAA1wQAMMQCAAAYABDFAgAA1wQAMMgCQAD_AwAh1AIBAAAAAdUCAQD8AwAh1gIBAAAAAdcCAQD9AwAh2gJAAP8DACHlAgAA2ASOAyLnAiAA_gMAIe4CQACZBAAhiwMBAPwDACGMAwEA_QMAIQMAAAAYACABAAAZADACAAAaACABAAAAEwAgAQAAABgAIA0KAACeBAAgwwIAAJ0EADDEAgAAHgAQxQIAAJ0EADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdcCAQD9AwAh2gJAAP8DACHnAiAA_gMAIe4CQACZBAAh_gIBAP0DACEBAAAAHgAgAwAAABgAIAEAABkAMAIAABoAIAEAAAAYACASDwAA0AQAIBQAANYEACAVAACbBAAgGQAAxAQAIMMCAADTBAAwxAIAACIAEMUCAADTBAAwxgIBAPwDACHIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIeoCAQD8AwAh7gJAAJkEACGBAxAAwwQAIYIDEADUBAAhgwMCAMsEACGEAwAA1QQAIAcPAADLBwAgFAAAzQcAIBUAANkFACAZAADHBwAg7gIAAO4EACCCAwAA7gQAIIQDAADuBAAgEg8AANAEACAUAADWBAAgFQAAmwQAIBkAAMQEACDDAgAA0wQAMMQCAAAiABDFAgAA0wQAMMYCAQD8AwAhyAJAAP8DACHUAgEAAAAB2gJAAP8DACHnAiAA_gMAIeoCAQAAAAHuAkAAmQQAIYEDEADDBAAhggMQANQEACGDAwIAywQAIYQDAADVBAAgAwAAACIAIAEAACMAMAIAACQAIAwPAADQBAAgwwIAANIEADDEAgAAJgAQxQIAANIEADDGAgEA_AMAIcgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACH_AgEA_AMAIYADAgDLBAAhAg8AAMsHACDuAgAA7gQAIAwPAADQBAAgwwIAANIEADDEAgAAJgAQxQIAANIEADDGAgEA_AMAIcgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACEDAAAAJgAgAQAAJwAwAgAAKAAgCA8AANAEACARAADRBAAgwwIAAM8EADDEAgAAKgAQxQIAAM8EADDGAgEA_AMAIccCAQD8AwAhyAJAAP8DACECDwAAywcAIBEAAMwHACAJDwAA0AQAIBEAANEEACDDAgAAzwQAMMQCAAAqABDFAgAAzwQAMMYCAQD8AwAhxwIBAPwDACHIAkAA_wMAIa0DAADOBAAgAwAAACoAIAEAACsAMAIAACwAIAMAAAAqACABAAArADACAAAsACABAAAAKgAgAQAAACIAIAEAAAAmACABAAAAKgAgDBMAAMwEACDDAgAAzQQAMMQCAAAzABDFAgAAzQQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh6AIBAPwDACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACECEwAAygcAIO4CAADuBAAgDBMAAMwEACDDAgAAzQQAMMQCAAAzABDFAgAAzQQAMMgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh5wIgAP4DACHoAgEA_AMAIe4CQACZBAAh_wIBAPwDACGAAwIAywQAIQMAAAAzACABAAA0ADACAAA1ACADAAAADwAgAQAAEAAwAgAAEQAgERMAAMwEACAXAADJBAAgwwIAAMoEADDEAgAAOAAQxQIAAMoEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHeAgEA_AMAIecCIAD-AwAh6AIBAPwDACHpAgEA_AMAIeoCAQD8AwAh6wIQAMMEACHsAgIAywQAIe0CEADDBAAh7gJAAJkEACEDEwAAygcAIBcAAMkHACDuAgAA7gQAIBETAADMBAAgFwAAyQQAIMMCAADKBAAwxAIAADgAEMUCAADKBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHeAgEA_AMAIecCIAD-AwAh6AIBAPwDACHpAgEA_AMAIeoCAQD8AwAh6wIQAMMEACHsAgIAywQAIe0CEADDBAAh7gJAAJkEACEDAAAAOAAgAQAAOQAwAgAAOgAgAwAAADgAIAEAADkAMAIAADoAIA8XAADJBAAgwwIAAMYEADDEAgAAPQAQxQIAAMYEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHeAgEA_AMAIeACAADHBOACIuECAQD9AwAh4gIBAP0DACHjAhAAwwQAIeUCAADIBOUCIuYCQACZBAAh5wIgAP4DACEEFwAAyQcAIOECAADuBAAg4gIAAO4EACDmAgAA7gQAIA8XAADJBAAgwwIAAMYEADDEAgAAPQAQxQIAAMYEADDIAkAA_wMAIdQCAQAAAAHaAkAA_wMAId4CAQD8AwAh4AIAAMcE4AIi4QIBAP0DACHiAgEAAAAB4wIQAMMEACHlAgAAyATlAiLmAkAAmQQAIecCIAD-AwAhAwAAAD0AIAEAAD4AMAIAAD8AIAEAAAA4ACABAAAAPQAgAQAAADMAIAEAAAAPACABAAAAOAAgAQAAAA8AIBkDAACaBAAgFgAAxAQAIBgAAMUEACDDAgAAwQQAMMQCAABHABDFAgAAwQQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIeUCAADCBPICIucCIAD-AwAh7gJAAJkEACHvAgEA_AMAIfACAQD8AwAh8gIQAMMEACHzAhAAwwQAIfQCEADDBAAh9QIQAMMEACH2AhAAwwQAIfcCAQD8AwAh-AIBAPwDACH5AgEA_AMAIfoCAQD8AwAh-wIBAP0DACH8AgEA_AMAIQUDAADYBQAgFgAAxwcAIBgAAMgHACDuAgAA7gQAIPsCAADuBAAgGQMAAJoEACAWAADEBAAgGAAAxQQAIMMCAADBBAAwxAIAAEcAEMUCAADBBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHlAgAAwgTyAiLnAiAA_gMAIe4CQACZBAAh7wIBAAAAAfACAQD8AwAh8gIQAMMEACHzAhAAwwQAIfQCEADDBAAh9QIQAMMEACH2AhAAwwQAIfcCAQD8AwAh-AIBAPwDACH5AgEA_AMAIfoCAQD8AwAh-wIBAP0DACH8AgEA_AMAIQMAAABHACABAABIADACAABJACABAAAAAwAgAQAAAAcAIAEAAABHACABAAAAAQAgFAQAALwEACAFAAC9BAAgBgAAvgQAIAcAAL8EACAaAADABAAgwwIAALkEADDEAgAATwAQxQIAALkEADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHaAkAA_wMAIeUCAAC7BKwDIucCIAD-AwAh7gJAAJkEACGmAwEA_AMAIacDIAD-AwAhqAMBAP0DACGqAwAAugSqAyKsAyAA_gMAIQcEAADCBwAgBQAAwwcAIAYAAMQHACAHAADFBwAgGgAAxgcAIO4CAADuBAAgqAMAAO4EACADAAAATwAgAQAAUAAwAgAAAQAgAwAAAE8AIAEAAFAAMAIAAAEAIAMAAABPACABAABQADACAAABACARBAAAvQcAIAUAAL4HACAGAAC_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_gYAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIfACAQDpBAAhmgMBAOkEACGbAwEA6QQAIZwDAQDyBAAhnQMBAPIEACGeAwEA8gQAIZ8DQACLBQAhoANAAIsFACGhAwEA8gQAIaIDAQDyBAAhAgAAAAkAICAAAIUBACANyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh8AIBAOkEACGaAwEA6QQAIZsDAQDpBAAhnAMBAPIEACGdAwEA8gQAIZ4DAQDyBAAhnwNAAIsFACGgA0AAiwUAIaEDAQDyBAAhogMBAPIEACECAAAABwAgIAAAhwEAIAIAAAAHACAgAACHAQAgAwAAAAkAICcAAIABACAoAACFAQAgAQAAAAkAIAEAAAAHACAKCwAA-wYAIC0AAP0GACAuAAD8BgAgnAMAAO4EACCdAwAA7gQAIJ4DAADuBAAgnwMAAO4EACCgAwAA7gQAIKEDAADuBAAgogMAAO4EACAQwwIAALAEADDEAgAAjgEAEMUCAACwBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh8AIBAOwDACGaAwEA7AMAIZsDAQDsAwAhnAMBAPQDACGdAwEA9AMAIZ4DAQD0AwAhnwNAAIUEACGgA0AAhQQAIaEDAQD0AwAhogMBAPQDACEDAAAABwAgAQAAjQEAMCwAAI4BACADAAAABwAgAQAACAAwAgAACQAgCcMCAACvBAAwxAIAAJQBABDFAgAArwQAMMgCQAD_AwAh1AIBAAAAAdoCQAD_AwAhlwMBAPwDACGYAwEA_AMAIZkDQAD_AwAhAQAAAJEBACABAAAAkQEAIAnDAgAArwQAMMQCAACUAQAQxQIAAK8EADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACGXAwEA_AMAIZgDAQD8AwAhmQNAAP8DACEAAwAAAJQBACABAACVAQAwAgAAkQEAIAMAAACUAQAgAQAAlQEAMAIAAJEBACADAAAAlAEAIAEAAJUBADACAACRAQAgBsgCQAAAAAHUAgEAAAAB2gJAAAAAAZcDAQAAAAGYAwEAAAABmQNAAAAAAQEgAACZAQAgBsgCQAAAAAHUAgEAAAAB2gJAAAAAAZcDAQAAAAGYAwEAAAABmQNAAAAAAQEgAACbAQAwASAAAJsBADAGyAJAAOgEACHUAgEA6QQAIdoCQADoBAAhlwMBAOkEACGYAwEA6QQAIZkDQADoBAAhAgAAAJEBACAgAACeAQAgBsgCQADoBAAh1AIBAOkEACHaAkAA6AQAIZcDAQDpBAAhmAMBAOkEACGZA0AA6AQAIQIAAACUAQAgIAAAoAEAIAIAAACUAQAgIAAAoAEAIAMAAACRAQAgJwAAmQEAICgAAJ4BACABAAAAkQEAIAEAAACUAQAgAwsAAPgGACAtAAD6BgAgLgAA-QYAIAnDAgAArgQAMMQCAACnAQAQxQIAAK4EADDIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACGXAwEA7AMAIZgDAQDsAwAhmQNAAO0DACEDAAAAlAEAIAEAAKYBADAsAACnAQAgAwAAAJQBACABAACVAQAwAgAAkQEAIBEDAACaBAAgwwIAAK0EADDEAgAACwAQxQIAAK0EADDIAkAA_wMAIdQCAQAAAAHaAkAA_wMAIe4CQACZBAAh8AIBAAAAAY8DAQD8AwAhkAMBAPwDACGRAwEA_AMAIZIDAQD9AwAhkwMBAPwDACGUAwEA_AMAIZUDAQD8AwAhlgMBAPwDACEBAAAAqgEAIAEAAACqAQAgAwMAANgFACDuAgAA7gQAIJIDAADuBAAgAwAAAAsAIAEAAK0BADACAACqAQAgAwAAAAsAIAEAAK0BADACAACqAQAgAwAAAAsAIAEAAK0BADACAACqAQAgDgMAAPcGACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHuAkAAAAAB8AIBAAAAAY8DAQAAAAGQAwEAAAABkQMBAAAAAZIDAQAAAAGTAwEAAAABlAMBAAAAAZUDAQAAAAGWAwEAAAABASAAALEBACANyAJAAAAAAdQCAQAAAAHaAkAAAAAB7gJAAAAAAfACAQAAAAGPAwEAAAABkAMBAAAAAZEDAQAAAAGSAwEAAAABkwMBAAAAAZQDAQAAAAGVAwEAAAABlgMBAAAAAQEgAACzAQAwASAAALMBADAOAwAA9gYAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIe4CQACLBQAh8AIBAOkEACGPAwEA6QQAIZADAQDpBAAhkQMBAOkEACGSAwEA8gQAIZMDAQDpBAAhlAMBAOkEACGVAwEA6QQAIZYDAQDpBAAhAgAAAKoBACAgAAC2AQAgDcgCQADoBAAh1AIBAOkEACHaAkAA6AQAIe4CQACLBQAh8AIBAOkEACGPAwEA6QQAIZADAQDpBAAhkQMBAOkEACGSAwEA8gQAIZMDAQDpBAAhlAMBAOkEACGVAwEA6QQAIZYDAQDpBAAhAgAAAAsAICAAALgBACACAAAACwAgIAAAuAEAIAMAAACqAQAgJwAAsQEAICgAALYBACABAAAAqgEAIAEAAAALACAFCwAA8wYAIC0AAPUGACAuAAD0BgAg7gIAAO4EACCSAwAA7gQAIBDDAgAArAQAMMQCAAC_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_AEAIAvGAgEA6QQAIcgCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh6gIBAOkEACHuAkAAiwUAIYEDEACJBQAhggMQAI0GACGDAwIAkwUAIYQDgAAAAAECAAAAIgAgIAAA_gEAIAIAAAAiACAgAAD-AQAgAwAAACQAICcAAPcBACAoAAD8AQAgAQAAACQAIAEAAAAiACAICwAAyQYAIC0AAMwGACAuAADLBgAgnwEAAMoGACCgAQAAzQYAIO4CAADuBAAgggMAAO4EACCEAwAA7gQAIA7DAgAAoQQAMMQCAACFAgAQxQIAAKEEADDGAgEA7AMAIcgCQADtAwAh1AIBAOwDACHaAkAA7QMAIecCIAD1AwAh6gIBAOwDACHuAkAAhQQAIYEDEACDBAAhggMQAKIEACGDAwIAjwQAIYQDAACjBAAgAwAAACIAIAEAAIQCADAsAACFAgAgAwAAACIAIAEAACMAMAIAACQAIAEAAAAoACABAAAAKAAgAwAAACYAIAEAACcAMAIAACgAIAMAAAAmACABAAAnADACAAAoACADAAAAJgAgAQAAJwAwAgAAKAAgCQ8AAMgGACDGAgEAAAAByAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH_AgEAAAABgAMCAAAAAQEgAACNAgAgCMYCAQAAAAHIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7gJAAAAAAf8CAQAAAAGAAwIAAAABASAAAI8CADABIAAAjwIAMAkPAADHBgAgxgIBAOkEACHIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIe4CQACLBQAh_wIBAOkEACGAAwIAkwUAIQIAAAAoACAgAACSAgAgCMYCAQDpBAAhyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf8CAQDpBAAhgAMCAJMFACECAAAAJgAgIAAAlAIAIAIAAAAmACAgAACUAgAgAwAAACgAICcAAI0CACAoAACSAgAgAQAAACgAIAEAAAAmACAGCwAAwgYAIC0AAMUGACAuAADEBgAgnwEAAMMGACCgAQAAxgYAIO4CAADuBAAgC8MCAACgBAAwxAIAAJsCABDFAgAAoAQAMMYCAQDsAwAhyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh5wIgAPUDACHuAkAAhQQAIf8CAQDsAwAhgAMCAI8EACEDAAAAJgAgAQAAmgIAMCwAAJsCACADAAAAJgAgAQAAJwAwAgAAKAAgAQAAADUAIAEAAAA1ACADAAAAMwAgAQAANAAwAgAANQAgAwAAADMAIAEAADQAMAIAADUAIAMAAAAzACABAAA0ADACAAA1ACAJEwAAwQYAIMgCQAAAAAHUAgEAAAAB2gJAAAAAAecCIAAAAAHoAgEAAAAB7gJAAAAAAf8CAQAAAAGAAwIAAAABASAAAKMCACAIyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAegCAQAAAAHuAkAAAAAB_wIBAAAAAYADAgAAAAEBIAAApQIAMAEgAAClAgAwCRMAAMAGACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIegCAQDpBAAh7gJAAIsFACH_AgEA6QQAIYADAgCTBQAhAgAAADUAICAAAKgCACAIyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHoAgEA6QQAIe4CQACLBQAh_wIBAOkEACGAAwIAkwUAIQIAAAAzACAgAACqAgAgAgAAADMAICAAAKoCACADAAAANQAgJwAAowIAICgAAKgCACABAAAANQAgAQAAADMAIAYLAAC7BgAgLQAAvgYAIC4AAL0GACCfAQAAvAYAIKABAAC_BgAg7gIAAO4EACALwwIAAJ8EADDEAgAAsQIAEMUCAACfBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh5wIgAPUDACHoAgEA7AMAIe4CQACFBAAh_wIBAOwDACGAAwIAjwQAIQMAAAAzACABAACwAgAwLAAAsQIAIAMAAAAzACABAAA0ADACAAA1ACANCgAAngQAIMMCAACdBAAwxAIAAB4AEMUCAACdBAAwyAJAAP8DACHUAgEAAAAB1QIBAPwDACHWAgEAAAAB1wIBAP0DACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACH-AgEA_QMAIQEAAAC0AgAgAQAAALQCACAECgAAugYAINcCAADuBAAg7gIAAO4EACD-AgAA7gQAIAMAAAAeACABAAC3AgAwAgAAtAIAIAMAAAAeACABAAC3AgAwAgAAtAIAIAMAAAAeACABAAC3AgAwAgAAtAIAIAoKAAC5BgAgyAJAAAAAAdQCAQAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH-AgEAAAABASAAALsCACAJyAJAAAAAAdQCAQAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH-AgEAAAABASAAAL0CADABIAAAvQIAMAoKAADdBQAgyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh1gIBAOkEACHXAgEA8gQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf4CAQDyBAAhAgAAALQCACAgAADAAgAgCcgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdYCAQDpBAAh1wIBAPIEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACH-AgEA8gQAIQIAAAAeACAgAADCAgAgAgAAAB4AICAAAMICACADAAAAtAIAICcAALsCACAoAADAAgAgAQAAALQCACABAAAAHgAgBgsAANoFACAtAADcBQAgLgAA2wUAINcCAADuBAAg7gIAAO4EACD-AgAA7gQAIAzDAgAAnAQAMMQCAADJAgAQxQIAAJwEADDIAkAA7QMAIdQCAQDsAwAh1QIBAOwDACHWAgEA7AMAIdcCAQD0AwAh2gJAAO0DACHnAiAA9QMAIe4CQACFBAAh_gIBAPQDACEDAAAAHgAgAQAAyAIAMCwAAMkCACADAAAAHgAgAQAAtwIAMAIAALQCACALAwAAmgQAIBYAAJsEACDDAgAAmAQAMMQCAAANABDFAgAAmAQAMMgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIfACAQAAAAEBAAAAzAIAIAEAAADMAgAgAwMAANgFACAWAADZBQAg7gIAAO4EACADAAAADQAgAQAAzwIAMAIAAMwCACADAAAADQAgAQAAzwIAMAIAAMwCACADAAAADQAgAQAAzwIAMAIAAMwCACAIAwAA1gUAIBYAANcFACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7gJAAAAAAfACAQAAAAEBIAAA0wIAIAbIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7gJAAAAAAfACAQAAAAEBIAAA1QIAMAEgAADVAgAwCAMAAMgFACAWAADJBQAgyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIfACAQDpBAAhAgAAAMwCACAgAADYAgAgBsgCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACHwAgEA6QQAIQIAAAANACAgAADaAgAgAgAAAA0AICAAANoCACADAAAAzAIAICcAANMCACAoAADYAgAgAQAAAMwCACABAAAADQAgBAsAAMUFACAtAADHBQAgLgAAxgUAIO4CAADuBAAgCcMCAACXBAAwxAIAAOECABDFAgAAlwQAMMgCQADtAwAh1AIBAOwDACHaAkAA7QMAIecCIAD1AwAh7gJAAIUEACHwAgEA7AMAIQMAAAANACABAADgAgAwLAAA4QIAIAMAAAANACABAADPAgAwAgAAzAIAIAEAAAARACABAAAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgCgcAAMMFACATAADEBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAegCAQAAAAHsAgIAAAAB7gJAAAAAAf0CAQAAAAEBIAAA6QIAIAjIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB6AIBAAAAAewCAgAAAAHuAkAAAAAB_QIBAAAAAQEgAADrAgAwASAAAOsCADAKBwAAwQUAIBMAAMIFACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIegCAQDpBAAh7AICAJMFACHuAkAAiwUAIf0CAQDpBAAhAgAAABEAICAAAO4CACAIyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHoAgEA6QQAIewCAgCTBQAh7gJAAIsFACH9AgEA6QQAIQIAAAAPACAgAADwAgAgAgAAAA8AICAAAPACACADAAAAEQAgJwAA6QIAICgAAO4CACABAAAAEQAgAQAAAA8AIAYLAAC8BQAgLQAAvwUAIC4AAL4FACCfAQAAvQUAIKABAADABQAg7gIAAO4EACALwwIAAJYEADDEAgAA9wIAEMUCAACWBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh5wIgAPUDACHoAgEA7AMAIewCAgCPBAAh7gJAAIUEACH9AgEA7AMAIQMAAAAPACABAAD2AgAwLAAA9wIAIAMAAAAPACABAAAQADACAAARACABAAAASQAgAQAAAEkAIAMAAABHACABAABIADACAABJACADAAAARwAgAQAASAAwAgAASQAgAwAAAEcAIAEAAEgAMAIAAEkAIBYDAAC5BQAgFgAAugUAIBgAALsFACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHlAgAAAPICAucCIAAAAAHuAkAAAAAB7wIBAAAAAfACAQAAAAHyAhAAAAAB8wIQAAAAAfQCEAAAAAH1AhAAAAAB9gIQAAAAAfcCAQAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAQEgAAD_AgAgE8gCQAAAAAHUAgEAAAAB2gJAAAAAAeUCAAAA8gIC5wIgAAAAAe4CQAAAAAHvAgEAAAAB8AIBAAAAAfICEAAAAAHzAhAAAAAB9AIQAAAAAfUCEAAAAAH2AhAAAAAB9wIBAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAABASAAAIEDADABIAAAgQMAMBYDAACeBQAgFgAAnwUAIBgAAKAFACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHlAgAAnQXyAiLnAiAA8wQAIe4CQACLBQAh7wIBAOkEACHwAgEA6QQAIfICEACJBQAh8wIQAIkFACH0AhAAiQUAIfUCEACJBQAh9gIQAIkFACH3AgEA6QQAIfgCAQDpBAAh-QIBAOkEACH6AgEA6QQAIfsCAQDyBAAh_AIBAOkEACECAAAASQAgIAAAhAMAIBPIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHlAgAAnQXyAiLnAiAA8wQAIe4CQACLBQAh7wIBAOkEACHwAgEA6QQAIfICEACJBQAh8wIQAIkFACH0AhAAiQUAIfUCEACJBQAh9gIQAIkFACH3AgEA6QQAIfgCAQDpBAAh-QIBAOkEACH6AgEA6QQAIfsCAQDyBAAh_AIBAOkEACECAAAARwAgIAAAhgMAIAIAAABHACAgAACGAwAgAwAAAEkAICcAAP8CACAoAACEAwAgAQAAAEkAIAEAAABHACAHCwAAmAUAIC0AAJsFACAuAACaBQAgnwEAAJkFACCgAQAAnAUAIO4CAADuBAAg-wIAAO4EACAWwwIAAJIEADDEAgAAjQMAEMUCAACSBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh5QIAAJME8gIi5wIgAPUDACHuAkAAhQQAIe8CAQDsAwAh8AIBAOwDACHyAhAAgwQAIfMCEACDBAAh9AIQAIMEACH1AhAAgwQAIfYCEACDBAAh9wIBAOwDACH4AgEA7AMAIfkCAQDsAwAh-gIBAOwDACH7AgEA9AMAIfwCAQDsAwAhAwAAAEcAIAEAAIwDADAsAACNAwAgAwAAAEcAIAEAAEgAMAIAAEkAIAEAAAA6ACABAAAAOgAgAwAAADgAIAEAADkAMAIAADoAIAMAAAA4ACABAAA5ADACAAA6ACADAAAAOAAgAQAAOQAwAgAAOgAgDhMAAJcFACAXAACWBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB3gIBAAAAAecCIAAAAAHoAgEAAAAB6QIBAAAAAeoCAQAAAAHrAhAAAAAB7AICAAAAAe0CEAAAAAHuAkAAAAABASAAAJUDACAMyAJAAAAAAdQCAQAAAAHaAkAAAAAB3gIBAAAAAecCIAAAAAHoAgEAAAAB6QIBAAAAAeoCAQAAAAHrAhAAAAAB7AICAAAAAe0CEAAAAAHuAkAAAAABASAAAJcDADABIAAAlwMAMA4TAACVBQAgFwAAlAUAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAId4CAQDpBAAh5wIgAPMEACHoAgEA6QQAIekCAQDpBAAh6gIBAOkEACHrAhAAiQUAIewCAgCTBQAh7QIQAIkFACHuAkAAiwUAIQIAAAA6ACAgAACaAwAgDMgCQADoBAAh1AIBAOkEACHaAkAA6AQAId4CAQDpBAAh5wIgAPMEACHoAgEA6QQAIekCAQDpBAAh6gIBAOkEACHrAhAAiQUAIewCAgCTBQAh7QIQAIkFACHuAkAAiwUAIQIAAAA4ACAgAACcAwAgAgAAADgAICAAAJwDACADAAAAOgAgJwAAlQMAICgAAJoDACABAAAAOgAgAQAAADgAIAYLAACOBQAgLQAAkQUAIC4AAJAFACCfAQAAjwUAIKABAACSBQAg7gIAAO4EACAPwwIAAI4EADDEAgAAowMAEMUCAACOBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh3gIBAOwDACHnAiAA9QMAIegCAQDsAwAh6QIBAOwDACHqAgEA7AMAIesCEACDBAAh7AICAI8EACHtAhAAgwQAIe4CQACFBAAhAwAAADgAIAEAAKIDADAsAACjAwAgAwAAADgAIAEAADkAMAIAADoAIAEAAAA_ACABAAAAPwAgAwAAAD0AIAEAAD4AMAIAAD8AIAMAAAA9ACABAAA-ADACAAA_ACADAAAAPQAgAQAAPgAwAgAAPwAgDBcAAI0FACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHeAgEAAAAB4AIAAADgAgLhAgEAAAAB4gIBAAAAAeMCEAAAAAHlAgAAAOUCAuYCQAAAAAHnAiAAAAABASAAAKsDACALyAJAAAAAAdQCAQAAAAHaAkAAAAAB3gIBAAAAAeACAAAA4AIC4QIBAAAAAeICAQAAAAHjAhAAAAAB5QIAAADlAgLmAkAAAAAB5wIgAAAAAQEgAACtAwAwASAAAK0DADAMFwAAjAUAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAId4CAQDpBAAh4AIAAIgF4AIi4QIBAPIEACHiAgEA8gQAIeMCEACJBQAh5QIAAIoF5QIi5gJAAIsFACHnAiAA8wQAIQIAAAA_ACAgAACwAwAgC8gCQADoBAAh1AIBAOkEACHaAkAA6AQAId4CAQDpBAAh4AIAAIgF4AIi4QIBAPIEACHiAgEA8gQAIeMCEACJBQAh5QIAAIoF5QIi5gJAAIsFACHnAiAA8wQAIQIAAAA9ACAgAACyAwAgAgAAAD0AICAAALIDACADAAAAPwAgJwAAqwMAICgAALADACABAAAAPwAgAQAAAD0AIAgLAACDBQAgLQAAhgUAIC4AAIUFACCfAQAAhAUAIKABAACHBQAg4QIAAO4EACDiAgAA7gQAIOYCAADuBAAgDsMCAACBBAAwxAIAALkDABDFAgAAgQQAMMgCQADtAwAh1AIBAOwDACHaAkAA7QMAId4CAQDsAwAh4AIAAIIE4AIi4QIBAPQDACHiAgEA9AMAIeMCEACDBAAh5QIAAIQE5QIi5gJAAIUEACHnAiAA9QMAIQMAAAA9ACABAAC4AwAwLAAAuQMAIAMAAAA9ACABAAA-ADACAAA_ACAMCgAAgAQAIMMCAAD7AwAwxAIAAL8DABDFAgAA-wMAMMgCQAD_AwAh1AIBAAAAAdUCAQD8AwAh1gIBAAAAAdcCAQD9AwAh2AIBAP0DACHZAiAA_gMAIdoCQAD_AwAhAQAAALwDACABAAAAvAMAIAwKAACABAAgwwIAAPsDADDEAgAAvwMAEMUCAAD7AwAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHXAgEA_QMAIdgCAQD9AwAh2QIgAP4DACHaAkAA_wMAIQMKAACCBQAg1wIAAO4EACDYAgAA7gQAIAMAAAC_AwAgAQAAwAMAMAIAALwDACADAAAAvwMAIAEAAMADADACAAC8AwAgAwAAAL8DACABAADAAwAwAgAAvAMAIAkKAACBBQAgyAJAAAAAAdQCAQAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHYAgEAAAAB2QIgAAAAAdoCQAAAAAEBIAAAxAMAIAjIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB1wIBAAAAAdgCAQAAAAHZAiAAAAAB2gJAAAAAAQEgAADGAwAwASAAAMYDADAJCgAA9AQAIMgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdYCAQDpBAAh1wIBAPIEACHYAgEA8gQAIdkCIADzBAAh2gJAAOgEACECAAAAvAMAICAAAMkDACAIyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh1gIBAOkEACHXAgEA8gQAIdgCAQDyBAAh2QIgAPMEACHaAkAA6AQAIQIAAAC_AwAgIAAAywMAIAIAAAC_AwAgIAAAywMAIAMAAAC8AwAgJwAAxAMAICgAAMkDACABAAAAvAMAIAEAAAC_AwAgBQsAAO8EACAtAADxBAAgLgAA8AQAINcCAADuBAAg2AIAAO4EACALwwIAAPMDADDEAgAA0gMAEMUCAADzAwAwyAJAAO0DACHUAgEA7AMAIdUCAQDsAwAh1gIBAOwDACHXAgEA9AMAIdgCAQD0AwAh2QIgAPUDACHaAkAA7QMAIQMAAAC_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-wMAMMgCQAD_AwAh1AIBAPwDACHVAgEA_AMAIdYCAQD8AwAh1wIBAP0DACHYAgEA_QMAIdkCIAD-AwAh2gJAAP8DACELyQIBAAAAAcoCAQAAAATLAgEAAAAEzAIBAAAAAc0CAQAAAAHOAgEAAAABzwIBAAAAAdACAQDyAwAh0QIBAAAAAdICAQAAAAHTAgEAAAABC8kCAQAAAAHKAgEAAAAFywIBAAAABcwCAQAAAAHNAgEAAAABzgIBAAAAAc8CAQAAAAHQAgEA-gMAIdECAQAAAAHSAgEAAAAB0wIBAAAAAQLJAiAAAAAB0AIgAPcDACEIyQJAAAAAAcoCQAAAAATLAkAAAAAEzAJAAAAAAc0CQAAAAAHOAkAAAAABzwJAAAAAAdACQADwAwAhA9sCAAAqACDcAgAAKgAg3QIAACoAIA7DAgAAgQQAMMQCAAC5AwAQxQIAAIEEADDIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACHeAgEA7AMAIeACAACCBOACIuECAQD0AwAh4gIBAPQDACHjAhAAgwQAIeUCAACEBOUCIuYCQACFBAAh5wIgAPUDACEHCwAA7wMAIC0AAI0EACAuAACNBAAgyQIAAADgAgLKAgAAAOACCMsCAAAA4AII0AIAAIwE4AIiDQsAAO8DACAtAACLBAAgLgAAiwQAIJ8BAACLBAAgoAEAAIsEACDJAhAAAAABygIQAAAABMsCEAAAAATMAhAAAAABzQIQAAAAAc4CEAAAAAHPAhAAAAAB0AIQAIoEACEHCwAA7wMAIC0AAIkEACAuAACJBAAgyQIAAADlAgLKAgAAAOUCCMsCAAAA5QII0AIAAIgE5QIiCwsAAPkDACAtAACHBAAgLgAAhwQAIMkCQAAAAAHKAkAAAAAFywJAAAAABcwCQAAAAAHNAkAAAAABzgJAAAAAAc8CQAAAAAHQAkAAhgQAIQsLAAD5AwAgLQAAhwQAIC4AAIcEACDJAkAAAAABygJAAAAABcsCQAAAAAXMAkAAAAABzQJAAAAAAc4CQAAAAAHPAkAAAAAB0AJAAIYEACEIyQJAAAAAAcoCQAAAAAXLAkAAAAAFzAJAAAAAAc0CQAAAAAHOAkAAAAABzwJAAAAAAdACQACHBAAhBwsAAO8DACAtAACJBAAgLgAAiQQAIMkCAAAA5QICygIAAADlAgjLAgAAAOUCCNACAACIBOUCIgTJAgAAAOUCAsoCAAAA5QIIywIAAADlAgjQAgAAiQTlAiINCwAA7wMAIC0AAIsEACAuAACLBAAgnwEAAIsEACCgAQAAiwQAIMkCEAAAAAHKAhAAAAAEywIQAAAABMwCEAAAAAHNAhAAAAABzgIQAAAAAc8CEAAAAAHQAhAAigQAIQjJAhAAAAABygIQAAAABMsCEAAAAATMAhAAAAABzQIQAAAAAc4CEAAAAAHPAhAAAAAB0AIQAIsEACEHCwAA7wMAIC0AAI0EACAuAACNBAAgyQIAAADgAgLKAgAAAOACCMsCAAAA4AII0AIAAIwE4AIiBMkCAAAA4AICygIAAADgAgjLAgAAAOACCNACAACNBOACIg_DAgAAjgQAMMQCAACjAwAQxQIAAI4EADDIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACHeAgEA7AMAIecCIAD1AwAh6AIBAOwDACHpAgEA7AMAIeoCAQDsAwAh6wIQAIMEACHsAgIAjwQAIe0CEACDBAAh7gJAAIUEACENCwAA7wMAIC0AAO8DACAuAADvAwAgnwEAAJEEACCgAQAA7wMAIMkCAgAAAAHKAgIAAAAEywICAAAABMwCAgAAAAHNAgIAAAABzgICAAAAAc8CAgAAAAHQAgIAkAQAIQ0LAADvAwAgLQAA7wMAIC4AAO8DACCfAQAAkQQAIKABAADvAwAgyQICAAAAAcoCAgAAAATLAgIAAAAEzAICAAAAAc0CAgAAAAHOAgIAAAABzwICAAAAAdACAgCQBAAhCMkCCAAAAAHKAggAAAAEywIIAAAABMwCCAAAAAHNAggAAAABzgIIAAAAAc8CCAAAAAHQAggAkQQAIRbDAgAAkgQAMMQCAACNAwAQxQIAAJIEADDIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACHlAgAAkwTyAiLnAiAA9QMAIe4CQACFBAAh7wIBAOwDACHwAgEA7AMAIfICEACDBAAh8wIQAIMEACH0AhAAgwQAIfUCEACDBAAh9gIQAIMEACH3AgEA7AMAIfgCAQDsAwAh-QIBAOwDACH6AgEA7AMAIfsCAQD0AwAh_AIBAOwDACEHCwAA7wMAIC0AAJUEACAuAACVBAAgyQIAAADyAgLKAgAAAPICCMsCAAAA8gII0AIAAJQE8gIiBwsAAO8DACAtAACVBAAgLgAAlQQAIMkCAAAA8gICygIAAADyAgjLAgAAAPICCNACAACUBPICIgTJAgAAAPICAsoCAAAA8gIIywIAAADyAgjQAgAAlQTyAiILwwIAAJYEADDEAgAA9wIAEMUCAACWBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh5wIgAPUDACHoAgEA7AMAIewCAgCPBAAh7gJAAIUEACH9AgEA7AMAIQnDAgAAlwQAMMQCAADhAgAQxQIAAJcEADDIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACHnAiAA9QMAIe4CQACFBAAh8AIBAOwDACELAwAAmgQAIBYAAJsEACDDAgAAmAQAMMQCAAANABDFAgAAmAQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACHwAgEA_AMAIQjJAkAAAAABygJAAAAABcsCQAAAAAXMAkAAAAABzQJAAAAAAc4CQAAAAAHPAkAAAAAB0AJAAIcEACEWBAAAvAQAIAUAAL0EACAGAAC-BAAgBwAAvwQAIBoAAMAEACDDAgAAuQQAMMQCAABPABDFAgAAuQQAMMgCQAD_AwAh1AIBAPwDACHVAgEA_AMAIdoCQAD_AwAh5QIAALsErAMi5wIgAP4DACHuAkAAmQQAIaYDAQD8AwAhpwMgAP4DACGoAwEA_QMAIaoDAAC6BKoDIqwDIAD-AwAhrwMAAE8AILADAABPACAD2wIAAA8AINwCAAAPACDdAgAADwAgDMMCAACcBAAwxAIAAMkCABDFAgAAnAQAMMgCQADtAwAh1AIBAOwDACHVAgEA7AMAIdYCAQDsAwAh1wIBAPQDACHaAkAA7QMAIecCIAD1AwAh7gJAAIUEACH-AgEA9AMAIQ0KAACeBAAgwwIAAJ0EADDEAgAAHgAQxQIAAJ0EADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdcCAQD9AwAh2gJAAP8DACHnAiAA_gMAIe4CQACZBAAh_gIBAP0DACED2wIAABgAINwCAAAYACDdAgAAGAAgC8MCAACfBAAwxAIAALECABDFAgAAnwQAMMgCQADtAwAh1AIBAOwDACHaAkAA7QMAIecCIAD1AwAh6AIBAOwDACHuAkAAhQQAIf8CAQDsAwAhgAMCAI8EACELwwIAAKAEADDEAgAAmwIAEMUCAACgBAAwxgIBAOwDACHIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACHnAiAA9QMAIe4CQACFBAAh_wIBAOwDACGAAwIAjwQAIQ7DAgAAoQQAMMQCAACFAgAQxQIAAKEEADDGAgEA7AMAIcgCQADtAwAh1AIBAOwDACHaAkAA7QMAIecCIAD1AwAh6gIBAOwDACHuAkAAhQQAIYEDEACDBAAhggMQAKIEACGDAwIAjwQAIYQDAACjBAAgDQsAAPkDACAtAACmBAAgLgAApgQAIJ8BAACmBAAgoAEAAKYEACDJAhAAAAABygIQAAAABcsCEAAAAAXMAhAAAAABzQIQAAAAAc4CEAAAAAHPAhAAAAAB0AIQAKUEACEPCwAA-QMAIC0AAKQEACAuAACkBAAgyQKAAAAAAcwCgAAAAAHNAoAAAAABzgKAAAAAAc8CgAAAAAHQAoAAAAABhQMBAAAAAYYDAQAAAAGHAwEAAAABiAOAAAAAAYkDgAAAAAGKA4AAAAABDMkCgAAAAAHMAoAAAAABzQKAAAAAAc4CgAAAAAHPAoAAAAAB0AKAAAAAAYUDAQAAAAGGAwEAAAABhwMBAAAAAYgDgAAAAAGJA4AAAAABigOAAAAAAQ0LAAD5AwAgLQAApgQAIC4AAKYEACCfAQAApgQAIKABAACmBAAgyQIQAAAAAcoCEAAAAAXLAhAAAAAFzAIQAAAAAc0CEAAAAAHOAhAAAAABzwIQAAAAAdACEAClBAAhCMkCEAAAAAHKAhAAAAAFywIQAAAABcwCEAAAAAHNAhAAAAABzgIQAAAAAc8CEAAAAAHQAhAApgQAIQ7DAgAApwQAMMQCAADvAQAQxQIAAKcEADDIAkAA7QMAIdQCAQDsAwAh1QIBAOwDACHWAgEA7AMAIdcCAQD0AwAh2gJAAO0DACHlAgAAqASOAyLnAiAA9QMAIe4CQACFBAAhiwMBAOwDACGMAwEA9AMAIQcLAADvAwAgLQAAqgQAIC4AAKoEACDJAgAAAI4DAsoCAAAAjgMIywIAAACOAwjQAgAAqQSOAyIHCwAA7wMAIC0AAKoEACAuAACqBAAgyQIAAACOAwLKAgAAAI4DCMsCAAAAjgMI0AIAAKkEjgMiBMkCAAAAjgMCygIAAACOAwjLAgAAAI4DCNACAACqBI4DIgvDAgAAqwQAMMQCAADXAQAQxQIAAKsEADDIAkAA7QMAIdQCAQDsAwAh1QIBAOwDACHWAgEA7AMAIdoCQADtAwAh5wIgAPUDACHuAkAAhQQAIY4DAQD0AwAhEMMCAACsBAAwxAIAAL8BABDFAgAArAQAMMgCQADtAwAh1AIBAOwDACHaAkAA7QMAIe4CQACFBAAh8AIBAOwDACGPAwEA7AMAIZADAQDsAwAhkQMBAOwDACGSAwEA9AMAIZMDAQDsAwAhlAMBAOwDACGVAwEA7AMAIZYDAQDsAwAhEQMAAJoEACDDAgAArQQAMMQCAAALABDFAgAArQQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIe4CQACZBAAh8AIBAPwDACGPAwEA_AMAIZADAQD8AwAhkQMBAPwDACGSAwEA_QMAIZMDAQD8AwAhlAMBAPwDACGVAwEA_AMAIZYDAQD8AwAhCcMCAACuBAAwxAIAAKcBABDFAgAArgQAMMgCQADtAwAh1AIBAOwDACHaAkAA7QMAIZcDAQDsAwAhmAMBAOwDACGZA0AA7QMAIQnDAgAArwQAMMQCAACUAQAQxQIAAK8EADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACGXAwEA_AMAIZgDAQD8AwAhmQNAAP8DACEQwwIAALAEADDEAgAAjgEAEMUCAACwBAAwyAJAAO0DACHUAgEA7AMAIdoCQADtAwAh8AIBAOwDACGaAwEA7AMAIZsDAQDsAwAhnAMBAPQDACGdAwEA9AMAIZ4DAQD0AwAhnwNAAIUEACGgA0AAhQQAIaEDAQD0AwAhogMBAPQDACELwwIAALEEADDEAgAAeAAQxQIAALEEADDIAkAA7QMAIdQCAQDsAwAh2gJAAO0DACHwAgEA7AMAIZkDQADtAwAhowMBAOwDACGkAwEA9AMAIaUDAQD0AwAhD8MCAACyBAAwxAIAAGIAEMUCAACyBAAwyAJAAO0DACHUAgEA7AMAIdUCAQDsAwAh2gJAAO0DACHlAgAAtASsAyLnAiAA9QMAIe4CQACFBAAhpgMBAOwDACGnAyAA9QMAIagDAQD0AwAhqgMAALMEqgMirAMgAPUDACEHCwAA7wMAIC0AALgEACAuAAC4BAAgyQIAAACqAwLKAgAAAKoDCMsCAAAAqgMI0AIAALcEqgMiBwsAAO8DACAtAAC2BAAgLgAAtgQAIMkCAAAArAMCygIAAACsAwjLAgAAAKwDCNACAAC1BKwDIgcLAADvAwAgLQAAtgQAIC4AALYEACDJAgAAAKwDAsoCAAAArAMIywIAAACsAwjQAgAAtQSsAyIEyQIAAACsAwLKAgAAAKwDCMsCAAAArAMI0AIAALYErAMiBwsAAO8DACAtAAC4BAAgLgAAuAQAIMkCAAAAqgMCygIAAACqAwjLAgAAAKoDCNACAAC3BKoDIgTJAgAAAKoDAsoCAAAAqgMIywIAAACqAwjQAgAAuASqAyIUBAAAvAQAIAUAAL0EACAGAAC-BAAgBwAAvwQAIBoAAMAEACDDAgAAuQQAMMQCAABPABDFAgAAuQQAMMgCQAD_AwAh1AIBAPwDACHVAgEA_AMAIdoCQAD_AwAh5QIAALsErAMi5wIgAP4DACHuAkAAmQQAIaYDAQD8AwAhpwMgAP4DACGoAwEA_QMAIaoDAAC6BKoDIqwDIAD-AwAhBMkCAAAAqgMCygIAAACqAwjLAgAAAKoDCNACAAC4BKoDIgTJAgAAAKwDAsoCAAAArAMIywIAAACsAwjQAgAAtgSsAyID2wIAAAMAINwCAAADACDdAgAAAwAgA9sCAAAHACDcAgAABwAg3QIAAAcAIBMDAACaBAAgwwIAAK0EADDEAgAACwAQxQIAAK0EADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHuAkAAmQQAIfACAQD8AwAhjwMBAPwDACGQAwEA_AMAIZEDAQD8AwAhkgMBAP0DACGTAwEA_AMAIZQDAQD8AwAhlQMBAPwDACGWAwEA_AMAIa8DAAALACCwAwAACwAgDQMAAJoEACAWAACbBAAgwwIAAJgEADDEAgAADQAQxQIAAJgEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIe4CQACZBAAh8AIBAPwDACGvAwAADQAgsAMAAA0AIAPbAgAARwAg3AIAAEcAIN0CAABHACAZAwAAmgQAIBYAAMQEACAYAADFBAAgwwIAAMEEADDEAgAARwAQxQIAAMEEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHlAgAAwgTyAiLnAiAA_gMAIe4CQACZBAAh7wIBAPwDACHwAgEA_AMAIfICEADDBAAh8wIQAMMEACH0AhAAwwQAIfUCEADDBAAh9gIQAMMEACH3AgEA_AMAIfgCAQD8AwAh-QIBAPwDACH6AgEA_AMAIfsCAQD9AwAh_AIBAPwDACEEyQIAAADyAgLKAgAAAPICCMsCAAAA8gII0AIAAJUE8gIiCMkCEAAAAAHKAhAAAAAEywIQAAAABMwCEAAAAAHNAhAAAAABzgIQAAAAAc8CEAAAAAHQAhAAiwQAIQPbAgAAOAAg3AIAADgAIN0CAAA4ACAD2wIAAD0AINwCAAA9ACDdAgAAPQAgDxcAAMkEACDDAgAAxgQAMMQCAAA9ABDFAgAAxgQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAId4CAQD8AwAh4AIAAMcE4AIi4QIBAP0DACHiAgEA_QMAIeMCEADDBAAh5QIAAMgE5QIi5gJAAJkEACHnAiAA_gMAIQTJAgAAAOACAsoCAAAA4AIIywIAAADgAgjQAgAAjQTgAiIEyQIAAADlAgLKAgAAAOUCCMsCAAAA5QII0AIAAIkE5QIiGwMAAJoEACAWAADEBAAgGAAAxQQAIMMCAADBBAAwxAIAAEcAEMUCAADBBAAwyAJAAP8DACHUAgEA_AMAIdoCQAD_AwAh5QIAAMIE8gIi5wIgAP4DACHuAkAAmQQAIe8CAQD8AwAh8AIBAPwDACHyAhAAwwQAIfMCEADDBAAh9AIQAMMEACH1AhAAwwQAIfYCEADDBAAh9wIBAPwDACH4AgEA_AMAIfkCAQD8AwAh-gIBAPwDACH7AgEA_QMAIfwCAQD8AwAhrwMAAEcAILADAABHACAREwAAzAQAIBcAAMkEACDDAgAAygQAMMQCAAA4ABDFAgAAygQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAId4CAQD8AwAh5wIgAP4DACHoAgEA_AMAIekCAQD8AwAh6gIBAPwDACHrAhAAwwQAIewCAgDLBAAh7QIQAMMEACHuAkAAmQQAIQjJAgIAAAABygICAAAABMsCAgAAAATMAgIAAAABzQICAAAAAc4CAgAAAAHPAgIAAAAB0AICAO8DACEUDwAA0AQAIBQAANYEACAVAACbBAAgGQAAxAQAIMMCAADTBAAwxAIAACIAEMUCAADTBAAwxgIBAPwDACHIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIeoCAQD8AwAh7gJAAJkEACGBAxAAwwQAIYIDEADUBAAhgwMCAMsEACGEAwAA1QQAIK8DAAAiACCwAwAAIgAgDBMAAMwEACDDAgAAzQQAMMQCAAAzABDFAgAAzQQAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh6AIBAPwDACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACECxgIBAAAAAccCAQAAAAEIDwAA0AQAIBEAANEEACDDAgAAzwQAMMQCAAAqABDFAgAAzwQAMMYCAQD8AwAhxwIBAPwDACHIAkAA_wMAIRUMAADZBAAgDQAA2gQAIA4AANsEACAQAADcBAAgEgAAgAQAIMMCAADXBAAwxAIAABgAEMUCAADXBAAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHXAgEA_QMAIdoCQAD_AwAh5QIAANgEjgMi5wIgAP4DACHuAkAAmQQAIYsDAQD8AwAhjAMBAP0DACGvAwAAGAAgsAMAABgAIA4KAACABAAgwwIAAPsDADDEAgAAvwMAEMUCAAD7AwAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHXAgEA_QMAIdgCAQD9AwAh2QIgAP4DACHaAkAA_wMAIa8DAAC_AwAgsAMAAL8DACAMDwAA0AQAIMMCAADSBAAwxAIAACYAEMUCAADSBAAwxgIBAPwDACHIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIe4CQACZBAAh_wIBAPwDACGAAwIAywQAIRIPAADQBAAgFAAA1gQAIBUAAJsEACAZAADEBAAgwwIAANMEADDEAgAAIgAQxQIAANMEADDGAgEA_AMAIcgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh6gIBAPwDACHuAkAAmQQAIYEDEADDBAAhggMQANQEACGDAwIAywQAIYQDAADVBAAgCMkCEAAAAAHKAhAAAAAFywIQAAAABcwCEAAAAAHNAhAAAAABzgIQAAAAAc8CEAAAAAHQAhAApgQAIQzJAoAAAAABzAKAAAAAAc0CgAAAAAHOAoAAAAABzwKAAAAAAdACgAAAAAGFAwEAAAABhgMBAAAAAYcDAQAAAAGIA4AAAAABiQOAAAAAAYoDgAAAAAED2wIAADMAINwCAAAzACDdAgAAMwAgEwwAANkEACANAADaBAAgDgAA2wQAIBAAANwEACASAACABAAgwwIAANcEADDEAgAAGAAQxQIAANcEADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdcCAQD9AwAh2gJAAP8DACHlAgAA2ASOAyLnAiAA_gMAIe4CQACZBAAhiwMBAPwDACGMAwEA_QMAIQTJAgAAAI4DAsoCAAAAjgMIywIAAACOAwjQAgAAqgSOAyIQCAAA3gQAIAkAAN8EACAKAACeBAAgwwIAAN0EADDEAgAAEwAQxQIAAN0EADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIY4DAQD9AwAhrwMAABMAILADAAATACAPCgAAngQAIMMCAACdBAAwxAIAAB4AEMUCAACdBAAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHXAgEA_QMAIdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIf4CAQD9AwAhrwMAAB4AILADAAAeACAD2wIAACIAINwCAAAiACDdAgAAIgAgA9sCAAAmACDcAgAAJgAg3QIAACYAIA4IAADeBAAgCQAA3wQAIAoAAJ4EACDDAgAA3QQAMMQCAAATABDFAgAA3QQAMMgCQAD_AwAh1AIBAPwDACHVAgEA_AMAIdYCAQD8AwAh2gJAAP8DACHnAiAA_gMAIe4CQACZBAAhjgMBAP0DACEQCAAA3gQAIAkAAN8EACAKAACeBAAgwwIAAN0EADDEAgAAEwAQxQIAAN0EADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIY4DAQD9AwAhrwMAABMAILADAAATACAD2wIAABMAINwCAAATACDdAgAAEwAgAugCAQAAAAH9AgEAAAABDQcAAOIEACATAADMBAAgwwIAAOEEADDEAgAADwAQxQIAAOEEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIegCAQD8AwAh7AICAMsEACHuAkAAmQQAIf0CAQD8AwAhDQMAAJoEACAWAACbBAAgwwIAAJgEADDEAgAADQAQxQIAAJgEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIe4CQACZBAAh8AIBAPwDACGvAwAADQAgsAMAAA0AIBEDAACaBAAgwwIAAOMEADDEAgAABwAQxQIAAOMEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHwAgEA_AMAIZoDAQD8AwAhmwMBAPwDACGcAwEA_QMAIZ0DAQD9AwAhngMBAP0DACGfA0AAmQQAIaADQACZBAAhoQMBAP0DACGiAwEA_QMAIQwDAACaBAAgwwIAAOQEADDEAgAAAwAQxQIAAOQEADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHwAgEA_AMAIZkDQAD_AwAhowMBAPwDACGkAwEA_QMAIaUDAQD9AwAhAAAAAbQDQAAAAAEBtAMBAAAAAQUnAAC1CAAgKAAAuwgAILEDAAC2CAAgsgMAALoIACC3AwAAGgAgBScAALMIACAoAAC4CAAgsQMAALQIACCyAwAAtwgAILcDAAC8AwAgAycAALUIACCxAwAAtggAILcDAAAaACADJwAAswgAILEDAAC0CAAgtwMAALwDACAAAAAAAbQDAQAAAAEBtAMgAAAAAQsnAAD1BAAwKAAA-gQAMLEDAAD2BAAwsgMAAPcEADCzAwAA-AQAILQDAAD5BAAwtQMAAPkEADC2AwAA-QQAMLcDAAD5BAAwuAMAAPsEADC5AwAA_AQAMAMPAADsBAAgxgIBAAAAAcgCQAAAAAECAAAALAAgJwAAgAUAIAMAAAAsACAnAACABQAgKAAA_wQAIAEgAACyCAAwCQ8AANAEACARAADRBAAgwwIAAM8EADDEAgAAKgAQxQIAAM8EADDGAgEA_AMAIccCAQD8AwAhyAJAAP8DACGtAwAAzgQAIAIAAAAsACAgAAD_BAAgAgAAAP0EACAgAAD-BAAgBsMCAAD8BAAwxAIAAP0EABDFAgAA_AQAMMYCAQD8AwAhxwIBAPwDACHIAkAA_wMAIQbDAgAA_AQAMMQCAAD9BAAQxQIAAPwEADDGAgEA_AMAIccCAQD8AwAhyAJAAP8DACECxgIBAOkEACHIAkAA6AQAIQMPAADqBAAgxgIBAOkEACHIAkAA6AQAIQMPAADsBAAgxgIBAAAAAcgCQAAAAAEEJwAA9QQAMLEDAAD2BAAwswMAAPgEACC3AwAA-QQAMAAAAAAAAAG0AwAAAOACAgW0AxAAAAABugMQAAAAAbsDEAAAAAG8AxAAAAABvQMQAAAAAQG0AwAAAOUCAgG0A0AAAAABBScAAK0IACAoAACwCAAgsQMAAK4IACCyAwAArwgAILcDAABJACADJwAArQgAILEDAACuCAAgtwMAAEkAIAAAAAAABbQDAgAAAAG6AwIAAAABuwMCAAAAAbwDAgAAAAG9AwIAAAABBScAAKUIACAoAACrCAAgsQMAAKYIACCyAwAAqggAILcDAABJACAFJwAAowgAICgAAKgIACCxAwAApAgAILIDAACnCAAgtwMAACQAIAMnAAClCAAgsQMAAKYIACC3AwAASQAgAycAAKMIACCxAwAApAgAILcDAAAkACAAAAAAAAG0AwAAAPICAgUnAACcCAAgKAAAoQgAILEDAACdCAAgsgMAAKAIACC3AwAAAQAgCycAAK0FADAoAACyBQAwsQMAAK4FADCyAwAArwUAMLMDAACwBQAgtAMAALEFADC1AwAAsQUAMLYDAACxBQAwtwMAALEFADC4AwAAswUAMLkDAAC0BQAwCycAAKEFADAoAACmBQAwsQMAAKIFADCyAwAAowUAMLMDAACkBQAgtAMAAKUFADC1AwAApQUAMLYDAAClBQAwtwMAAKUFADC4AwAApwUAMLkDAACoBQAwCsgCQAAAAAHUAgEAAAAB2gJAAAAAAeACAAAA4AIC4QIBAAAAAeICAQAAAAHjAhAAAAAB5QIAAADlAgLmAkAAAAAB5wIgAAAAAQIAAAA_ACAnAACsBQAgAwAAAD8AICcAAKwFACAoAACrBQAgASAAAJ8IADAPFwAAyQQAIMMCAADGBAAwxAIAAD0AEMUCAADGBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHeAgEA_AMAIeACAADHBOACIuECAQD9AwAh4gIBAAAAAeMCEADDBAAh5QIAAMgE5QIi5gJAAJkEACHnAiAA_gMAIQIAAAA_ACAgAACrBQAgAgAAAKkFACAgAACqBQAgDsMCAACoBQAwxAIAAKkFABDFAgAAqAUAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAId4CAQD8AwAh4AIAAMcE4AIi4QIBAP0DACHiAgEA_QMAIeMCEADDBAAh5QIAAMgE5QIi5gJAAJkEACHnAiAA_gMAIQ7DAgAAqAUAMMQCAACpBQAQxQIAAKgFADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHeAgEA_AMAIeACAADHBOACIuECAQD9AwAh4gIBAP0DACHjAhAAwwQAIeUCAADIBOUCIuYCQACZBAAh5wIgAP4DACEKyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh4AIAAIgF4AIi4QIBAPIEACHiAgEA8gQAIeMCEACJBQAh5QIAAIoF5QIi5gJAAIsFACHnAiAA8wQAIQrIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHgAgAAiAXgAiLhAgEA8gQAIeICAQDyBAAh4wIQAIkFACHlAgAAigXlAiLmAkAAiwUAIecCIADzBAAhCsgCQAAAAAHUAgEAAAAB2gJAAAAAAeACAAAA4AIC4QIBAAAAAeICAQAAAAHjAhAAAAAB5QIAAADlAgLmAkAAAAAB5wIgAAAAAQwTAACXBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAegCAQAAAAHpAgEAAAAB6gIBAAAAAesCEAAAAAHsAgIAAAAB7QIQAAAAAe4CQAAAAAECAAAAOgAgJwAAuAUAIAMAAAA6ACAnAAC4BQAgKAAAtwUAIAEgAACeCAAwERMAAMwEACAXAADJBAAgwwIAAMoEADDEAgAAOAAQxQIAAMoEADDIAkAA_wMAIdQCAQAAAAHaAkAA_wMAId4CAQD8AwAh5wIgAP4DACHoAgEA_AMAIekCAQD8AwAh6gIBAPwDACHrAhAAwwQAIewCAgDLBAAh7QIQAMMEACHuAkAAmQQAIQIAAAA6ACAgAAC3BQAgAgAAALUFACAgAAC2BQAgD8MCAAC0BQAwxAIAALUFABDFAgAAtAUAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAId4CAQD8AwAh5wIgAP4DACHoAgEA_AMAIekCAQD8AwAh6gIBAPwDACHrAhAAwwQAIewCAgDLBAAh7QIQAMMEACHuAkAAmQQAIQ_DAgAAtAUAMMQCAAC1BQAQxQIAALQFADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHeAgEA_AMAIecCIAD-AwAh6AIBAPwDACHpAgEA_AMAIeoCAQD8AwAh6wIQAMMEACHsAgIAywQAIe0CEADDBAAh7gJAAJkEACELyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHoAgEA6QQAIekCAQDpBAAh6gIBAOkEACHrAhAAiQUAIewCAgCTBQAh7QIQAIkFACHuAkAAiwUAIQwTAACVBQAgyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHoAgEA6QQAIekCAQDpBAAh6gIBAOkEACHrAhAAiQUAIewCAgCTBQAh7QIQAIkFACHuAkAAiwUAIQwTAACXBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAegCAQAAAAHpAgEAAAAB6gIBAAAAAesCEAAAAAHsAgIAAAAB7QIQAAAAAe4CQAAAAAEDJwAAnAgAILEDAACdCAAgtwMAAAEAIAQnAACtBQAwsQMAAK4FADCzAwAAsAUAILcDAACxBQAwBCcAAKEFADCxAwAAogUAMLMDAACkBQAgtwMAAKUFADAAAAAAAAUnAACUCAAgKAAAmggAILEDAACVCAAgsgMAAJkIACC3AwAAzAIAIAUnAACSCAAgKAAAlwgAILEDAACTCAAgsgMAAJYIACC3AwAAJAAgAycAAJQIACCxAwAAlQgAILcDAADMAgAgAycAAJIIACCxAwAAkwgAILcDAAAkACAAAAAFJwAAjAgAICgAAJAIACCxAwAAjQgAILIDAACPCAAgtwMAAAEAIAsnAADKBQAwKAAAzwUAMLEDAADLBQAwsgMAAMwFADCzAwAAzQUAILQDAADOBQAwtQMAAM4FADC2AwAAzgUAMLcDAADOBQAwuAMAANAFADC5AwAA0QUAMAgTAADEBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAegCAQAAAAHsAgIAAAAB7gJAAAAAAQIAAAARACAnAADVBQAgAwAAABEAICcAANUFACAoAADUBQAgASAAAI4IADAOBwAA4gQAIBMAAMwEACDDAgAA4QQAMMQCAAAPABDFAgAA4QQAMMgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh5wIgAP4DACHoAgEA_AMAIewCAgDLBAAh7gJAAJkEACH9AgEA_AMAIa4DAADgBAAgAgAAABEAICAAANQFACACAAAA0gUAICAAANMFACALwwIAANEFADDEAgAA0gUAEMUCAADRBQAwyAJAAP8DACHUAgEA_AMAIdoCQAD_AwAh5wIgAP4DACHoAgEA_AMAIewCAgDLBAAh7gJAAJkEACH9AgEA_AMAIQvDAgAA0QUAMMQCAADSBQAQxQIAANEFADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIegCAQD8AwAh7AICAMsEACHuAkAAmQQAIf0CAQD8AwAhB8gCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh6AIBAOkEACHsAgIAkwUAIe4CQACLBQAhCBMAAMIFACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIegCAQDpBAAh7AICAJMFACHuAkAAiwUAIQgTAADEBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAegCAQAAAAHsAgIAAAAB7gJAAAAAAQMnAACMCAAgsQMAAI0IACC3AwAAAQAgBCcAAMoFADCxAwAAywUAMLMDAADNBQAgtwMAAM4FADAHBAAAwgcAIAUAAMMHACAGAADEBwAgBwAAxQcAIBoAAMYHACDuAgAA7gQAIKgDAADuBAAgAAAAAAsnAADeBQAwKAAA4wUAMLEDAADfBQAwsgMAAOAFADCzAwAA4QUAILQDAADiBQAwtQMAAOIFADC2AwAA4gUAMLcDAADiBQAwuAMAAOQFADC5AwAA5QUAMA4MAAC1BgAgDgAAtgYAIBAAALcGACASAAC4BgAgyAJAAAAAAdQCAQAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHaAkAAAAAB5QIAAACOAwLnAiAAAAAB7gJAAAAAAYsDAQAAAAECAAAAGgAgJwAAtAYAIAMAAAAaACAnAAC0BgAgKAAA6QUAIAEgAACLCAAwEwwAANkEACANAADaBAAgDgAA2wQAIBAAANwEACASAACABAAgwwIAANcEADDEAgAAGAAQxQIAANcEADDIAkAA_wMAIdQCAQAAAAHVAgEA_AMAIdYCAQAAAAHXAgEA_QMAIdoCQAD_AwAh5QIAANgEjgMi5wIgAP4DACHuAkAAmQQAIYsDAQD8AwAhjAMBAP0DACECAAAAGgAgIAAA6QUAIAIAAADmBQAgIAAA5wUAIA7DAgAA5QUAMMQCAADmBQAQxQIAAOUFADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdcCAQD9AwAh2gJAAP8DACHlAgAA2ASOAyLnAiAA_gMAIe4CQACZBAAhiwMBAPwDACGMAwEA_QMAIQ7DAgAA5QUAMMQCAADmBQAQxQIAAOUFADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdcCAQD9AwAh2gJAAP8DACHlAgAA2ASOAyLnAiAA_gMAIe4CQACZBAAhiwMBAPwDACGMAwEA_QMAIQrIAkAA6AQAIdQCAQDpBAAh1QIBAOkEACHWAgEA6QQAIdcCAQDyBAAh2gJAAOgEACHlAgAA6AWOAyLnAiAA8wQAIe4CQACLBQAhiwMBAOkEACEBtAMAAACOAwIODAAA6gUAIA4AAOsFACAQAADsBQAgEgAA7QUAIMgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdYCAQDpBAAh1wIBAPIEACHaAkAA6AQAIeUCAADoBY4DIucCIADzBAAh7gJAAIsFACGLAwEA6QQAIQUnAACACAAgKAAAiQgAILEDAACBCAAgsgMAAIgIACC3AwAAFgAgCycAAIMGADAoAACIBgAwsQMAAIQGADCyAwAAhQYAMLMDAACGBgAgtAMAAIcGADC1AwAAhwYAMLYDAACHBgAwtwMAAIcGADC4AwAAiQYAMLkDAACKBgAwCycAAPcFADAoAAD8BQAwsQMAAPgFADCyAwAA-QUAMLMDAAD6BQAgtAMAAPsFADC1AwAA-wUAMLYDAAD7BQAwtwMAAPsFADC4AwAA_QUAMLkDAAD-BQAwCycAAO4FADAoAADyBQAwsQMAAO8FADCyAwAA8AUAMLMDAADxBQAgtAMAAPkEADC1AwAA-QQAMLYDAAD5BAAwtwMAAPkEADC4AwAA8wUAMLkDAAD8BAAwAxEAAO0EACDHAgEAAAAByAJAAAAAAQIAAAAsACAnAAD2BQAgAwAAACwAICcAAPYFACAoAAD1BQAgASAAAIcIADACAAAALAAgIAAA9QUAIAIAAAD9BAAgIAAA9AUAIALHAgEA6QQAIcgCQADoBAAhAxEAAOsEACDHAgEA6QQAIcgCQADoBAAhAxEAAO0EACDHAgEAAAAByAJAAAAAAQfIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7gJAAAAAAf8CAQAAAAGAAwIAAAABAgAAACgAICcAAIIGACADAAAAKAAgJwAAggYAICgAAIEGACABIAAAhggAMAwPAADQBAAgwwIAANIEADDEAgAAJgAQxQIAANIEADDGAgEA_AMAIcgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACECAAAAKAAgIAAAgQYAIAIAAAD_BQAgIAAAgAYAIAvDAgAA_gUAMMQCAAD_BQAQxQIAAP4FADDGAgEA_AMAIcgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACH_AgEA_AMAIYADAgDLBAAhC8MCAAD-BQAwxAIAAP8FABDFAgAA_gUAMMYCAQD8AwAhyAJAAP8DACHUAgEA_AMAIdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACEHyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf8CAQDpBAAhgAMCAJMFACEHyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf8CAQDpBAAhgAMCAJMFACEHyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH_AgEAAAABgAMCAAAAAQ0UAACxBgAgFQAAsgYAIBkAALMGACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB6gIBAAAAAe4CQAAAAAGBAxAAAAABggMQAAAAAYMDAgAAAAGEA4AAAAABAgAAACQAICcAALAGACADAAAAJAAgJwAAsAYAICgAAI4GACABIAAAhQgAMBIPAADQBAAgFAAA1gQAIBUAAJsEACAZAADEBAAgwwIAANMEADDEAgAAIgAQxQIAANMEADDGAgEA_AMAIcgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh5wIgAP4DACHqAgEAAAAB7gJAAJkEACGBAxAAwwQAIYIDEADUBAAhgwMCAMsEACGEAwAA1QQAIAIAAAAkACAgAACOBgAgAgAAAIsGACAgAACMBgAgDsMCAACKBgAwxAIAAIsGABDFAgAAigYAMMYCAQD8AwAhyAJAAP8DACHUAgEA_AMAIdoCQAD_AwAh5wIgAP4DACHqAgEA_AMAIe4CQACZBAAhgQMQAMMEACGCAxAA1AQAIYMDAgDLBAAhhAMAANUEACAOwwIAAIoGADDEAgAAiwYAEMUCAACKBgAwxgIBAPwDACHIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIeoCAQD8AwAh7gJAAJkEACGBAxAAwwQAIYIDEADUBAAhgwMCAMsEACGEAwAA1QQAIArIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIeoCAQDpBAAh7gJAAIsFACGBAxAAiQUAIYIDEACNBgAhgwMCAJMFACGEA4AAAAABBbQDEAAAAAG6AxAAAAABuwMQAAAAAbwDEAAAAAG9AxAAAAABDRQAAI8GACAVAACQBgAgGQAAkQYAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh6gIBAOkEACHuAkAAiwUAIYEDEACJBQAhggMQAI0GACGDAwIAkwUAIYQDgAAAAAELJwAApAYAMCgAAKkGADCxAwAApQYAMLIDAACmBgAwswMAAKcGACC0AwAAqAYAMLUDAACoBgAwtgMAAKgGADC3AwAAqAYAMLgDAACqBgAwuQMAAKsGADALJwAAmwYAMCgAAJ8GADCxAwAAnAYAMLIDAACdBgAwswMAAJ4GACC0AwAAzgUAMLUDAADOBQAwtgMAAM4FADC3AwAAzgUAMLgDAACgBgAwuQMAANEFADALJwAAkgYAMCgAAJYGADCxAwAAkwYAMLIDAACUBgAwswMAAJUGACC0AwAAsQUAMLUDAACxBQAwtgMAALEFADC3AwAAsQUAMLgDAACXBgAwuQMAALQFADAMFwAAlgUAIMgCQAAAAAHUAgEAAAAB2gJAAAAAAd4CAQAAAAHnAiAAAAAB6QIBAAAAAeoCAQAAAAHrAhAAAAAB7AICAAAAAe0CEAAAAAHuAkAAAAABAgAAADoAICcAAJoGACADAAAAOgAgJwAAmgYAICgAAJkGACABIAAAhAgAMAIAAAA6ACAgAACZBgAgAgAAALUFACAgAACYBgAgC8gCQADoBAAh1AIBAOkEACHaAkAA6AQAId4CAQDpBAAh5wIgAPMEACHpAgEA6QQAIeoCAQDpBAAh6wIQAIkFACHsAgIAkwUAIe0CEACJBQAh7gJAAIsFACEMFwAAlAUAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAId4CAQDpBAAh5wIgAPMEACHpAgEA6QQAIeoCAQDpBAAh6wIQAIkFACHsAgIAkwUAIe0CEACJBQAh7gJAAIsFACEMFwAAlgUAIMgCQAAAAAHUAgEAAAAB2gJAAAAAAd4CAQAAAAHnAiAAAAAB6QIBAAAAAeoCAQAAAAHrAhAAAAAB7AICAAAAAe0CEAAAAAHuAkAAAAABCAcAAMMFACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7AICAAAAAe4CQAAAAAH9AgEAAAABAgAAABEAICcAAKMGACADAAAAEQAgJwAAowYAICgAAKIGACABIAAAgwgAMAIAAAARACAgAACiBgAgAgAAANIFACAgAAChBgAgB8gCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh7AICAJMFACHuAkAAiwUAIf0CAQDpBAAhCAcAAMEFACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIewCAgCTBQAh7gJAAIsFACH9AgEA6QQAIQgHAADDBQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAewCAgAAAAHuAkAAAAAB_QIBAAAAAQfIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7gJAAAAAAf8CAQAAAAGAAwIAAAABAgAAADUAICcAAK8GACADAAAANQAgJwAArwYAICgAAK4GACABIAAAgggAMAwTAADMBAAgwwIAAM0EADDEAgAAMwAQxQIAAM0EADDIAkAA_wMAIdQCAQAAAAHaAkAA_wMAIecCIAD-AwAh6AIBAPwDACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACECAAAANQAgIAAArgYAIAIAAACsBgAgIAAArQYAIAvDAgAAqwYAMMQCAACsBgAQxQIAAKsGADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHnAiAA_gMAIegCAQD8AwAh7gJAAJkEACH_AgEA_AMAIYADAgDLBAAhC8MCAACrBgAwxAIAAKwGABDFAgAAqwYAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIecCIAD-AwAh6AIBAPwDACHuAkAAmQQAIf8CAQD8AwAhgAMCAMsEACEHyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf8CAQDpBAAhgAMCAJMFACEHyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf8CAQDpBAAhgAMCAJMFACEHyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH_AgEAAAABgAMCAAAAAQ0UAACxBgAgFQAAsgYAIBkAALMGACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB6gIBAAAAAe4CQAAAAAGBAxAAAAABggMQAAAAAYMDAgAAAAGEA4AAAAABBCcAAKQGADCxAwAApQYAMLMDAACnBgAgtwMAAKgGADAEJwAAmwYAMLEDAACcBgAwswMAAJ4GACC3AwAAzgUAMAQnAACSBgAwsQMAAJMGADCzAwAAlQYAILcDAACxBQAwDgwAALUGACAOAAC2BgAgEAAAtwYAIBIAALgGACDIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB1wIBAAAAAdoCQAAAAAHlAgAAAI4DAucCIAAAAAHuAkAAAAABiwMBAAAAAQMnAACACAAgsQMAAIEIACC3AwAAFgAgBCcAAIMGADCxAwAAhAYAMLMDAACGBgAgtwMAAIcGADAEJwAA9wUAMLEDAAD4BQAwswMAAPoFACC3AwAA-wUAMAQnAADuBQAwsQMAAO8FADCzAwAA8QUAILcDAAD5BAAwBCcAAN4FADCxAwAA3wUAMLMDAADhBQAgtwMAAOIFADAAAAAAAAAFJwAA-wcAICgAAP4HACCxAwAA_AcAILIDAAD9BwAgtwMAACQAIAMnAAD7BwAgsQMAAPwHACC3AwAAJAAgAAAAAAAFJwAA9gcAICgAAPkHACCxAwAA9wcAILIDAAD4BwAgtwMAABoAIAMnAAD2BwAgsQMAAPcHACC3AwAAGgAgAAAAAAAFJwAA8QcAICgAAPQHACCxAwAA8gcAILIDAADzBwAgtwMAABoAIAMnAADxBwAgsQMAAPIHACC3AwAAGgAgAAAABycAAOwHACAoAADvBwAgsQMAAO0HACCyAwAA7gcAILUDAAAeACC2AwAAHgAgtwMAALQCACADJwAA7AcAILEDAADtBwAgtwMAALQCACAAAAAHJwAA5QcAICgAAOoHACCxAwAA5gcAILIDAADpBwAgtQMAABMAILYDAAATACC3AwAAFgAgCycAAOQGADAoAADpBgAwsQMAAOUGADCyAwAA5gYAMLMDAADnBgAgtAMAAOgGADC1AwAA6AYAMLYDAADoBgAwtwMAAOgGADC4AwAA6gYAMLkDAADrBgAwCycAANsGADAoAADfBgAwsQMAANwGADCyAwAA3QYAMLMDAADeBgAgtAMAAOIFADC1AwAA4gUAMLYDAADiBQAwtwMAAOIFADC4AwAA4AYAMLkDAADlBQAwDg0AANQGACAOAAC2BgAgEAAAtwYAIBIAALgGACDIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB1wIBAAAAAdoCQAAAAAHlAgAAAI4DAucCIAAAAAHuAkAAAAABjAMBAAAAAQIAAAAaACAnAADjBgAgAwAAABoAICcAAOMGACAoAADiBgAgASAAAOgHADACAAAAGgAgIAAA4gYAIAIAAADmBQAgIAAA4QYAIArIAkAA6AQAIdQCAQDpBAAh1QIBAOkEACHWAgEA6QQAIdcCAQDyBAAh2gJAAOgEACHlAgAA6AWOAyLnAiAA8wQAIe4CQACLBQAhjAMBAPIEACEODQAA0wYAIA4AAOsFACAQAADsBQAgEgAA7QUAIMgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdYCAQDpBAAh1wIBAPIEACHaAkAA6AQAIeUCAADoBY4DIucCIADzBAAh7gJAAIsFACGMAwEA8gQAIQ4NAADUBgAgDgAAtgYAIBAAALcGACASAAC4BgAgyAJAAAAAAdQCAQAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHaAkAAAAAB5QIAAACOAwLnAiAAAAAB7gJAAAAAAYwDAQAAAAEJCQAA8AYAIAoAAPEGACDIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB2gJAAAAAAecCIAAAAAHuAkAAAAABAgAAABYAICcAAO8GACADAAAAFgAgJwAA7wYAICgAAO4GACABIAAA5wcAMA4IAADeBAAgCQAA3wQAIAoAAJ4EACDDAgAA3QQAMMQCAAATABDFAgAA3QQAMMgCQAD_AwAh1AIBAAAAAdUCAQD8AwAh1gIBAAAAAdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIY4DAQD9AwAhAgAAABYAICAAAO4GACACAAAA7AYAICAAAO0GACALwwIAAOsGADDEAgAA7AYAEMUCAADrBgAwyAJAAP8DACHUAgEA_AMAIdUCAQD8AwAh1gIBAPwDACHaAkAA_wMAIecCIAD-AwAh7gJAAJkEACGOAwEA_QMAIQvDAgAA6wYAMMQCAADsBgAQxQIAAOsGADDIAkAA_wMAIdQCAQD8AwAh1QIBAPwDACHWAgEA_AMAIdoCQAD_AwAh5wIgAP4DACHuAkAAmQQAIY4DAQD9AwAhB8gCQADoBAAh1AIBAOkEACHVAgEA6QQAIdYCAQDpBAAh2gJAAOgEACHnAiAA8wQAIe4CQACLBQAhCQkAANkGACAKAADaBgAgyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh1gIBAOkEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACEJCQAA8AYAIAoAAPEGACDIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB2gJAAAAAAecCIAAAAAHuAkAAAAABBCcAAOQGADCxAwAA5QYAMLMDAADnBgAgtwMAAOgGADAEJwAA2wYAMLEDAADcBgAwswMAAN4GACC3AwAA4gUAMAMnAADlBwAgsQMAAOYHACC3AwAAFgAgAAAABScAAOAHACAoAADjBwAgsQMAAOEHACCyAwAA4gcAILcDAAABACADJwAA4AcAILEDAADhBwAgtwMAAAEAIAAAAAAAAAUnAADbBwAgKAAA3gcAILEDAADcBwAgsgMAAN0HACC3AwAAAQAgAycAANsHACCxAwAA3AcAILcDAAABACAAAAAFJwAA1gcAICgAANkHACCxAwAA1wcAILIDAADYBwAgtwMAAAEAIAMnAADWBwAgsQMAANcHACC3AwAAAQAgAAAAAbQDAAAAqgMCAbQDAAAArAMCCycAALEHADAoAAC2BwAwsQMAALIHADCyAwAAswcAMLMDAAC0BwAgtAMAALUHADC1AwAAtQcAMLYDAAC1BwAwtwMAALUHADC4AwAAtwcAMLkDAAC4BwAwCycAAKUHADAoAACqBwAwsQMAAKYHADCyAwAApwcAMLMDAACoBwAgtAMAAKkHADC1AwAAqQcAMLYDAACpBwAwtwMAAKkHADC4AwAAqwcAMLkDAACsBwAwBycAAKAHACAoAACjBwAgsQMAAKEHACCyAwAAogcAILUDAAALACC2AwAACwAgtwMAAKoBACAHJwAAmwcAICgAAJ4HACCxAwAAnAcAILIDAACdBwAgtQMAAA0AILYDAAANACC3AwAAzAIAIAsnAACPBwAwKAAAlAcAMLEDAACQBwAwsgMAAJEHADCzAwAAkgcAILQDAACTBwAwtQMAAJMHADC2AwAAkwcAMLcDAACTBwAwuAMAAJUHADC5AwAAlgcAMBQWAAC6BQAgGAAAuwUAIMgCQAAAAAHUAgEAAAAB2gJAAAAAAeUCAAAA8gIC5wIgAAAAAe4CQAAAAAHvAgEAAAAB8gIQAAAAAfMCEAAAAAH0AhAAAAAB9QIQAAAAAfYCEAAAAAH3AgEAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAfwCAQAAAAECAAAASQAgJwAAmgcAIAMAAABJACAnAACaBwAgKAAAmQcAIAEgAADVBwAwGQMAAJoEACAWAADEBAAgGAAAxQQAIMMCAADBBAAwxAIAAEcAEMUCAADBBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHlAgAAwgTyAiLnAiAA_gMAIe4CQACZBAAh7wIBAAAAAfACAQD8AwAh8gIQAMMEACHzAhAAwwQAIfQCEADDBAAh9QIQAMMEACH2AhAAwwQAIfcCAQD8AwAh-AIBAPwDACH5AgEA_AMAIfoCAQD8AwAh-wIBAP0DACH8AgEA_AMAIQIAAABJACAgAACZBwAgAgAAAJcHACAgAACYBwAgFsMCAACWBwAwxAIAAJcHABDFAgAAlgcAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIeUCAADCBPICIucCIAD-AwAh7gJAAJkEACHvAgEA_AMAIfACAQD8AwAh8gIQAMMEACHzAhAAwwQAIfQCEADDBAAh9QIQAMMEACH2AhAAwwQAIfcCAQD8AwAh-AIBAPwDACH5AgEA_AMAIfoCAQD8AwAh-wIBAP0DACH8AgEA_AMAIRbDAgAAlgcAMMQCAACXBwAQxQIAAJYHADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHlAgAAwgTyAiLnAiAA_gMAIe4CQACZBAAh7wIBAPwDACHwAgEA_AMAIfICEADDBAAh8wIQAMMEACH0AhAAwwQAIfUCEADDBAAh9gIQAMMEACH3AgEA_AMAIfgCAQD8AwAh-QIBAPwDACH6AgEA_AMAIfsCAQD9AwAh_AIBAPwDACESyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5QIAAJ0F8gIi5wIgAPMEACHuAkAAiwUAIe8CAQDpBAAh8gIQAIkFACHzAhAAiQUAIfQCEACJBQAh9QIQAIkFACH2AhAAiQUAIfcCAQDpBAAh-AIBAOkEACH5AgEA6QQAIfoCAQDpBAAh-wIBAPIEACH8AgEA6QQAIRQWAACfBQAgGAAAoAUAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIeUCAACdBfICIucCIADzBAAh7gJAAIsFACHvAgEA6QQAIfICEACJBQAh8wIQAIkFACH0AhAAiQUAIfUCEACJBQAh9gIQAIkFACH3AgEA6QQAIfgCAQDpBAAh-QIBAOkEACH6AgEA6QQAIfsCAQDyBAAh_AIBAOkEACEUFgAAugUAIBgAALsFACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHlAgAAAPICAucCIAAAAAHuAkAAAAAB7wIBAAAAAfICEAAAAAHzAhAAAAAB9AIQAAAAAfUCEAAAAAH2AhAAAAAB9wIBAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAABBhYAANcFACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7gJAAAAAAQIAAADMAgAgJwAAmwcAIAMAAAANACAnAACbBwAgKAAAnwcAIAgAAAANACAWAADJBQAgIAAAnwcAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACEGFgAAyQUAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACEMyAJAAAAAAdQCAQAAAAHaAkAAAAAB7gJAAAAAAY8DAQAAAAGQAwEAAAABkQMBAAAAAZIDAQAAAAGTAwEAAAABlAMBAAAAAZUDAQAAAAGWAwEAAAABAgAAAKoBACAnAACgBwAgAwAAAAsAICcAAKAHACAoAACkBwAgDgAAAAsAICAAAKQHACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHuAkAAiwUAIY8DAQDpBAAhkAMBAOkEACGRAwEA6QQAIZIDAQDyBAAhkwMBAOkEACGUAwEA6QQAIZUDAQDpBAAhlgMBAOkEACEMyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh7gJAAIsFACGPAwEA6QQAIZADAQDpBAAhkQMBAOkEACGSAwEA8gQAIZMDAQDpBAAhlAMBAOkEACGVAwEA6QQAIZYDAQDpBAAhDMgCQAAAAAHUAgEAAAAB2gJAAAAAAZoDAQAAAAGbAwEAAAABnAMBAAAAAZ0DAQAAAAGeAwEAAAABnwNAAAAAAaADQAAAAAGhAwEAAAABogMBAAAAAQIAAAAJACAnAACwBwAgAwAAAAkAICcAALAHACAoAACvBwAgASAAANQHADARAwAAmgQAIMMCAADjBAAwxAIAAAcAEMUCAADjBAAwyAJAAP8DACHUAgEAAAAB2gJAAP8DACHwAgEA_AMAIZoDAQD8AwAhmwMBAPwDACGcAwEA_QMAIZ0DAQD9AwAhngMBAP0DACGfA0AAmQQAIaADQACZBAAhoQMBAP0DACGiAwEA_QMAIQIAAAAJACAgAACvBwAgAgAAAK0HACAgAACuBwAgEMMCAACsBwAwxAIAAK0HABDFAgAArAcAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIfACAQD8AwAhmgMBAPwDACGbAwEA_AMAIZwDAQD9AwAhnQMBAP0DACGeAwEA_QMAIZ8DQACZBAAhoANAAJkEACGhAwEA_QMAIaIDAQD9AwAhEMMCAACsBwAwxAIAAK0HABDFAgAArAcAMMgCQAD_AwAh1AIBAPwDACHaAkAA_wMAIfACAQD8AwAhmgMBAPwDACGbAwEA_AMAIZwDAQD9AwAhnQMBAP0DACGeAwEA_QMAIZ8DQACZBAAhoANAAJkEACGhAwEA_QMAIaIDAQD9AwAhDMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIZoDAQDpBAAhmwMBAOkEACGcAwEA8gQAIZ0DAQDyBAAhngMBAPIEACGfA0AAiwUAIaADQACLBQAhoQMBAPIEACGiAwEA8gQAIQzIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACGaAwEA6QQAIZsDAQDpBAAhnAMBAPIEACGdAwEA8gQAIZ4DAQDyBAAhnwNAAIsFACGgA0AAiwUAIaEDAQDyBAAhogMBAPIEACEMyAJAAAAAAdQCAQAAAAHaAkAAAAABmgMBAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfA0AAAAABoANAAAAAAaEDAQAAAAGiAwEAAAABB8gCQAAAAAHUAgEAAAAB2gJAAAAAAZkDQAAAAAGjAwEAAAABpAMBAAAAAaUDAQAAAAECAAAABQAgJwAAvAcAIAMAAAAFACAnAAC8BwAgKAAAuwcAIAEgAADTBwAwDAMAAJoEACDDAgAA5AQAMMQCAAADABDFAgAA5AQAMMgCQAD_AwAh1AIBAAAAAdoCQAD_AwAh8AIBAPwDACGZA0AA_wMAIaMDAQAAAAGkAwEA_QMAIaUDAQD9AwAhAgAAAAUAICAAALsHACACAAAAuQcAICAAALoHACALwwIAALgHADDEAgAAuQcAEMUCAAC4BwAwyAJAAP8DACHUAgEA_AMAIdoCQAD_AwAh8AIBAPwDACGZA0AA_wMAIaMDAQD8AwAhpAMBAP0DACGlAwEA_QMAIQvDAgAAuAcAMMQCAAC5BwAQxQIAALgHADDIAkAA_wMAIdQCAQD8AwAh2gJAAP8DACHwAgEA_AMAIZkDQAD_AwAhowMBAPwDACGkAwEA_QMAIaUDAQD9AwAhB8gCQADoBAAh1AIBAOkEACHaAkAA6AQAIZkDQADoBAAhowMBAOkEACGkAwEA8gQAIaUDAQDyBAAhB8gCQADoBAAh1AIBAOkEACHaAkAA6AQAIZkDQADoBAAhowMBAOkEACGkAwEA8gQAIaUDAQDyBAAhB8gCQAAAAAHUAgEAAAAB2gJAAAAAAZkDQAAAAAGjAwEAAAABpAMBAAAAAaUDAQAAAAEEJwAAsQcAMLEDAACyBwAwswMAALQHACC3AwAAtQcAMAQnAAClBwAwsQMAAKYHADCzAwAAqAcAILcDAACpBwAwAycAAKAHACCxAwAAoQcAILcDAACqAQAgAycAAJsHACCxAwAAnAcAILcDAADMAgAgBCcAAI8HADCxAwAAkAcAMLMDAACSBwAgtwMAAJMHADAAAAMDAADYBQAg7gIAAO4EACCSAwAA7gQAIAMDAADYBQAgFgAA2QUAIO4CAADuBAAgAAAABQMAANgFACAWAADHBwAgGAAAyAcAIO4CAADuBAAg-wIAAO4EACAHDwAAywcAIBQAAM0HACAVAADZBQAgGQAAxwcAIO4CAADuBAAgggMAAO4EACCEAwAA7gQAIAgMAADOBwAgDQAAzwcAIA4AANAHACAQAADRBwAgEgAAggUAINcCAADuBAAg7gIAAO4EACCMAwAA7gQAIAMKAACCBQAg1wIAAO4EACDYAgAA7gQAIAAFCAAAzgcAIAkAANIHACAKAAC6BgAg7gIAAO4EACCOAwAA7gQAIAQKAAC6BgAg1wIAAO4EACDuAgAA7gQAIP4CAADuBAAgAAAAB8gCQAAAAAHUAgEAAAAB2gJAAAAAAZkDQAAAAAGjAwEAAAABpAMBAAAAAaUDAQAAAAEMyAJAAAAAAdQCAQAAAAHaAkAAAAABmgMBAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfA0AAAAABoANAAAAAAaEDAQAAAAGiAwEAAAABEsgCQAAAAAHUAgEAAAAB2gJAAAAAAeUCAAAA8gIC5wIgAAAAAe4CQAAAAAHvAgEAAAAB8gIQAAAAAfMCEAAAAAH0AhAAAAAB9QIQAAAAAfYCEAAAAAH3AgEAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-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_gIBAPIEACEJyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh1gIBAOkEACHXAgEA8gQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIf4CAQDyBAAhDwwAALUGACANAADUBgAgEAAAtwYAIBIAALgGACDIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB1wIBAAAAAdoCQAAAAAHlAgAAAI4DAucCIAAAAAHuAkAAAAABiwMBAAAAAYwDAQAAAAECAAAAGgAgJwAA8QcAIAMAAAAYACAnAADxBwAgKAAA9QcAIBEAAAAYACAMAADqBQAgDQAA0wYAIBAAAOwFACASAADtBQAgIAAA9QcAIMgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdYCAQDpBAAh1wIBAPIEACHaAkAA6AQAIeUCAADoBY4DIucCIADzBAAh7gJAAIsFACGLAwEA6QQAIYwDAQDyBAAhDwwAAOoFACANAADTBgAgEAAA7AUAIBIAAO0FACDIAkAA6AQAIdQCAQDpBAAh1QIBAOkEACHWAgEA6QQAIdcCAQDyBAAh2gJAAOgEACHlAgAA6AWOAyLnAiAA8wQAIe4CQACLBQAhiwMBAOkEACGMAwEA8gQAIQ8MAAC1BgAgDQAA1AYAIA4AALYGACASAAC4BgAgyAJAAAAAAdQCAQAAAAHVAgEAAAAB1gIBAAAAAdcCAQAAAAHaAkAAAAAB5QIAAACOAwLnAiAAAAAB7gJAAAAAAYsDAQAAAAGMAwEAAAABAgAAABoAICcAAPYHACADAAAAGAAgJwAA9gcAICgAAPoHACARAAAAGAAgDAAA6gUAIA0AANMGACAOAADrBQAgEgAA7QUAICAAAPoHACDIAkAA6AQAIdQCAQDpBAAh1QIBAOkEACHWAgEA6QQAIdcCAQDyBAAh2gJAAOgEACHlAgAA6AWOAyLnAiAA8wQAIe4CQACLBQAhiwMBAOkEACGMAwEA8gQAIQ8MAADqBQAgDQAA0wYAIA4AAOsFACASAADtBQAgyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh1gIBAOkEACHXAgEA8gQAIdoCQADoBAAh5QIAAOgFjgMi5wIgAPMEACHuAkAAiwUAIYsDAQDpBAAhjAMBAPIEACEODwAAzwYAIBUAALIGACAZAACzBgAgxgIBAAAAAcgCQAAAAAHUAgEAAAAB2gJAAAAAAecCIAAAAAHqAgEAAAAB7gJAAAAAAYEDEAAAAAGCAxAAAAABgwMCAAAAAYQDgAAAAAECAAAAJAAgJwAA-wcAIAMAAAAiACAnAAD7BwAgKAAA_wcAIBAAAAAiACAPAADOBgAgFQAAkAYAIBkAAJEGACAgAAD_BwAgxgIBAOkEACHIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIeoCAQDpBAAh7gJAAIsFACGBAxAAiQUAIYIDEACNBgAhgwMCAJMFACGEA4AAAAABDg8AAM4GACAVAACQBgAgGQAAkQYAIMYCAQDpBAAhyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHqAgEA6QQAIe4CQACLBQAhgQMQAIkFACGCAxAAjQYAIYMDAgCTBQAhhAOAAAAAAQoIAADyBgAgCQAA8AYAIMgCQAAAAAHUAgEAAAAB1QIBAAAAAdYCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAGOAwEAAAABAgAAABYAICcAAIAIACAHyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH_AgEAAAABgAMCAAAAAQfIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB7AICAAAAAe4CQAAAAAH9AgEAAAABC8gCQAAAAAHUAgEAAAAB2gJAAAAAAd4CAQAAAAHnAiAAAAAB6QIBAAAAAeoCAQAAAAHrAhAAAAAB7AICAAAAAe0CEAAAAAHuAkAAAAABCsgCQAAAAAHUAgEAAAAB2gJAAAAAAecCIAAAAAHqAgEAAAAB7gJAAAAAAYEDEAAAAAGCAxAAAAABgwMCAAAAAYQDgAAAAAEHyAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAe4CQAAAAAH_AgEAAAABgAMCAAAAAQLHAgEAAAAByAJAAAAAAQMAAAATACAnAACACAAgKAAAiggAIAwAAAATACAIAADYBgAgCQAA2QYAICAAAIoIACDIAkAA6AQAIdQCAQDpBAAh1QIBAOkEACHWAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIY4DAQDyBAAhCggAANgGACAJAADZBgAgyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh1gIBAOkEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACGOAwEA8gQAIQrIAkAAAAAB1AIBAAAAAdUCAQAAAAHWAgEAAAAB1wIBAAAAAdoCQAAAAAHlAgAAAI4DAucCIAAAAAHuAkAAAAABiwMBAAAAARAEAAC9BwAgBQAAvgcAIAYAAL8HACAaAADBBwAgyAJAAAAAAdQCAQAAAAHVAgEAAAAB2gJAAAAAAeUCAAAArAMC5wIgAAAAAe4CQAAAAAGmAwEAAAABpwMgAAAAAagDAQAAAAGqAwAAAKoDAqwDIAAAAAECAAAAAQAgJwAAjAgAIAfIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB6AIBAAAAAewCAgAAAAHuAkAAAAABAwAAAE8AICcAAIwIACAoAACRCAAgEgAAAE8AIAQAAIoHACAFAACLBwAgBgAAjAcAIBoAAI4HACAgAACRCAAgyAJAAOgEACHUAgEA6QQAIdUCAQDpBAAh2gJAAOgEACHlAgAAiQesAyLnAiAA8wQAIe4CQACLBQAhpgMBAOkEACGnAyAA8wQAIagDAQDyBAAhqgMAAIgHqgMirAMgAPMEACEQBAAAigcAIAUAAIsHACAGAACMBwAgGgAAjgcAIMgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdoCQADoBAAh5QIAAIkHrAMi5wIgAPMEACHuAkAAiwUAIaYDAQDpBAAhpwMgAPMEACGoAwEA8gQAIaoDAACIB6oDIqwDIADzBAAhDg8AAM8GACAUAACxBgAgGQAAswYAIMYCAQAAAAHIAkAAAAAB1AIBAAAAAdoCQAAAAAHnAiAAAAAB6gIBAAAAAe4CQAAAAAGBAxAAAAABggMQAAAAAYMDAgAAAAGEA4AAAAABAgAAACQAICcAAJIIACAHAwAA1gUAIMgCQAAAAAHUAgEAAAAB2gJAAAAAAecCIAAAAAHuAkAAAAAB8AIBAAAAAQIAAADMAgAgJwAAlAgAIAMAAAAiACAnAACSCAAgKAAAmAgAIBAAAAAiACAPAADOBgAgFAAAjwYAIBkAAJEGACAgAACYCAAgxgIBAOkEACHIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIeoCAQDpBAAh7gJAAIsFACGBAxAAiQUAIYIDEACNBgAhgwMCAJMFACGEA4AAAAABDg8AAM4GACAUAACPBgAgGQAAkQYAIMYCAQDpBAAhyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHqAgEA6QQAIe4CQACLBQAhgQMQAIkFACGCAxAAjQYAIYMDAgCTBQAhhAOAAAAAAQMAAAANACAnAACUCAAgKAAAmwgAIAkAAAANACADAADIBQAgIAAAmwgAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIecCIADzBAAh7gJAAIsFACHwAgEA6QQAIQcDAADIBQAgyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHuAkAAiwUAIfACAQDpBAAhEAQAAL0HACAFAAC-BwAgBgAAvwcAIAcAAMAHACDIAkAAAAAB1AIBAAAAAdUCAQAAAAHaAkAAAAAB5QIAAACsAwLnAiAAAAAB7gJAAAAAAaYDAQAAAAGnAyAAAAABqAMBAAAAAaoDAAAAqgMCrAMgAAAAAQIAAAABACAnAACcCAAgC8gCQAAAAAHUAgEAAAAB2gJAAAAAAecCIAAAAAHoAgEAAAAB6QIBAAAAAeoCAQAAAAHrAhAAAAAB7AICAAAAAe0CEAAAAAHuAkAAAAABCsgCQAAAAAHUAgEAAAAB2gJAAAAAAeACAAAA4AIC4QIBAAAAAeICAQAAAAHjAhAAAAAB5QIAAADlAgLmAkAAAAAB5wIgAAAAAQMAAABPACAnAACcCAAgKAAAoggAIBIAAABPACAEAACKBwAgBQAAiwcAIAYAAIwHACAHAACNBwAgIAAAoggAIMgCQADoBAAh1AIBAOkEACHVAgEA6QQAIdoCQADoBAAh5QIAAIkHrAMi5wIgAPMEACHuAkAAiwUAIaYDAQDpBAAhpwMgAPMEACGoAwEA8gQAIaoDAACIB6oDIqwDIADzBAAhEAQAAIoHACAFAACLBwAgBgAAjAcAIAcAAI0HACDIAkAA6AQAIdQCAQDpBAAh1QIBAOkEACHaAkAA6AQAIeUCAACJB6wDIucCIADzBAAh7gJAAIsFACGmAwEA6QQAIacDIADzBAAhqAMBAPIEACGqAwAAiAeqAyKsAyAA8wQAIQ4PAADPBgAgFAAAsQYAIBUAALIGACDGAgEAAAAByAJAAAAAAdQCAQAAAAHaAkAAAAAB5wIgAAAAAeoCAQAAAAHuAkAAAAABgQMQAAAAAYIDEAAAAAGDAwIAAAABhAOAAAAAAQIAAAAkACAnAACjCAAgFQMAALkFACAYAAC7BQAgyAJAAAAAAdQCAQAAAAHaAkAAAAAB5QIAAADyAgLnAiAAAAAB7gJAAAAAAe8CAQAAAAHwAgEAAAAB8gIQAAAAAfMCEAAAAAH0AhAAAAAB9QIQAAAAAfYCEAAAAAH3AgEAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAfwCAQAAAAECAAAASQAgJwAApQgAIAMAAAAiACAnAACjCAAgKAAAqQgAIBAAAAAiACAPAADOBgAgFAAAjwYAIBUAAJAGACAgAACpCAAgxgIBAOkEACHIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHnAiAA8wQAIeoCAQDpBAAh7gJAAIsFACGBAxAAiQUAIYIDEACNBgAhgwMCAJMFACGEA4AAAAABDg8AAM4GACAUAACPBgAgFQAAkAYAIMYCAQDpBAAhyAJAAOgEACHUAgEA6QQAIdoCQADoBAAh5wIgAPMEACHqAgEA6QQAIe4CQACLBQAhgQMQAIkFACGCAxAAjQYAIYMDAgCTBQAhhAOAAAAAAQMAAABHACAnAAClCAAgKAAArAgAIBcAAABHACADAACeBQAgGAAAoAUAICAAAKwIACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHlAgAAnQXyAiLnAiAA8wQAIe4CQACLBQAh7wIBAOkEACHwAgEA6QQAIfICEACJBQAh8wIQAIkFACH0AhAAiQUAIfUCEACJBQAh9gIQAIkFACH3AgEA6QQAIfgCAQDpBAAh-QIBAOkEACH6AgEA6QQAIfsCAQDyBAAh_AIBAOkEACEVAwAAngUAIBgAAKAFACDIAkAA6AQAIdQCAQDpBAAh2gJAAOgEACHlAgAAnQXyAiLnAiAA8wQAIe4CQACLBQAh7wIBAOkEACHwAgEA6QQAIfICEACJBQAh8wIQAIkFACH0AhAAiQUAIfUCEACJBQAh9gIQAIkFACH3AgEA6QQAIfgCAQDpBAAh-QIBAOkEACH6AgEA6QQAIfsCAQDyBAAh_AIBAOkEACEVAwAAuQUAIBYAALoFACDIAkAAAAAB1AIBAAAAAdoCQAAAAAHlAgAAAPICAucCIAAAAAHuAkAAAAAB7wIBAAAAAfACAQAAAAHyAhAAAAAB8wIQAAAAAfQCEAAAAAH1AhAAAAAB9gIQAAAAAfcCAQAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAQIAAABJACAnAACtCAAgAwAAAEcAICcAAK0IACAoAACxCAAgFwAAAEcAIAMAAJ4FACAWAACfBQAgIAAAsQgAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIeUCAACdBfICIucCIADzBAAh7gJAAIsFACHvAgEA6QQAIfACAQDpBAAh8gIQAIkFACHzAhAAiQUAIfQCEACJBQAh9QIQAIkFACH2AhAAiQUAIfcCAQDpBAAh-AIBAOkEACH5AgEA6QQAIfoCAQDpBAAh-wIBAPIEACH8AgEA6QQAIRUDAACeBQAgFgAAnwUAIMgCQADoBAAh1AIBAOkEACHaAkAA6AQAIeUCAACdBfICIucCIADzBAAh7gJAAIsFACHvAgEA6QQAIfACAQDpBAAh8gIQAIkFACHzAhAAiQUAIfQCEACJBQAh9QIQAIkFACH2AhAAiQUAIfcCAQDpBAAh-AIBAOkEACH5AgEA6QQAIfoCAQDpBAAh-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-A0V_A0aBAQNHgwEaSIQBKUmGAQNKiAEaS4kBKkyKAQNNiwEDTowBGk-PAStQkAEvUZIBMFKTATBTlgEwVJcBMFWYATBWmgEwV5wBGlidATFZnwEwWqEBGluiATJcowEwXaQBMF6lARpfqAEzYKkBN2GrAQRirAEEY64BBGSvAQRlsAEEZrIBBGe0ARpotQE4abcBBGq5ARprugE5bLsBBG28AQRuvQEab8ABOnDBAT5xwgEJcsMBCXPEAQl0xQEJdcYBCXbIAQl3ygEaeMsBP3nOAQl60AEae9EBQHzTAQl91AEJftUBGn_YAUGAAdkBRYEB2gEIggHbAQiDAdwBCIQB3QEIhQHeAQiGAeABCIcB4gEaiAHjAUaJAeYBCIoB6AEaiwHpAUeMAesBCI0B7AEIjgHtARqPAfABSJAB8QFMkQHyAQeSAfMBB5MB9AEHlAH1AQeVAfYBB5YB-AEHlwH6ARqYAfsBTZkB_QEHmgH_ARqbAYACTpwBgQIHnQGCAgeeAYMCGqEBhgJPogGHAlWjAYgCDaQBiQINpQGKAg2mAYsCDacBjAINqAGOAg2pAZACGqoBkQJWqwGTAg2sAZUCGq0BlgJXrgGXAg2vAZgCDbABmQIasQGcAliyAZ0CXrMBngIStAGfAhK1AaACErYBoQIStwGiAhK4AaQCErkBpgIaugGnAl-7AakCErwBqwIavQGsAmC-Aa0CEr8BrgISwAGvAhrBAbICYcIBswJnwwG1AgvEAbYCC8UBuAILxgG5AgvHAboCC8gBvAILyQG-AhrKAb8CaMsBwQILzAHDAhrNAcQCac4BxQILzwHGAgvQAccCGtEBygJq0gHLAm7TAc0CBdQBzgIF1QHQAgXWAdECBdcB0gIF2AHUAgXZAdYCGtoB1wJv2wHZAgXcAdsCGt0B3AJw3gHdAgXfAd4CBeAB3wIa4QHiAnHiAeMCdeMB5AIG5AHlAgblAeYCBuYB5wIG5wHoAgboAeoCBukB7AIa6gHtAnbrAe8CBuwB8QIa7QHyAnfuAfMCBu8B9AIG8AH1AhrxAfgCePIB-QJ-8wH6AhT0AfsCFPUB_AIU9gH9AhT3Af4CFPgBgAMU-QGCAxr6AYMDf_sBhQMU_AGHAxr9AYgDgAH-AYkDFP8BigMUgAKLAxqBAo4DgQGCAo8DhwGDApADE4QCkQMThQKSAxOGApMDE4cClAMTiAKWAxOJApgDGooCmQOIAYsCmwMTjAKdAxqNAp4DiQGOAp8DE48CoAMTkAKhAxqRAqQDigGSAqUDkAGTAqYDFZQCpwMVlQKoAxWWAqkDFZcCqgMVmAKsAxWZAq4DGpoCrwORAZsCsQMVnAKzAxqdArQDkgGeArUDFZ8CtgMVoAK3AxqhAroDkwGiArsDmQGjAr0DD6QCvgMPpQLBAw-mAsIDD6cCwwMPqALFAw-pAscDGqoCyAOaAasCygMPrALMAxqtAs0DmwGuAs4DD68CzwMPsALQAxqxAtMDnAGyAtQDoAGzAtUDDrQC1gMOtQLXAw62AtgDDrcC2QMOuALbAw65At0DGroC3gOhAbsC4AMOvALiAxq9AuMDogG-AuQDDr8C5QMOwALmAxrBAukDowHCAuoDpwE"
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
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
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
  ProductScalarFieldEnum: () => ProductScalarFieldEnum,
  ProductVariantImageScalarFieldEnum: () => ProductVariantImageScalarFieldEnum,
  ProductVariantScalarFieldEnum: () => ProductVariantScalarFieldEnum,
  QueryMode: () => QueryMode,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
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
  ProductImage: "ProductImage",
  ProductVariantImage: "ProductVariantImage",
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
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var ProductImageScalarFieldEnum = {
  id: "id",
  productId: "productId",
  url: "url",
  position: "position",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var ProductVariantImageScalarFieldEnum = {
  id: "id",
  variantId: "variantId",
  url: "url",
  position: "position",
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
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
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
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
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
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
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
import { Router as Router2 } from "express";

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

// src/app/routes/index.ts
var routes = Router2();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
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

// src/server.ts
var bootstrap = async () => {
  try {
    await prisma.$connect();
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