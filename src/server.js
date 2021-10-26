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

// ******************** CORS SETUP FOR CLOUD HOSTING **********************

const whitelist = [process.env.FE_LOCAL_URL, process.env.FE_PROD_URL];

const corsOptions = {
  origin: function (origin, next) {
    console.log("CURRENT ORIGIN AT:", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      next(null, true);
    } else {
      next(new Error("CORS ERROR"));
    }
  },
};

server.use(cors(corsOptions));
server.use(loggeMiddleWare);
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

// this port is coming from the evn file from local dev machine
const port = process.env.PORT;

console.table(listEndpoints(server));

server.listen(port, () => {
  console.log("Server running on port:", port);
});
