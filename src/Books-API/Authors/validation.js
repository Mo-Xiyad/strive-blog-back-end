import { body } from "express-validator";

export const authorsValidationMiddlewares = [
  body("name").exists().withMessage("Name is a mandatory field!"),
];
