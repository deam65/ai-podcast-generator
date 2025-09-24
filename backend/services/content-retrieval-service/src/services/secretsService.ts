import { BaseSecretsService } from "@ai-podcast/shared-services";
import { logger } from "../utils/logger";

export class SecretsService extends BaseSecretsService {
  constructor() {
    super(logger);
  }
}
