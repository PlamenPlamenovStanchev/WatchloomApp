import { apiSuccess } from "@/lib/api";
import { loginUser } from "@/services/auth.service";

import { authErrorResponse, parseLoginInput, readJsonObject, setAuthCookie } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const input = parseLoginInput(body);
    const authResult = await loginUser(input);
    const response = apiSuccess(authResult);

    setAuthCookie(response, authResult.accessToken);

    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
