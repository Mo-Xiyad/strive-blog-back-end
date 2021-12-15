import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import UserModel from "../services/users/schema.js";

export const JWTAuthenticate = async (user) => {
  // 1. given the user generates tokens (access and refresh)
  const accessToken = await generateJWTToken({ _id: user._id });
  const refreshToken = await generateRefreshToken({ _id: user._id });

  // 2. refresh token should be saved in db
  user.refreshToken = refreshToken;
  await user.save();

  // 3. return both the tokens
  return { accessToken, refreshToken };
};

const generateJWTToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

const generateRefreshToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

export const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    })
  );

const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) rej(err);
      else res(decodedToken);
    })
  );

// generateJWTToken({ _id: "oasjidoasjdosaij" })
//   .then(token => console.log(token))
//   .catch(err => console.log(err))

// const token = await generateJWTToken({})

// const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" })

export const verifyRefreshAndGenerateTokens = async (currentRefreshToken) => {
  // 1. check the validity of current refresh token (exp date and integrity)
  const decodedRefreshToken = await verifyRefreshToken(currentRefreshToken);

  // 2. if token is valid we are going to check if it is the same in our db
  const user = await UserModel.findById(decodedRefreshToken._id);

  if (!user) throw new createHttpError(404, "User not found!");

  if (user.refreshToken && user.refreshToken === currentRefreshToken) {
    // 3. if everything is fine we are going to generate a new pair of tokens
    const { accessToken, refreshToken } = await JWTAuthenticate(user);

    // 4. return tokens
    return { accessToken, refreshToken };
  } else {
    throw new createHttpError(401, "Token not valid!");
  }
};

/* FE EXAMPLE
await fetch("/whateverResource", {headers: {Authorization: accessToken}})
  if(401) {
    const {newAccessToken, newRefreshToken} = await fetch("/users/refreshToken", {method: "POST", body: {currentRefreshToken: "uih1ih3i21h3iuh21iu3hiu21"}})
    localStorage.setItem("accessToken", newAccessToken)
    localStorage.setItem("refreshToken", refreshToken)
    await fetch("/whateverResource", {headers: {Authorization: newAccessToken}})
  }
  */
