import { NextResponse } from "next/server";
import { z } from "zod";

import { AppError } from "./errors";

type ErrorDetails = string | z.ZodError;

export const successResponse = <T>(data: T, init?: ResponseInit) => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init,
  );
};

export const messageResponse = (message: string, init?: ResponseInit) => {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    init,
  );
};

export const errorResponse = (message: string, status = 500) => {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    },
  );
};

export const validationErrorResponse = (details: ErrorDetails) => {
  const message =
    typeof details === "string" ? details : details.issues[0]?.message ?? "Invalid input.";

  return errorResponse(message, 400);
};

export const appErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return errorResponse(error.message, error.status);
  }

  return errorResponse("Internal server error.");
};
