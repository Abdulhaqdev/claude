"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthContext,
  formDataToObject,
  emptyToUndefined,
  type ActionResult,
} from "@/lib/actions/helpers";
import { handleError } from "@/lib/errors/app-error";
import { customerSchema, leadSchema, dealSchema } from "@/lib/validations/schemas";
import {
  customerRepository,
  leadRepository,
  dealRepository,
} from "@/features/crm/repositories/customer.repository";
import { auditService } from "@/features/audit/services/audit.service";

export async function createCustomerAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = customerSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await customerRepository.create(organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Customer" });
    revalidatePath("/dashboard/crm/customers");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateCustomerAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = customerSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const existing = await customerRepository.findById(id, organizationId);
    if (!existing) return { success: false, error: "Customer not found" };

    await customerRepository.update(id, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Customer", entityId: id });
    revalidatePath("/dashboard/crm/customers");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await customerRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Customer", entityId: id });
    revalidatePath("/dashboard/crm/customers");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function createLeadAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = leadSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await leadRepository.create(organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Lead" });
    revalidatePath("/dashboard/crm/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateLeadAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const parsed = leadSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await leadRepository.update(id, organizationId, parsed.data);
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Lead", entityId: id });
    revalidatePath("/dashboard/crm/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await leadRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Lead", entityId: id });
    revalidatePath("/dashboard/crm/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function createDealAction(formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const raw = formDataToObject(formData);
    const parsed = dealSchema.safeParse({
      ...raw,
      customerId: emptyToUndefined(raw.customerId),
      leadId: emptyToUndefined(raw.leadId),
    });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await dealRepository.create(organizationId, {
      ...parsed.data,
      expectedClose: parsed.data.expectedClose
        ? new Date(parsed.data.expectedClose)
        : undefined,
    });
    await auditService.log({ organizationId, userId: user.id, action: "created", entity: "Deal" });
    revalidatePath("/dashboard/crm/deals");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function updateDealAction(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    const raw = formDataToObject(formData);
    const parsed = dealSchema.safeParse({
      ...raw,
      customerId: emptyToUndefined(raw.customerId),
      leadId: emptyToUndefined(raw.leadId),
    });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await dealRepository.update(id, organizationId, {
      ...parsed.data,
      expectedClose: parsed.data.expectedClose
        ? new Date(parsed.data.expectedClose)
        : undefined,
    });
    await auditService.log({ organizationId, userId: user.id, action: "updated", entity: "Deal", entityId: id });
    revalidatePath("/dashboard/crm/deals");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}

export async function deleteDealAction(id: string): Promise<ActionResult> {
  try {
    const { organizationId, user } = await getAuthContext();
    await dealRepository.delete(id, organizationId);
    await auditService.log({ organizationId, userId: user.id, action: "deleted", entity: "Deal", entityId: id });
    revalidatePath("/dashboard/crm/deals");
    return { success: true };
  } catch (e) {
    return { success: false, error: handleError(e).message };
  }
}
