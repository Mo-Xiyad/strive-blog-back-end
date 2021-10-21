# m5-file-updates

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
