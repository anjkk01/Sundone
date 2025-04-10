const { Queue, Worker } = require('bullmq');
// const { redisClient } = require('./redisClient'); // Import Redis client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize Queue
const storyExpirationQueue = new Queue('story-expiration', {
  connection: {
    host: '127.0.0.1',
    port: '6379'
  }, // Use the Redis client
});

// Worker to Process Story Expiration Jobs
const worker = new Worker(
  'story-expiration', // Worker name (must match the queue name)
  async (job) => {
    try {
      await prisma.stories.delete({
        where:{story_id:job.data.storyId}
      });

      console.log(`Processing job ${job.id} with data:`, job.data);


      console.log(`✅ Job ${job.id} completed successfully.`);


    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error);
      throw error; // Re-throw the error to mark the job as failed
    }
  },
  {
    connection: {
      host: '127.0.0.1',
      port: '6379'
    }, // Use the Redis client
  }
);

// Event Listeners for the Worker
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error.message);
});

// Graceful Shutdown
async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  await worker.close(); // Close the worker
  await storyExpirationQueue.close(); // Close the queue
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown); 
process.on('SIGINT', gracefulShutdown);

// Export the Queue for use in other files
module.exports = { storyExpirationQueue };