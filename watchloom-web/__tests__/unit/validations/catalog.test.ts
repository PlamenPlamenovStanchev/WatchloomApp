import { catalogQuerySchema } from "@/lib/validations/catalog";

describe("catalog validation schema", () => {
  it("pagination defaults work", () => {
    const result = catalogQuerySchema.parse({});

    expect(result).toMatchObject({
      page: 1,
      pageSize: 12,
    });
  });

  it("invalid page is rejected", () => {
    const result = catalogQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("invalid pageSize is rejected", () => {
    const result = catalogQuerySchema.safeParse({
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });

  it("search query validation works", () => {
    const result = catalogQuerySchema.parse({
      search: "  breaking bad  ",
    });

    expect(result.search).toBe("breaking bad");
  });
});
