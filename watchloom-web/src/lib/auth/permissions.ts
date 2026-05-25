export type UserRole = "user" | "editor" | "admin";

const authenticatedPathPrefixes = ["/dashboard", "/watchlists", "/favourites", "/reviews"];

export const isEditorPath = (pathname: string) => {
  return pathname === "/editor" || pathname.startsWith("/editor/");
};

export const isAdminPath = (pathname: string) => {
  return pathname === "/admin" || pathname.startsWith("/admin/");
};

export const isProtectedPath = (pathname: string) => {
  return (
    authenticatedPathPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ||
    isEditorPath(pathname) ||
    isAdminPath(pathname)
  );
};

export const isAuthPage = (pathname: string) => {
  return pathname === "/login" || pathname === "/register";
};

export const canAccessPath = (role: UserRole, pathname: string) => {
  if (isAdminPath(pathname)) {
    return role === "admin";
  }

  if (isEditorPath(pathname)) {
    return role === "editor" || role === "admin";
  }

  return isProtectedPath(pathname);
};
