import { NextResponse } from "next/server";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;

type ApiErrorOptions = {
  status?: number;
};

const normalizePositiveInteger = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getCatalogQueryParams = (request: Request) => {
  const { searchParams } = new URL(request.url);

  return {
    page: normalizePositiveInteger(searchParams.get("page"), DEFAULT_PAGE),
    pageSize: normalizePositiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
    search: searchParams.get("q")?.trim() || null,
    genre: searchParams.get("genre")?.trim() || null,
  };
};

export const apiSuccess = <T>(data: T, init?: ResponseInit) => {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    init,
  );
};

export const apiError = (message: string, options: ApiErrorOptions = {}) => {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
      },
    },
    {
      status: options.status ?? 500,
    },
  );
};

export const withApiErrorHandling = async (handler: () => Promise<NextResponse>) => {
  try {
    return await handler();
  } catch {
    return apiError("Internal server error.");
  }
};
