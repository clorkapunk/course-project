const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const errorMiddleware = require('./middlewares/error-middleware')
const authMiddleware = require('./middlewares/auth-middleware')
const {prisma} = require("./prisma/prisma-client");
require('dotenv').config()


const app = express();

app.use(logger('dev'));
app.use(cookieParser())
app.use(cors({
    origin: [
        process.env.CLIENT_URL
        // "http://localhost:5173",
        // "http://localhost:4173",
        // "http://127.0.0.1:5173"
    ],
    credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/', require('./routes/auth-route'));
app.use('/oauth', require('./routes/oauth-route'));

app.use(authMiddleware)
app.use('/api', require('./routes/users-route'));

app.use(errorMiddleware)



module.exports = app;
