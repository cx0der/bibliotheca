import request from "supertest";

import app from "../src/app";

describe("Test /", () => {
  test("GET /version returns the version", async () => {
    const res = await request(app).get("/version");
    expect(res.body).toEqual({ message: "1.0.0" });
  });
});
