"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthContext,
  formDataToObject,
  emptyToUndefined,
  type ActionResult,
} from "@/lib/actions/helpers";
import { handleError } from "@/lib/errors/app-error";
import {
  productSchema,
  categorySchema,
  supplierSchema,
  expenseSchema,
} from "@/lib/validations/schemas";
import { productRepository } from "@/features/erp/repositories/product.repository";
import {
  categoryRepository,
  supplierRepository,
} from "@/features/erp/repositories/invoice.repository";
import { expenseRepository } from "@/features/shared/repositories/operations.repository";
import { auditService } from "@/features/audit/services/audit.service";
import { slugify } from "@/lib/utils";

const PRODUCTS_PATH = "/dashboard/erp/products";

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const raw = formDataToObject(formData);
    const parsed = productSchema.safeParse({
      ...raw,
      categoryId: emptyToUndefined(raw.categoryId),
    });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await productRepository.create(organizationId, parsed.data);
    await auditService.log({
      organizationId,
      userId: user.id,
      action: "created",
      entity: "Product",
      metadata: { sku: parsed.data.sku },
    });
    revalidatePath(PRODUCTS_PATH);
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateProductAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const raw = formDataToObject(formData);
    const parsed = productSchema.safeParse({
      ...raw,
      categoryId: emptyToUndefined(raw.categoryId),
    });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await productRepository.update(id, organizationId, parsed.data);
    await auditService.log({
      organizationId,
      userId: user.id,
      action: "updated",
      entity: "Product",
      entityId: id,
    });
    revalidatePath(PRODUCTS_PATH);
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await productRepository.delete(id, organizationId);
    await auditService.log({
      organizationId,
      userId: user.id,
      action: "deleted",
      entity: "Product",
      entityId: id,
    });
    revalidatePath(PRODUCTS_PATH);
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const raw = formDataToObject(formData);
    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await categoryRepository.create(organizationId, {
      ...parsed.data,
      slug: parsed.data.slug || slugify(parsed.data.name),
    });
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Category" });
    revalidatePath("/dashboard/erp/categories");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const raw = formDataToObject(formData);
    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await categoryRepository.update(id, organizationId, {
      ...parsed.data,
      slug: parsed.data.slug || slugify(parsed.data.name),
    });
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Category", entityId: id });
    revalidatePath("/dashboard/erp/categories");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await categoryRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Category", entityId: id });
    revalidatePath("/dashboard/erp/categories");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function createSupplierAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = supplierSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await supplierRepository.create(organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Supplier" });
    revalidatePath("/dashboard/erp/suppliers");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateSupplierAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = supplierSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await supplierRepository.update(id, organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Supplier", entityId: id });
    revalidatePath("/dashboard/erp/suppliers");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await supplierRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Supplier", entityId: id });
    revalidatePath("/dashboard/erp/suppliers");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = expenseSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const { date, ...rest } = parsed.data;
    await expenseRepository.create(organizationId, {
      ...rest,
      date: date ? new Date(date) : new Date(),
    });
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Expense" });
    revalidatePath("/dashboard/erp/expenses");
    revalidatePath("/dashboard/erp/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateExpenseAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = expenseSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const { date, ...rest } = parsed.data;
    await expenseRepository.update(id, organizationId, {
      ...rest,
      ...(date ? { date: new Date(date) } : {}),
    });
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Expense", entityId: id });
    revalidatePath("/dashboard/erp/expenses");
    revalidatePath("/dashboard/erp/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await expenseRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Expense", entityId: id });
    revalidatePath("/dashboard/erp/expenses");
    revalidatePath("/dashboard/erp/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function getProductAction(id: string) {
  const { organizationId } = await getAuthContext();
  const product = await productRepository.findById(id, organizationId);
  if (!product) return null;
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    categoryId: product.categoryId ?? "",
    brand: product.brand ?? "",
    color: product.color ?? "",
    size: product.size ?? "",
    material: product.material ?? "",
    costPrice: Number(product.costPrice),
    sellPrice: Number(product.sellPrice),
    wholesalePrice: Number(product.wholesalePrice),
    minStock: product.minStock,
    barcode: product.barcode ?? "",
  };
}
