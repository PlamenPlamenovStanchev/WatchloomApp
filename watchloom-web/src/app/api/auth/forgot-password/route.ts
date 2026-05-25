import { errorResponse, messageResponse, validationErrorResponse } from "@/lib/api/response";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import {
  PASSWORD_RESET_SUCCESS_MESSAGE,
  requestPasswordReset,
} from "@/services/password-reset.service";

import { authErrorResponse, readJsonObject } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const parsedInput = forgotPasswordSchema.safeParse(body);

    if (!parsedInput.success) {
      return validationErrorResponse(parsedInput.error);
    }

    await requestPasswordReset(parsedInput.data.email);

    return messageResponse(PASSWORD_RESET_SUCCESS_MESSAGE);
  } catch (error) {
    if (error instanceof Error && error.name === "AuthServiceError") {
      return authErrorResponse(error);
    }

    return errorResponse("Internal server error.");
  }
}
