import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(params: PaginationParams) {
  const { page, limit } = params;
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organizationName: z.string().min(2, "Organization name is required"),
});

export const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  costPrice: z.coerce.number().min(0),
  sellPrice: z.coerce.number().min(0),
  wholesalePrice: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0).default(0),
  barcode: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  type: z.enum(["RETAIL", "WHOLESALE", "VIP"]).default("WHOLESALE"),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  creditLimit: z.coerce.number().min(0).default(0),
});

export const dealSchema = z.object({
  title: z.string().min(1),
  value: z.coerce.number().min(0),
  stage: z.enum([
    "PROSPECT",
    "QUALIFICATION",
    "PROPOSAL",
    "NEGOTIATION",
    "CLOSED_WON",
    "CLOSED_LOST",
  ]),
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  probability: z.coerce.number().min(0).max(100).default(10),
  expectedClose: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  paymentTerms: z.coerce.number().min(0).default(30),
});

export const leadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED"]).default("NEW"),
  source: z.enum(["WEBSITE", "REFERRAL", "TRADE_SHOW", "COLD_CALL", "SOCIAL", "OTHER"]).default("OTHER"),
  score: z.coerce.number().min(0).max(100).default(0),
});

export const expenseSchema = z.object({
  description: z.string().min(1),
  category: z.enum(["RENT", "UTILITIES", "SALARIES", "MARKETING", "SHIPPING", "SUPPLIES", "OTHER"]),
  amount: z.coerce.number().min(0),
  date: z.string().optional(),
  vendor: z.string().optional(),
});

export const warehouseSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  capacity: z.coerce.number().min(0).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type WarehouseInput = z.infer<typeof warehouseSchema>;
