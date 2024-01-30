import request from "supertest";

import app from "../src/app";
import {
  CreateBookRequest,
  addBook,
  addLoan,
  listAllBooks,
  resetAll,
} from "../src/data";

describe("Test /book routes", () => {
  beforeEach(() => {
    resetAll();
  });

  test("POST /books adds a book to library", async () => {
    const payload: CreateBookRequest = {
      title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
      author: "Rhiannon Fielding",
      isbn: "978-0241514832",
      isReference: false,
    };
    const res = await request(app).post("/books").send(payload);
    expect(res.status).toBe(201);
    expect(listAllBooks().length).toEqual(1);
  });

  test("GET /books with author finds a book", async () => {
    addBook({
      title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
      author: "Rhiannon Fielding",
      isbn: "978-0241514832",
      isReference: false,
    });

    const res = await request(app).get("/books?author=Rhiannon Fielding");
    expect(res.body).toEqual([
      {
        id: 1,
        title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
        author: "Rhiannon Fielding",
        isbn: "978-0241514832",
        isReference: false,
      },
    ]);
  });

  test("GET /books returns empty when it cant find a book by author", async () => {
    const res = await request(app).get("/books?author=Andy");
    expect(res.body).toEqual([]);
  });

  test("GET /books returns empty when searching by author and the book is checked out", async () => {
    addBook({
      title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
      author: "Rhiannon Fielding",
      isbn: "978-0241514832",
      isReference: false,
    });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    addLoan({
      bookId: 1,
      loanedTo: 1,
      loanStart: new Date(),
      loanEnd: endDate,
    });
    const res = await request(app).get("/books?author=Rhiannon");
    expect(res.body).toEqual([]);
  });

  test("GET /books with title finds a book", async () => {
    addBook({
      title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
      author: "Rhiannon Fielding",
      isbn: "978-0241514832",
      isReference: false,
    });

    const res = await request(app).get("/books?title=Little");
    expect(res.body).toEqual([
      {
        id: 1,
        title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
        author: "Rhiannon Fielding",
        isbn: "978-0241514832",
        isReference: false,
      },
    ]);
  });

  test("GET /books returns empty when it cant find a book by title", async () => {
    const res = await request(app).get("/books?title=The Martian");
    expect(res.body).toEqual([]);
  });

  test("GET /books returns empty when searching by title and the book is checked out", async () => {
    addBook({
      title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
      author: "Rhiannon Fielding",
      isbn: "978-0241514832",
      isReference: false,
    });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    addLoan({
      bookId: 1,
      loanedTo: 1,
      loanStart: new Date(),
      loanEnd: endDate,
    });
    const res = await request(app).get("/books?title=Little");
    expect(res.body).toEqual([]);
  });

  test("GET /books with isbn finds a book", async () => {
    addBook({
      title: "The Martian: A Novel",
      author: "Andy Weir",
      isbn: "978-0804139021",
      isReference: false,
    });

    const res = await request(app).get("/books?isbn=978-0804139021");
    expect(res.body).toEqual([
      {
        id: 1,
        title: "The Martian: A Novel",
        author: "Andy Weir",
        isbn: "978-0804139021",
        isReference: false,
      },
    ]);
  });

  test("GET /books returns empty when it cant find a book by isbn", async () => {
    const res = await request(app).get("/books?isbn=978-0804139021");
    expect(res.body).toEqual([]);
  });

  test("GET /books returns empty when searching by isbn and the book is checked out", async () => {
    addBook({
      title: "Little Unicorn's Birthday (Ten Minutes to Bed)",
      author: "Rhiannon Fielding",
      isbn: "978-0241514832",
      isReference: false,
    });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    addLoan({
      bookId: 1,
      loanedTo: 1,
      loanStart: new Date(),
      loanEnd: endDate,
    });
    const res = await request(app).get("/books?isbn=978-0241514832");
    expect(res.body).toEqual([]);
  });

  test("GET /books with isbn and author finds a book", async () => {
    addBook({
      title: "The Martian: A Novel",
      author: "Andy Weir",
      isbn: "978-0804139021",
      isReference: false,
    });
    addBook({
      title: "The Martian: Young Readers Edition",
      author: "Andy Weir",
      isbn: "978-1785034671",
      isReference: false,
    });

    const res = await request(app).get(
      "/books?isbn=978-1785034671&author=andy weir"
    );
    expect(res.body).toEqual([
      {
        id: 2,
        title: "The Martian: Young Readers Edition",
        author: "Andy Weir",
        isbn: "978-1785034671",
        isReference: false,
      },
    ]);
  });

  test("GET /books with title, isbn and author finds a book", async () => {
    addBook({
      title: "The Martian: A Novel",
      author: "Andy Weir",
      isbn: "978-0804139021",
      isReference: false,
    });
    addBook({
      title: "The Martian: Young Readers Edition",
      author: "Andy Weir",
      isbn: "978-1785034671",
      isReference: false,
    });
    const loanEnd = new Date();
    loanEnd.setDate(loanEnd.getDate() + 10);
    addLoan({
      bookId: 1,
      loanedTo: 1,
      loanStart: new Date(),
      loanEnd,
    });

    const res = await request(app).get(
      "/books?isbn=978-1785034671&author=andy weir&title=The Martian: Young Readers Edition"
    );
    expect(res.body).toEqual([
      {
        id: 2,
        title: "The Martian: Young Readers Edition",
        author: "Andy Weir",
        isbn: "978-1785034671",
        isReference: false,
      },
    ]);
  });

  test("GET /books without query paramerters gives 400", async () => {
    const res = await request(app).get("/books");
    expect(res.status).toEqual(400);
  });
});
