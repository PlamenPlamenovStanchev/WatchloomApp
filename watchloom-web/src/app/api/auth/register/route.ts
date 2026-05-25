import { apiSuccess } from "@/lib/api";
import { registerUser } from "@/services/auth.service";

import { authErrorResponse, parseRegisterInput, readJsonObject } from "../_utils";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const input = parseRegisterInput(body);
    const user = await registerUser(input);

    return apiSuccess({ user }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
