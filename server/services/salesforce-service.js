const jsforce = require("jsforce");
const {prisma} = require("../prisma/prisma-client");
const ApiError = require("../exceptions/api-errors");
const ErrorCodes = require("../config/error-codes");
const usersService = require("../services/users-service")


class SalesforceService {
    async authorize() {
        const conn = new jsforce.Connection();
        await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD + process.env.SF_TOKEN)
        return conn
    }

    async createAccount(conn, name){
        return await conn.sobject("Account").create({Name: name});
    }

    async getInfoByUserId(conn, userId){
        const user = await prisma.user.findFirst({where: {id: userId}})

        if(!user){
            throw ApiError.BadRequest(
                `User with id ${userId} not found`,
                ErrorCodes.UserNotExist
            )
        }


        if(!user.salesforceAccountId){
            throw ApiError.BadRequest(
                `No Salesforce account related to user with id ${userId}`,
                ErrorCodes.UserNotExist
            )
        }

        console.log(userId, user.salesforceAccountId)

        const response = await conn.sobject("Contact").find(
            {AccountId: user.salesforceAccountId},
            {
                Id: true,
                FirstName: true,
                LastName: true,
                Email: true,
                Birthdate: true,
                MobilePhone: true,
                AccountId: true
            }
        )

        if(response.length === 0){
            // await usersService.addSalesforceAccountId(userId, null)
            throw ApiError.BadRequest(
                `No Salesforce account related to user with id ${userId}`,
                ErrorCodes.ValidationFailed
            )
        }



        return response[0]
    }

    async createContact(conn, accountId, {firstname, lastname, email, dob, gender, phone}) {
        try{
            return await conn.sobject("Contact").create({
                FirstName: firstname,
                LastName: lastname,
                Email: email,
                Birthdate: dob,
                MobilePhone: phone,
                AccountId: accountId
            });
        }catch (err){
            await this.deleteAccount(accountId)
            if(err.data.errorCode === 'DUPLICATES_DETECTED'){
                throw ApiError.BadRequest(
                    `Salesforce contact with email ${email} already exist`,
                    ErrorCodes.UserAlreadyExist
                )
            }
            throw err
        }

    }

    async updateContact(conn, id, {firstname, lastname, email, dob, phone}){
        return await conn.sobject("Contact").update({
            Id: id,
            FirstName: firstname,
            LastName: lastname,
            Email: email,
            Birthdate: dob,
            MobilePhone: phone
        });
    }

    async updateAccount(conn, id, name){
        return await conn.sobject("Account").update({
            Id: id,
            Name: name
        })
    }

    async deleteAccount(accountId){
        const conn = await this.authorize()
        return await conn.sobject("Account").delete(accountId)
    }

    async deleteAccounts(accountIds){
        const conn = await this.authorize()
        return await conn.sobject("Account").delete(accountIds)
    }
}

module.exports = new SalesforceService();
