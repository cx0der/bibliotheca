import express, { Application, Request, Response } from "express";

import { router as bookRoutes } from "./routes/book.routes";
import { router as loanRoutes } from "./routes/loan.routes";

const app: Application = express();

app.use(
  express.json({
    strict: true,
  })
);

app.use("/books", bookRoutes);
app.use("/loans", loanRoutes);

app.get("/version", (_req: Request, res: Response) => {
  res.json({
    message: "1.0.0",
  });
});

export default app;
