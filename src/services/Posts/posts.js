import express, { query } from "express";
import PostModel from "../../db/postSchema.js";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import mongoose from "mongoose";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

import { pipeline } from "stream";
import json2csv from "json2csv";

import { createGzip } from "zlib";
import { getPDFReadableStream, generatePDFAsync } from "../../lib/pdf-tools.js";
import { sendNewPostEmail } from "../../lib/email-tools.js";
import { validationResult } from "express-validator";
import path from "path";
import fs from "fs-extra";

import multer from "multer";
import comments from "../comments/handlers.js";

import { JWTAuthMiddleware } from "../../auth/jwt-Tokens.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { basicAuthMiddleware } from "../../auth/user.js";

const blogPostsRouterDB = express.Router();
/*
q2m translates something like /books?limit=5&sort=-price&offset=15&price<10&category=fantasy into something that could be directly usable by mongo like
{
  criteria: { price: { '$lt': 10 }, category: 'fantasy' },
  options: { sort: { price: -1 }, skip: 15, limit: 5 }
}
*/
// ***************  DOWNLOAD CSV  ***************
blogPostsRouterDB.get(
  "/downloadCSV-authos",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      res.setHeader("Content-Disposition", "attachment; filename=authors.csv");

      const mongoQuery = q2m(req.query);
      const post = await PostModel.find(mongoQuery.criteria);

      const transform = new json2csv.Transform({
        fields: ["author.name", "author.avatar", "author.email"],
      });

      const destination = res;

      pipeline(post, transform, destination, (err) => {
        if (err) next(err);
        console.log(err);
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

blogPostsRouterDB.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    // {{local}}/posts?limit=2&offset=2 URL
    const mongoQuery = q2m(req.query);
    // console.log(mongoQuery);
    const totalPosts = await PostModel.countDocuments(mongoQuery.criteria);

    const post = await PostModel.find(mongoQuery.criteria)
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      .populate({ path: "author", select: "firstName lastName" });
    // populate "path" should be same the FIELD that is in the referenced model
    if (post) {
      res.send({
        links: mongoQuery.links("/posts", totalPosts),
        pageTotal: Math.ceil(totalPosts / mongoQuery.options.limit),
        totalPosts,
        post: post,
      });
    } else {
      next(
        createHttpError(404, `Post with id ${req.params.postId} not found!`)
      );
    }
    // const allPosts = await PostModel.find(
    // {},
    // { createdAt: 0, updatedAt: 0, __v: 0 }
    // );
    // const count = await PostModel.countDocuments();

    // skip = (page number - 1) * limit
    // res.status(200).send({ count: count, posts: allPosts });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogPostsRouterDB.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body); // here happens validation of req.body, if it is not ok Mongoose will throw a "ValidationError" (btw user is still not saved in db yet)
    const { _id } = await newPost.save(); // this is the line in which the interaction with the db happens

    res.status(201).send({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogPostsRouterDB.get("/:postId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const id = req.params.postId;
    const post = await PostModel.findById(id, {
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    });
    if (post) {
      res.send(post);
    } else {
      next(createHttpError(404, `Post with id ${id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogPostsRouterDB.put("/:postId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const id = req.params.postId;
    const updatePost = await PostModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (updatePost) {
      res.send(updatePost);
    } else {
      next(createHttpError(404, `Post with id ${id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

blogPostsRouterDB.delete(
  "/:postId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.postId;
      const deletePost = await PostModel.findByIdAndDelete(id);
      if (deletePost) {
        res.status(204).send();
      } else {
        next(createHttpError(404, `User with id ${id} not found!`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// upload image
// POST PICTURS
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary, // CREDENTIALS, this line of code is going to search in your process.env for something called CLOUDINARY_URL
  params: {
    folder: "strive-blog",
  },
});
blogPostsRouterDB.put(
  "/:postId/uploadImage",
  multer({ storage: cloudinaryStorage }).single("cover"),
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const imgUrl = req.file.path;
      console.log(req.file);
      const id = req.params.postId;
      const updatePost = await PostModel.findByIdAndUpdate(
        id,
        { $set: { cover: imgUrl } },
        {
          new: true,
        }
      );
      res.send(updatePost);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

blogPostsRouterDB.put(
  "/:postId/likes",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.postId;
      const post = await PostModel.findById(id);
      if (post) {
        const liked = await PostModel.findOne({
          _id: id,
          likes: new mongoose.Types.ObjectId(req.body.userId),
        });
        if (!liked) {
          await PostModel.findByIdAndUpdate(
            id,
            { $push: { likes: req.body.userId } },
            { new: true }
          );
        } else {
          await PostModel.findByIdAndUpdate(
            id,
            { $pull: { likes: req.body.userId } },
            { new: true }
          );
        }
      } else {
        next(createHttpError(404, `User with id ${id} not found!`));
      }
      res.send(post);
    } catch (error) {}
  }
);

blogPostsRouterDB
  .route("/:postId/comments", JWTAuthMiddleware)
  .get(comments.getComments)
  .post(comments.createComments);

blogPostsRouterDB
  .route("/:postId/comments/:commentId")
  .get(JWTAuthMiddleware, comments.getCommentsById)
  .put(JWTAuthMiddleware, comments.updateCommentsById)
  .delete(JWTAuthMiddleware, comments.deleteCommentsById);

export default blogPostsRouterDB;
