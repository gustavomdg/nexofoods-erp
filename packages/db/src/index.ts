export { prisma } from "./client.js";
export { createTenantClient } from "./middleware/tenant.js";
export type { TenantPrismaClient } from "./middleware/tenant.js";
export * from "@prisma/client";
