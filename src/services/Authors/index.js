import express, { json } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import uniqid from "uniqid";

import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { authorsValidationMiddlewares } from "./validation.js";

const authorsRouter = express.Router();

// file path of JSON
const authorJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
);

// getting all the authors as an array
const getAuthors = () => JSON.parse(fs.readFileSync(authorJSONPath));

// Writing to the JSON
const writeAuthors = (content) =>
  fs.writeFileSync(authorJSONPath, JSON.stringify(content));

const anotherLoggerMiddleware = (req, res, next) => {
  console.log(`Another thing -- ${new Date()}`);
  next();
};

// 1.
authorsRouter.post("/", authorsValidationMiddlewares, (req, res, next) => {
  try {
    const errorsList = validationResult(req);

    if (!errorsList.isEmpty) {
      next(createHttpError(400, { errorsList }));
    } else {
      const newAuthor = { ...req.body, id: uniqid(), createdAt: new Date() };
      const authors = getAuthors();

      authors.push(newAuthor);

      writeAuthors(authors);

      res.status(201).send({ id: newAuthor.id });
    }
  } catch (error) {
    next(error);
  }
});

// 2.
authorsRouter.get("/", anotherLoggerMiddleware, (req, res, next) => {
  try {
    const authors = getAuthors();
    if (req.query && req.query.name) {
      const filteAuthors = authors.filtter((a) => a.name === req.query.name);
      res.send(filteAuthors);
    } else {
      res.send(authors);
    }
  } catch (error) {
    next(error);
  }
});

// 3.
authorsRouter.get("/:authorId", (req, res, next) => {
  try {
    const authours = getAuthors();
    const author = authours.find((a) => a.id === req.params.authorId);
    if (author) {
      // If author is found we send back 200 with the Author

      res.send(author);
    } else {
      // If the author is not found we need to trigger (somehow) the notFoundHandler
      // const err = new Error("Not found error")
      // err.status = 404
      // next(err)

      next(createHttpError(404, `Author with id ${req.params.authorId}`));
    }
  } catch (error) {
    // Errors that happen here need to be 500 errors (Generic Server Error)

    next(error); // If we want to send an error to error handlers I have to use the next function and the error as a parameter
  }
});

// 4.
authorsRouter.put("/:authorId", (req, res, next) => {
  try {
    const authors = getAuthors();

    const index = authors.findIndex((a) => a.id === req.params.authorId);

    const authorToModify = authors[index];

    const updatedFields = req.body;

    const updatedAuthor = { ...authorToModify, ...updatedFields };

    authors[index] = updatedAuthor;

    writeAuthors(authors);

    res.send(updatedAuthor);
  } catch (error) {
    next(error);
  }
});

// 5.
authorsRouter.delete("/:authorId", (req, res, next) => {
  try {
    const authors = getAuthors();

    const remainingAuthors = authors.filter(
      (a) => a.id !== req.params.authorId
    );

    writeAuthors(remainingAuthors);

    res.status(200).send(remainingAuthors);
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;

// {
//       "name": "{{$randomFirstName}}",
//      "surname": "{{$randomLastName}}",
//      "email": "{{$randomEmail}}",
//      "DOB": "{{$randomDatePast}}",
//      "avatar": "{{$randomImageUrl}}"
// }
