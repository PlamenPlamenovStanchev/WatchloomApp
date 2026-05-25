import { errorResponse, messageResponse, validationErrorResponse } from "@/lib/api/response";
import { resetPasswordSchema } from "@/lib/validations/auth";
import {
  PasswordResetServiceError,
  resetPassword,
} from "@/services/password-reset.service";

import { authErrorResponse, readJsonObject } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const parsedInput = resetPasswordSchema.safeParse(body);

    if (!parsedInput.success) {
      return validationErrorResponse(parsedInput.error);
    }

    await resetPassword(parsedInput.data.token, parsedInput.data.password);

    return messageResponse("Your password has been reset.");
  } catch (error) {
    if (error instanceof PasswordResetServiceError) {
      return errorResponse("Invalid or expired password reset token.", 400);
    }

    if (error instanceof Error && error.name === "AuthServiceError") {
      return authErrorResponse(error);
    }

    return errorResponse("Internal server error.");
  }
}
