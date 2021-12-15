import express from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { authorsValidationMiddleware } from "./validation.js";
import UserModel from "../../db/usersSchema.js";
import { adminOnlyMiddleware } from "../../auth/admin.js";
import { basicAuthMiddleware } from "../../auth/user.js"; // this is being replaced with JWT authentication middleware
import { JWTAuthMiddleware } from "../../auth/jwt-Tokens.js";
import {
  JWTAuthenticate,
  verifyRefreshAndGenerateTokens,
} from "../../auth/jwtTools.js";

const usersRouterDB = express.Router();

const anotherLoggerMiddleware = (req, res, next) => {
  console.log(`Another thing -- ${new Date()}`);
  next();
};

// 1.
usersRouterDB.post("/", authorsValidationMiddleware, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);

    if (!errorsList.isEmpty) {
      next(createHttpError(400, { errorsList }));
    } else {
      const newUser = new UserModel(req.body);
      const { _id } = await newUser.save();
      res.status(201).send({ _id });
    }
  } catch (error) {
    console.log(error);
    next(createHttpError(400, { errorsList }));
  }
});

// 2.
usersRouterDB.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    next(createHttpError(400));
  }
});

usersRouterDB.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

// 3.
usersRouterDB.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId, {
      __v: 0, //this second parameter is projecting what not to show
    });
    if (user) {
      res.send(user);
    } else {
      next(
        createHttpError(
          404,
          "Please provide credentials in the Authorization header!"
        )
      );
    }
  } catch (error) {
    next(
      createHttpError(
        404,
        `User with id ${req.params.userId} not found or not allowed to access!`
      )
    );
    // Errors that happen here need to be 500 errors (Generic Server Error)
  }
});

usersRouterDB.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    // const { name, surname, email, password, avatar, role } = req.user;
    // const obj = {
    //   name: name,
    //   surname: surname,
    //   email: email,
    //   password: password,
    //   avatar: avatar,
    //   role: role,
    // };
    // req.user = { ...req.user, ...req.body };

    // +++++++++++++++++++++++++++++++++++++++++++++++++

    /* const updateInfo = Object.entries(req.body);
    updateInfo.forEach(([key, value]) => {
      req.user[key] = value;
    });
    const userUpdated = await req.user.save();
    res.send(userUpdated); */

    // +++++++++++++++++++++++++++++++++++++++++++++++++
    const id = req.user._id.toString();
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.send(updatedUser);
    } else {
      const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.send(updatedUser);
    }

    // +++++++++++++++++++++++++++++++++++++++++++++++++
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// 4.
usersRouterDB.put(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.userId;
      const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (updatedUser) {
        res.send(updatedUser);
      } else {
        next(
          createHttpError(
            404,
            `User with id ${req.params.userId} not found! Or has no permission!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouterDB.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await req.user.deleteOne();
    res.status(204).send();
  } catch (error) {
    next(createHttpError(404, `User with id ${req.params.userId} not found!`));
  }
});

usersRouterDB.delete(
  "/:userId",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const id = req.params.userId;
      const deleteUsersById = await UserModel.findByIdAndDelete(id);
      if (deleteUsersById) {
        res.status(204).send();
      } else {
        next(
          createHttpError(404, `User with id ${req.params.userId} not found!`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouterDB.post("/login", async (req, res, next) => {
  try {
    // 1. Get credentials from req.body
    const { email, password } = req.body;

    // 2. Verify credentials
    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      // console.log(user);
      // console.log(password);
      // 3. If credentials are fine we are going to generate an access token
      const { accessToken, refreshToken } = await JWTAuthenticate(user);
      res.send({ accessToken, refreshToken });
    } else {
      // 4. If they are not --> error (401)
      next(createHttpError(401, "Credentials not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouterDB.post("/refreshToken", async (req, res, next) => {
  try {
    // 1. Receive the current refresh token from req.body
    const { currentRefreshToken } = req.body;

    // 2. Check the validity of that (check if it is not expired, check if it hasn't been compromised, check if it is in db)
    const { accessToken, refreshToken } = await verifyRefreshAndGenerateTokens(
      currentRefreshToken
    );

    // 3. If everything is fine --> generate a new pair of tokens (accessToken and refreshToken)

    // 4. Send tokens back as a response
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

export default usersRouterDB;
