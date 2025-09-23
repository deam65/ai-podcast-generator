import dotenv from "dotenv";
import app from "./app";
import { PubSubService } from "./services/pubsubService";
import { logger } from "./utils/logger";
import { Subscription } from "@ai-podcast/shared-services";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

const pubsubService = new PubSubService();
let subscription: Subscription | undefined = undefined;

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);

  try {
    subscription = pubsubService.subscribeToTopic();
    logger.info('PubSub subscription initialized successfully');
  } catch (error) {
    logger.error("Failed to initialize Pub/Sub subscription", { error });
    process.exit(1);
  }
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  try {
    // Close Pub/Sub subscription first
    if (subscription) {
      await subscription.close();
      logger.info("Pub/Sub subscription closed");
    }
  } catch (error) {
    logger.error("Error closing Pub/Sub subscription", { error });
  }

  process.exit(0);
};

// Graceful shutdown
process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});
