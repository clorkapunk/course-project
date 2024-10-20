const {prisma} = require("../prisma/prisma-client");


class TopicsService {

    async getAll() {
        return prisma.topic.findMany()
    }

}

module.exports = new TopicsService();
