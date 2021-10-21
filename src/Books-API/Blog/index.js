import express, { query } from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import { blogPostsValidationMiddlewares } from "./validation.js";

const blogPostsRouter = express.Router();

// JSON file path

const blogPostsJSONpath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const getPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONpath));

const writePosts = (content) =>
  fs.writeFileSync(blogPostsJSONpath, JSON.stringify(content));

// 1.
blogPostsRouter.get("/", (req, res, next) => {
  try {
    const posts = getPosts();
    if ((req, query && req.query.title)) {
      //
      const filterPosts = posts.filter((p) => p.title === req.query.title);
      //
      res.status(200).send(filterPosts);
      //
    } else {
      //
      res.status(200).send(posts);
    }
  } catch (error) {
    next(error);
  }
});

// 2.
blogPostsRouter.get("/:postId", (req, res, next) => {
  try {
    const posts = getPosts();
    const post = posts.find((p) => p._id === req.params.postId);

    if (post) {
      res.status(200).send(post);
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} does not exist`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// 3.
blogPostsRouter.post("/", blogPostsValidationMiddlewares, (req, res, next) => {
  const errorList = validationResult(req);
  try {
    if (!errorList.isEmpty) {
      next(createHttpError(400, { errorList }));
    } else {
      const newPost = { id: uniqid(), ...req.body, createdAt: new Date() };

      const posts = getPosts();

      posts.push(newPost);

      writePosts(posts);

      res.status(200).send({ _id: newPost._id });
    }
  } catch (error) {
    next(error);
  }
});

// 4.
blogPostsRouter.put("/:postId", (req, res, next) => {
  try {
    const posts = getPosts();

    const index = posts.findIndex((p) => p._id === req.params.postId);

    const postToEdit = posts[index];

    const editedFiled = req.body;

    const update = { ...postToEdit, ...editedFiled };

    posts[index] = update;

    writePosts(posts);

    res.status(200).send(update);
    //
  } catch (error) {
    //
    next(error);
  }
});

// 5.
blogPostsRouter.delete("/:postId", (req, res, next) => {
  try {
    const posts = getPosts();

    const remainingPosts = posts.filter((p) => p._id !== req.params.postId);

    writePosts(remainingPosts);

    res.status(200).send(remainingPosts);
    //
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;
