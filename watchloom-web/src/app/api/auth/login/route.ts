import { successResponse, validationErrorResponse } from "@/lib/api/response";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser } from "@/services/auth.service";

import { authErrorResponse, readJsonObject, setAuthCookie } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const parsedInput = loginSchema.safeParse(body);

    if (!parsedInput.success) {
      return validationErrorResponse(parsedInput.error);
    }

    const input = parsedInput.data;
    const authResult = await loginUser(input);
    const response = successResponse(authResult);

    setAuthCookie(response, authResult.accessToken);

    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
