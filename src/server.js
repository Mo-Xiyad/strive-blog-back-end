import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import { join } from "path";

import authorsRouter from "./services/Authors/index.js";
import blogPostsRouter from "./services/Posts/index.js";

import {
  genericErrorHandler,
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
} from "./errorHandlers.js";

import { getPosts, writePosts } from "./lib/fs-tools.js";

const server = express();

// ******************** Global middlewares **********************
const loggeMiddleWare = (req, res, next) => {
  console.log(
    `Req Method ${req.method} --- Req URL ${req.url} -- ${new Date()}`
  );
  next();
};

server.use(loggeMiddleWare);
server.use(cors());
server.use(express.json());

// ************************ ENDPOINTS **********************
const staticFolderPath = join(process.cwd(), "./public");
server.use(express.static(staticFolderPath));

server.use("/authors", authorsRouter);
server.use("/posts", blogPostsRouter);
// ************************ END **********************

// ******************** ERROR MIDDLEWARES **********************
// this error handlers are generic to all the endpoints
server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

// ******************** END ERROR MIDDLEWARES **********************

const port = 3001;

console.table(listEndpoints(server));

server.listen(port, () => {
  console.log("Server running on port:", port);
});
