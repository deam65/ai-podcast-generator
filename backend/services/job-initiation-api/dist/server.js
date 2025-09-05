"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const PORT = process.env.PORT || 3000;
app_1.app.listen(PORT, () => {
    logger_1.logger.info(`Job Initiation API server running on port ${PORT}`);
    logger_1.logger.info(`Health check available at http://localhost:${PORT}/health`);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
//# sourceMappingURL=server.js.map