import { and, asc, count, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

type AdminUserListParams = {
  page?: number | string | null;
  pageSize?: number | string | null;
  search?: string | null;
  role?: string | null;
};

export type AdminUserListItem = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const roleValues = new Set(["user", "editor", "admin"]);

const normalizePositiveInteger = (value: AdminUserListParams["page"], fallback: number) => {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : value;

  return typeof parsed === "number" && Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeRole = (role?: string | null) => {
  const value = role?.trim();

  return value && roleValues.has(value) ? value : undefined;
};

const toAdminUser = (user: {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}): AdminUserListItem => ({
  id: user.id,
  username: user.name,
  email: user.email,
  role: user.role,
  isActive: true,
  createdAt: user.createdAt,
});

export const getAdminUsers = async (params: AdminUserListParams = {}) => {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const search = params.search?.trim();
  const role = normalizeRole(params.role);
  const offset = (page - 1) * pageSize;
  const filters = [
    search ? or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`)) : undefined,
    role ? eq(users.role, role) : undefined,
  ].filter(Boolean);
  const where = filters.length > 0 ? and(...filters) : undefined;
  const baseQuery = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .$dynamic();
  const countQuery = db.select({ totalItems: count() }).from(users).$dynamic();

  if (where) {
    baseQuery.where(where);
    countQuery.where(where);
  }

  const [items, [pagination]] = await Promise.all([
    baseQuery.orderBy(asc(users.id)).limit(pageSize).offset(offset),
    countQuery,
  ]);
  const totalItems = pagination?.totalItems ?? 0;

  return {
    items: items.map(toAdminUser),
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    search: search ?? "",
    role: role ?? "",
  };
};

export const getAdminUserById = async (userId: number) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ? toAdminUser(user) : null;
};
