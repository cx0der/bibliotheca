import request from "supertest";

import app from "../src/app";
import {
  CreateLoanRequest,
  Loan,
  addBook,
  addLoan,
  addUser,
  resetAll,
} from "../src/data";

describe("Test /loans routes", () => {
  beforeEach(() => {
    resetAll();
  });
  test("GET /loans without x-uid header returns error", async () => {
    const res = await request(app).get("/loans");
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "x-uid header missing" });
  });

  test("GET /loans with non-existent x-uid returns error", async () => {
    const res = await request(app).get("/loans").set("x-uid", "1");
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "Invalid x-uid header" });
  });

  test("GET /loans with non-admin x-uid returns error", async () => {
    addUser({
      name: "not an admin",
      isAdmin: false,
    });
    const res = await request(app).get("/loans").set("x-uid", "1");
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "UnAuthorised" });
  });

  test("GET /loans with admin x-uid returns outstanding loans", async () => {
    addUser({
      name: "admin",
      isAdmin: true,
    });
    const loanStart = new Date();
    const loanEnd = new Date();
    const loan = addLoan({
      bookId: 1,
      loanedTo: 2,
      loanStart,
      loanEnd,
    });
    const expected = [
      {
        id: loan.id,
        bookId: loan.bookId,
        loanedTo: loan.loanedTo,
        loanStart: loan.loanStart.toJSON(),
        loanEnd: loan.loanEnd.toJSON(),
      },
    ];
    const res = await request(app).get("/loans").set("x-uid", "1");
    expect(res.status).toEqual(200);
    expect(res.body).toEqual(expected);
  });

  test("POST /loans checks out a book", async () => {
    const book = addBook({
      title: "The Martian: A Novel",
      author: "Andy Weir",
      isbn: "978-0804139021",
      isReference: false,
    });

    const user = addUser({
      name: "sci-fi lover",
      isAdmin: false,
    });
    const loanStart = new Date();
    const loanEnd = new Date();
    loanEnd.setDate(loanEnd.getDate() + 10);
    const payload: CreateLoanRequest = {
      bookId: book.id,
      loanedTo: user.id,
      loanStart,
      loanEnd,
    };

    const expected = {
      id: 1,
      bookId: book.id,
      loanedTo: user.id,
      loanStart: loanStart.toJSON(),
      loanEnd: loanEnd.toJSON(),
    };

    const res = await request(app)
      .post("/loans")
      .set("x-uid", user.id.toString())
      .send(payload);

    expect(res.status).toEqual(201);
    expect(res.body).toEqual(expected);
  });

  test("POST /loans gives an error for invalid user", async () => {
    const book = addBook({
      title: "The Martian: A Novel",
      author: "Andy Weir",
      isbn: "978-0804139021",
      isReference: false,
    });

    const loanStart = new Date();
    const loanEnd = new Date();
    loanEnd.setDate(loanEnd.getDate() + 10);
    const payload: CreateLoanRequest = {
      bookId: book.id,
      loanedTo: 1,
      loanStart,
      loanEnd,
    };
    const res = await request(app)
      .post("/loans")
      .set("x-uid", "1")
      .send(payload);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "Invalid x-uid header" });
  });

  test("POST /loans gives an error when book is already checked out", async () => {
    const book = addBook({
      title: "The Martian: A Novel",
      author: "Andy Weir",
      isbn: "978-0804139021",
      isReference: false,
    });

    const user = addUser({
      name: "sci-fi lover",
      isAdmin: false,
    });
    const loanStart = new Date();
    const loanEnd = new Date();
    loanEnd.setDate(loanEnd.getDate() + 10);
    addLoan({
      bookId: book.id,
      loanedTo: 2,
      loanStart,
      loanEnd,
    });
    const payload: CreateLoanRequest = {
      bookId: book.id,
      loanedTo: user.id,
      loanStart,
      loanEnd,
    };

    const res = await request(app)
      .post("/loans")
      .set("x-uid", "1")
      .send(payload);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "Book is already loaded" });
  });

  test("POST /loans gives an error for inavlid book id", async () => {
    const user = addUser({
      name: "sci-fi lover",
      isAdmin: false,
    });
    const loanStart = new Date();
    const loanEnd = new Date();
    loanEnd.setDate(loanEnd.getDate() + 10);
    const payload: CreateLoanRequest = {
      bookId: 10,
      loanedTo: user.id,
      loanStart,
      loanEnd,
    };

    const res = await request(app)
      .post("/loans")
      .set("x-uid", "1")
      .send(payload);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "Invalid book id" });
  });

  test("POST /loans gives an error when checking out reference books", async () => {
    const book = addBook({
      title: "Paperback Oxford English Dictionary",
      author: "Oxford Languages",
      isbn: "978-0199640942",
      isReference: true,
    });
    const user = addUser({
      name: "sci-fi lover",
      isAdmin: false,
    });
    const loanStart = new Date();
    const loanEnd = new Date();
    loanEnd.setDate(loanEnd.getDate() + 10);
    const payload: CreateLoanRequest = {
      bookId: book.id,
      loanedTo: user.id,
      loanStart,
      loanEnd,
    };

    const res = await request(app)
      .post("/loans")
      .set("x-uid", user.id.toString())
      .send(payload);
    expect(res.status).toEqual(400);
    expect(res.body).toEqual({ message: "Reference books cannot be loaned" });
  });
});
