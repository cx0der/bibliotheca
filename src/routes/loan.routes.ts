import { NextFunction, Request, Response, Router } from "express";
import {
  CreateLoanRequest,
  addLoan,
  allLoans,
  findBookById,
  getUserById,
  isBookAvailable,
} from "../data";

const router: Router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  try {
    const uIdHeaderValue = req.headers["x-uid"];
    if (!uIdHeaderValue) {
      throw new Error("x-uid header missing");
    }
    if (typeof uIdHeaderValue !== "string") {
      throw new Error("invalid x-uid header");
    }
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    return next(err);
  }
  next();
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const uIdHeaderValue = req.headers["x-uid"] as string;
    const uId = Number.parseInt(uIdHeaderValue);
    const user = getUserById(uId);
    if (!user) {
      throw new Error("Invalid x-uid header");
    }
    if (user && !user.isAdmin) {
      throw new Error("UnAuthorised");
    }
    const loans = allLoans();
    res.json(loans);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    next(err);
  }
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const uIdHeaderValue = req.headers["x-uid"] as string;
    const user = getUserById(Number.parseInt(uIdHeaderValue));
    if (!user) {
      throw new Error("Invalid x-uid header");
    }

    const loanRequest: CreateLoanRequest = req.body;
    const book = findBookById(loanRequest.bookId);
    if (!book) {
      throw new Error("Invalid book id");
    }

    if (!isBookAvailable(loanRequest.bookId)) {
      throw new Error("Book is already loaded");
    }

    if (book.isReference) {
      throw new Error("Reference books cannot be loaned");
    }
    const loan = addLoan(loanRequest);
    res.status(201).json(loan);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    next(err);
  }
});

export { router };
