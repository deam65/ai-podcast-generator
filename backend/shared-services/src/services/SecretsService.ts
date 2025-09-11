import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Logger } from "../types";
require("dotenv").config();

export class SecretsService {
  private secretsManagerClient: SecretManagerServiceClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;

    try {
      this.secretsManagerClient = new SecretManagerServiceClient({});

      this.logger.info("Secrets manager client successfully initialized");
    } catch (e) {
      this.logger.error("Failed to initialize secrets manager client", { e });
      throw e;
    }
  }

  async fetchSecret(pathname: string): Promise<string | undefined> {
    try {
      const [secretObj] = await this.secretsManagerClient.accessSecretVersion({
        name: pathname + '/versions/latest',
      });

      const secretValue = secretObj.payload?.data?.toString("utf-8");

      this.logger.info("Secret value successfully retrieved", {
        path: pathname
      });

      return secretValue;
    } catch (error) {
      this.logger.error("Failed to retrieve secret", {
        path: pathname,
        error
      });
      throw error;
    }
  }
}
