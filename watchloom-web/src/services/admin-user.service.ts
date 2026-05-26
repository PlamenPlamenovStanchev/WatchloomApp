import { and, asc, count, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { favourites, reviews, users, watchlists } from "@/db/schema";

type AdminUserListParams = {
  page?: number | string | null;
  pageSize?: number | string | null;
  search?: string | null;
  role?: string | null;
  active?: string | null;
};

type AdminRole = "user" | "editor" | "admin";

export type AdminUserListItem = {
  id: number;
  username: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
};

export type AdminUserDetail = AdminUserListItem & {
  watchlistsCount: number;
  reviewsCount: number;
  favouritesCount: number;
};

export class AdminUserServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "USER_NOT_FOUND"
      | "INVALID_ROLE"
      | "CANNOT_MODIFY_SELF"
      | "LAST_ADMIN"
      | "UNSAFE_DELETE",
  ) {
    super(message);
    this.name = "AdminUserServiceError";
  }
}

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

const normalizeActive = (active?: string | null) => {
  if (active === "active") {
    return true;
  }

  if (active === "inactive") {
    return false;
  }

  return undefined;
};

const normalizeRoleValue = (role: string): AdminRole => {
  if (role === "editor" || role === "admin") {
    return role;
  }

  return "user";
};

const toAdminUser = (user: {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}): AdminUserListItem => ({
  id: user.id,
  username: user.name,
  email: user.email,
  role: normalizeRoleValue(user.role),
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const getAdminCount = async () => {
  const [row] = await db
    .select({ total: count() })
    .from(users)
    .where(eq(users.role, "admin"));

  return row?.total ?? 0;
};

const getSafeUserRecordById = async (userId: number) => {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};

const assertCanRemoveAdminRole = async (targetUserId: number) => {
  const target = await getSafeUserRecordById(targetUserId);

  if (!target) {
    throw new AdminUserServiceError("User was not found.", "USER_NOT_FOUND");
  }

  if (target.role === "admin" && (await getAdminCount()) <= 1) {
    throw new AdminUserServiceError("Cannot remove the last admin.", "LAST_ADMIN");
  }

  return target;
};

export const getAdminUsers = async (params: AdminUserListParams = {}) => {
  const page = normalizePositiveInteger(params.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInteger(params.pageSize, DEFAULT_PAGE_SIZE);
  const search = params.search?.trim();
  const role = normalizeRole(params.role);
  const active = normalizeActive(params.active);
  const offset = (page - 1) * pageSize;
  const filters = [
    search ? or(ilike(users.email, `%${search}%`), ilike(users.name, `%${search}%`)) : undefined,
    role ? eq(users.role, role) : undefined,
    active !== undefined ? eq(users.isActive, active) : undefined,
  ].filter(Boolean);
  const where = filters.length > 0 ? and(...filters) : undefined;
  const baseQuery = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
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
    active: active === true ? "active" : active === false ? "inactive" : "",
  };
};

export const getAdminUserById = async (userId: number) => {
  const user = await getSafeUserRecordById(userId);

  if (!user) {
    return null;
  }

  const [[watchlistsResult], [reviewsResult], [favouritesResult]] = await Promise.all([
    db.select({ total: count() }).from(watchlists).where(eq(watchlists.userId, userId)),
    db.select({ total: count() }).from(reviews).where(eq(reviews.userId, userId)),
    db.select({ total: count() }).from(favourites).where(eq(favourites.userId, userId)),
  ]);

  return {
    ...toAdminUser(user),
    watchlistsCount: watchlistsResult?.total ?? 0,
    reviewsCount: reviewsResult?.total ?? 0,
    favouritesCount: favouritesResult?.total ?? 0,
  };
};

export const updateAdminUserRole = async (
  currentAdminId: number,
  targetUserId: number,
  role: AdminRole,
) => {
  if (!roleValues.has(role)) {
    throw new AdminUserServiceError("Invalid role.", "INVALID_ROLE");
  }

  if (currentAdminId === targetUserId && role !== "admin") {
    throw new AdminUserServiceError("You cannot demote your own admin account.", "CANNOT_MODIFY_SELF");
  }

  const target = await assertCanRemoveAdminRole(targetUserId);

  if (target.role === "admin" && role !== "admin" && (await getAdminCount()) <= 1) {
    throw new AdminUserServiceError("Cannot demote the last admin.", "LAST_ADMIN");
  }

  const [updatedUser] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  return updatedUser ? toAdminUser(updatedUser) : null;
};

export const updateAdminUserActiveStatus = async (
  currentAdminId: number,
  targetUserId: number,
  isActive: boolean,
) => {
  if (currentAdminId === targetUserId && !isActive) {
    throw new AdminUserServiceError("You cannot deactivate your own admin account.", "CANNOT_MODIFY_SELF");
  }

  const target = await assertCanRemoveAdminRole(targetUserId);

  if (target.role === "admin" && !isActive && (await getAdminCount()) <= 1) {
    throw new AdminUserServiceError("Cannot deactivate the last admin.", "LAST_ADMIN");
  }

  const [updatedUser] = await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, targetUserId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  return updatedUser ? toAdminUser(updatedUser) : null;
};

export const deleteAdminUser = async (currentAdminId: number, targetUserId: number) => {
  if (currentAdminId === targetUserId) {
    throw new AdminUserServiceError("You cannot delete your own admin account.", "CANNOT_MODIFY_SELF");
  }

  const target = await assertCanRemoveAdminRole(targetUserId);

  if (target.role === "admin" && (await getAdminCount()) <= 1) {
    throw new AdminUserServiceError("Cannot delete the last admin.", "LAST_ADMIN");
  }

  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.id, targetUserId))
    .returning({ id: users.id });

  if (!deletedUser) {
    throw new AdminUserServiceError("User was not found.", "USER_NOT_FOUND");
  }

  return true;
};
