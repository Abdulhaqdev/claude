"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext, formDataToObject, type ActionResult } from "@/lib/actions/helpers";
import { handleError } from "@/lib/errors/app-error";
import { warehouseSchema } from "@/lib/validations/schemas";
import { warehouseRepository } from "@/features/wms/repositories/inventory.repository";
import { auditService } from "@/features/audit/services/audit.service";

export async function createWarehouseAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = warehouseSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await warehouseRepository.create(organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Warehouse" });
    revalidatePath("/dashboard/wms/warehouses");
    revalidatePath("/dashboard/wms/inventory");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateWarehouseAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = warehouseSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await warehouseRepository.update(id, organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Warehouse", entityId: id });
    revalidatePath("/dashboard/wms/warehouses");
    revalidatePath("/dashboard/wms/inventory");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteWarehouseAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await warehouseRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Warehouse", entityId: id });
    revalidatePath("/dashboard/wms/warehouses");
    revalidatePath("/dashboard/wms/inventory");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}
