export type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "user" | "editor" | "admin";
};

export const seedUsers: SeedUser[] = [
  { name: "Watchloom User", email: "user@watchloom.dev", password: "User123!", role: "user" },
  { name: "Krummy", email: "krummy@watchloom.dev", password: "User123!", role: "user" },
  { name: "Watchloom Editor", email: "editor@watchloom.dev", password: "Editor123!", role: "editor" },
  { name: "Watchloom Admin", email: "admin@watchloom.dev", password: "Admin123!", role: "admin" },
];
