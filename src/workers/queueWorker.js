const sendVerifyEmailJob = require("../job/sendVerifyEmailJob");
const forgotPasswordJob = require("../job/forgotPasswordJob");

const QueueService = require("../service/api/queue.service");

const handlers = {
    sendVerifyEmailJob,
    forgotPasswordJob,
};

async function jobProcess(job) {
    const handler = handlers[job.type];

    if (handler) {
        try {
            await QueueService.update(job.id, { status: "processing" });
            await handler(job);
            await QueueService.update(job.id, { status: "completed" });
        } catch (error) {
            await QueueService.update(job.id, { status: "reject" });

            if (job.max_retries < job.retries_count) {
                await QueueService.update(job.id, {
                    status: "failed",
                });
            }
        }
    }
}

async function queueWorker() {
    while (true) {
        const jobs = await QueueService.findPendingJobs();
        // [job.type]

        for (let job of jobs) {
            await jobProcess(job);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

queueWorker();
