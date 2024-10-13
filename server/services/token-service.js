const jwt = require('jsonwebtoken');
const {prisma} = require("../prisma/prisma-client");


class TokenService {
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES});
        return {accessToken, refreshToken}
    }

    validateAccessToken(token){
        try{
            return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET)
        }catch(err){
            return null
        }
    }
    validateRefreshToken(token){
        try{
            return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET)
        }catch(err){
            return null
        }
    }


    async saveToken(userId, refreshToken){
        const tokenData = await prisma.token.findFirst({where: {userId}})
        if(tokenData){
            return prisma.token.update({
                where: {id: tokenData.id},
                data: {refreshToken},
            });
        }

        return prisma.token.create({
            data: {
                refreshToken,
                userId,
            }
        });
    }

    async removeToken(refreshToken){
        return prisma.token.delete({where: {refreshToken: refreshToken}});
    }

    async findToken(refreshToken){
        return prisma.token.findFirst({where: {refreshToken}});
    }

}

module.exports = new TokenService();
