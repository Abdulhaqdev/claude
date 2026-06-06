import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { fileUploadService } from "@/features/files/services/file-upload.service";
import { handleError } from "@/lib/errors/app-error";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const entityType = formData.get("entityType") as string | null;
    const entityId = formData.get("entityId") as string | null;

    const upload = await fileUploadService.upload(file, user.organizationId, {
      entityType: entityType ?? undefined,
      entityId: entityId ?? undefined,
      uploadedBy: user.id,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
