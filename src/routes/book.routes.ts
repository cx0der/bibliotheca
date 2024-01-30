import { NextFunction, Request, Response, Router } from "express";
import { CreateBookRequest, addBook, searchBooks } from "../data";

const router: Router = Router();

router.post("/", (req: Request, res: Response) => {
  const createBookReq: CreateBookRequest = req.body;
  const createdBook = addBook(createBookReq);
  res.status(201).json(createdBook);
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = req.query.author as string;
    const title = req.query.title as string;
    const isbn = req.query.isbn as string;
    if (!author && !title && !isbn) {
      throw new Error(
        "At least one of Author, Book title or ISBN must be specified"
      );
    }
    const searchResult = searchBooks(author, title, isbn);
    res.json(searchResult);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
    next(err);
  }
});

export { router };
