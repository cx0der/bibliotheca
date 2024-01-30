import app from "./app";

const port: number | string = process.env.PORT || 3000;

app.listen(port, (): void =>
  console.log(`Bibliotheca running on port ${port}`)
);
