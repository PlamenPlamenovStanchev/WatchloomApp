import { successResponse, validationErrorResponse } from "@/lib/api/response";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser } from "@/services/auth.service";

import { authErrorResponse, readJsonObject } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const parsedInput = registerSchema.safeParse(body);

    if (!parsedInput.success) {
      return validationErrorResponse(parsedInput.error);
    }

    const input = parsedInput.data;
    const user = await registerUser(input);

    return successResponse({ user }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
