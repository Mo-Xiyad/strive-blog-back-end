import express, { query } from "express";
import path from "path";
// import express from "express";

import createHttpError from "http-errors";
import uniqid from "uniqid";
import multer from "multer";

import {
  getPosts,
  writePosts,
  saveBlogPostsPictures,
} from "../../lib/fs-tools.js";

import { validationResult } from "express-validator";
import { blogPostsValidationMiddlewares } from "./validation.js";

const blogPostsRouter = express.Router();

// 1.
blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await getPosts();
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
blogPostsRouter.get("/:postId", async (req, res, next) => {
  try {
    const posts = await getPosts();
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
blogPostsRouter.post(
  "/",
  blogPostsValidationMiddlewares,
  async (req, res, next) => {
    const errorList = validationResult(req);
    try {
      if (!errorList.isEmpty) {
        next(createHttpError(400, { errorList }));
      } else {
        const newPost = { _id: uniqid(), ...req.body, createdAt: new Date() };

        const posts = await getPosts();
        console.log();
        posts.push(newPost);

        await writePosts(posts);

        res.status(200).send({ _id: newPost._id });
      }
    } catch (error) {
      next(error);
    }
  }
);

// 4.
blogPostsRouter.put("/:postId", async (req, res, next) => {
  try {
    const posts = await getPosts();

    const index = posts.findIndex((p) => p._id === req.params.postId);

    const postToEdit = posts[index];

    const editedFiled = req.body;

    const update = { ...postToEdit, ...editedFiled };

    posts[index] = update;

    await writePosts(posts);

    res.status(200).send(update);
    //
  } catch (error) {
    //
    next(error);
  }
});

// 5.
blogPostsRouter.delete("/:postId", async (req, res, next) => {
  try {
    const posts = await getPosts();

    const remainingPosts = posts.filter((p) => p._id !== req.params.postId);

    await writePosts(remainingPosts);

    res.status(200).send(remainingPosts);
    //
  } catch (error) {
    next(error);
  }
});

//

// ***************  COMMENTS SECTION  ***************

// 1. POST COMMENTS
blogPostsRouter.post(
  "/:postId/comments",
  blogPostsValidationMiddlewares,
  async (req, res, next) => {
    const errorList = validationResult(req);
    try {
      const posts = await getPosts();

      const index = posts.findIndex((p) => p._id === req.params.postId);

      if (index !== -1) {
        posts[index].comments.push({
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        });
        await writePosts(posts);
        res.send(posts[index].comments);
      } else {
        res.status(404).send(errorList);
        console.log(errorList);
      }
    } catch (error) {
      next(error);
    }
  }
);

// 2. GET COMMENTS
blogPostsRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const posts = await getPosts();
    console.log(posts);
    const post = posts.find((p) => p._id === req.params.postId);
    if (req.params.postId) {
      console.log(req.params.postId);
      res.status(200).send(post);
    } else {
      res.status(404).send(`post with ${req.params.postId} does not exist`);
    }
  } catch (error) {
    next(error);
  }
});
// ***************  END COMMENTS  ***************

// ***************  IMAGE UPLOAD  ***************

// POST PICTURS
blogPostsRouter.post(
  "/:postId/blogPostCover",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      const extention = path.extname(req.file.originalname);

      if (req.file) {
        await saveBlogPostsPictures(
          req.params.postId + extention,
          req.file.buffer
        );

        const converUrl = `http://localhost:3001/img/posts/${req.params.postId}${extention}`;

        const posts = await getPosts();

        const post = posts.find((p) => p._id === req.params.postId);

        post.cover = converUrl;

        const postArray = posts.filter((p) => p._id !== req.params.postId);

        postArray.push(post);

        await writePosts(postArray);
        res.send(post);
      } else {
        console.log(req.file.buffer);
      }
    } catch (error) {
      console.log(req.file);
      next(error);
    }
  }
);

// ***************  END IMAGE UPLOAD  ***************

export default blogPostsRouter;
