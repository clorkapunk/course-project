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

app.get('/history', async (req, res, next) => {
    // const {page, adminId, userId} = req.query;
    const limit = 20
    const page = parseInt(req.query.page)

    const total = await prisma.adminHistory.count()

    const history = await prisma.adminHistory.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          id: 'desc'
        },
        relationLoadStrategy: 'join',
        select: {
            id: true,
            initiator: {
                select: {
                    id: true,
                    username: true,
                    isActive: true,
                    email: true,
                    role: true
                }
            },
            victim: {
                select: {
                    id: true,
                    username: true,
                    isActive: true,
                    email: true,
                    role: true
                }
            },
            action_type: true,
            new_value: true,
            createdAt: true
        }
    })

    return res.json({
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        data: history
    })
})

app.use(authMiddleware)
app.use('/api', require('./routes/users-route'));

app.use(errorMiddleware)



module.exports = app;
