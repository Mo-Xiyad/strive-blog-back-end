# m5-file-updates

### Front-End for this project is in Repo named ---> "m5-middleware-front-end"

#### Starting Commands

- `npm init -y --> start the project`
- `npm i express --> isntall Express.js`
- `npm i -D nodemon@2.0.7 --> isntall Nodemon only for the development (i -D)`
- `npm i cors ---> need it so setup middlewares `

###### packages needed for creating and functional Api

- `npm i uniqid --> isntall uniqid to generate unique ID for the objs`
- `npm i express-list-endpoints --> isntall to print you endpoints`
- `npm i http-errors ----> need this package for working with errors`
- `npm i express-validator ----> need this package to validate the data that comes from the user`
- `npm i fs-extra ----> this package helps to use some extra methods for reading and writing JSON files ------WORKING WITH FILES GREAT------`
- `npm i multer ---> this package is used for uploading pictures ---- methods like single and multiple media files`
- `npm i validator ----> for my own custom validation` <a href="https://github.com/validatorjs/validator.js#validators"> Check out the docs <strong> Validation</strong> </a>

##### setup Package.json

- `"type": "module",`
- `"dev": "nodemon -e js ./src/server.js"`

###### Run the app

`npm run dev`

## before Deploying to the cloud

<strong>Packages</strong>

- `npm i dotenv`
- `npm i cloudinary` --> this package is to store the static files (pictures..)
- `npm i multer-storage-cloudinary` --> This package is needs to be installed inorder to uplaod the files to the cloud

<strong>Env Variables </strong>

- create .evn file and set '`FE_LOCAL_URL = http://localhost:3000`' this variable is port where the app will be running locally `only for the Front-end app (React app)`
- Next set another varibale called `FE_PROD_URL=https://${front-end-app}.vercel.app` this varibaleis going to contain the application web production web `URL` the link will be avalable one the application is hoset on the cloud
- Very important set varibale for `CLOUDINARY_URL=${in here the token form the CLOUDINARY website}`
- `PORT=3001`

## On the Cloud

- `https://heroku.com/`

Setting --> Configs Vars -->

- `CLOUDINARY_URL = {in here the token form the CLOUDINARY website}`
- `FE_LOCAL_URL = http://localhost:3000`
- `FE_PROD_URL=https://${front-end-app}.vercel.app`
