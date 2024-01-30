export interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}

export interface CreateUserRequest {
  name: string;
  isAdmin: boolean;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  isReference: boolean;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  isReference: boolean;
}

export interface Loan {
  id: number;
  bookId: number;
  loanedTo: number;
  loanStart: Date;
  loanEnd: Date;
}

export interface CreateLoanRequest {
  bookId: number;
  loanedTo: number;
  loanStart: Date;
  loanEnd: Date;
}

let nextUserId = 1;
const users: User[] = [];

let nextBookId = 1;
const books: Book[] = [];

let nextLoanId = 1;
const loans: Loan[] = [];

export const addUser = (user: CreateUserRequest): User => {
  const createdUser: User = {
    id: nextUserId,
    ...user,
  };
  users.push(createdUser);
  nextUserId += 1;
  return createdUser;
};

export const getUserById = (id: number): User | undefined => {
  return users.find((u) => u.id === id);
};

export const listAllBooks = (): Book[] => {
  return books;
};

export const addBook = (bookToAdd: CreateBookRequest): Book => {
  const book: Book = {
    id: nextBookId,
    ...bookToAdd,
  };
  books.push(book);
  nextBookId += 1;
  return book;
};

const bookLoanComparator = (book: Book, loan: Loan): boolean => {
  return book.id === loan.bookId;
};

export const searchBooks = (
  author?: string,
  title?: string,
  isbn?: string
): Book[] => {
  const booksInCatalogue = books.filter((b: Book) => {
    const searchAuthor = author ? author.toLocaleLowerCase() : "";
    const searchTitle = title ? title.toLocaleLowerCase() : "";
    const searchIsbn = isbn || "";
    return (
      b.author.toLocaleLowerCase().includes(searchAuthor) &&
      b.title.toLocaleLowerCase().includes(searchTitle) &&
      b.isbn.includes(searchIsbn)
    );
  });

  return booksInCatalogue.filter(
    (b) => !loans.some((l) => bookLoanComparator(b, l))
  );
};

export const findBookById = (id: number): Book | undefined => {
  return books.find((b) => b.id === id);
};

export const isBookAvailable = (id: number): boolean => {
  return !loans.find((l) => l.bookId === id);
};

export const allLoans = (): Loan[] => {
  return loans;
};

export const addLoan = (loan: CreateLoanRequest): Loan => {
  const createdLoan: Loan = {
    id: nextLoanId,
    ...loan,
  };
  loans.push(createdLoan);
  nextLoanId += 1;
  return createdLoan;
};

export const resetAll = (): void => {
  if (users.length > 0) {
    users.splice(0, users.length);
    nextUserId = 1;
  }
  if (books.length > 0) {
    books.splice(0, books.length);
    nextBookId = 1;
  }
  if (loans.length > 0) {
    loans.splice(0, loans.length);
    nextLoanId = 1;
  }
};
