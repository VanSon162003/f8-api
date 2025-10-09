const { where } = require("sequelize");
const { Queue, Topic } = require("../db/models");

class QueueService {
    async findPendingJobs(data) {
        const queue = await Queue.findAll({
            where: {
                status: "pending",
            },
        });
        return queue;
    }

    async create(data) {
        const queue = await Queue.create(data);
        return queue;
    }

    async update(id, data) {
        await Queue.update(data, {
            where: { id },
        });
    }

    async remove(id) {
        await Queue.destroy({
            where: { id },
        });

        return null;
    }
}

module.exports = new QueueService();
