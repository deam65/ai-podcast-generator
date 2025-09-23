import { SecretsService } from "./secretsService";
import { logger } from "../utils/logger";
// import { FirestoreService } from "./firestoreService";
import { NewsAPIResponse, Article } from "../models/newsAPI";
import axios from "axios";

export class NewsAPIService {
  private logger = logger;

  private secretsService: SecretsService;
  private newsAPIKeySecretsPath: string;

  // private firestoreService: FirestoreService;

  constructor() {
    try {
      this.secretsService = new SecretsService();
      this.newsAPIKeySecretsPath =
        process.env.SECRETS_MANAGER_NEWSAPI_APIKEY_PATH || "none";

      // this.firestoreService = new FirestoreService();
    } catch (e) {
      logger.error("Failed to initialize secretsService", { e });
      throw e;
    }
  }

  async fetchArticles(
    category: string = "general",
    language: string = "en"
  ): Promise<Article[]> {
    try {
      const newsAPIKey = await this.secretsService.fetchSecret(
        this.newsAPIKeySecretsPath
      );

      const categoryURLParam = "category=" + category;
      const languageURLParam = "language=" + language;

      const axiosResponse = await axios.get(
        `https://newsapi.org/v2/top-headlines?` +
          categoryURLParam +
          "&" +
          languageURLParam,
        {
          headers: {
            "X-Api-Key": newsAPIKey,
          },
        }
      );

      const newsAPIResponse: NewsAPIResponse = axiosResponse.data;
      this.logger.info("Retrieved articles from NewsAPI", newsAPIResponse);

      return newsAPIResponse.articles;
    } catch (error) {
      this.logger.error("", error);
      throw new Error(`Failed to retrieve articles from NewsAPI.org: ${error}`);
    }
  }
}
