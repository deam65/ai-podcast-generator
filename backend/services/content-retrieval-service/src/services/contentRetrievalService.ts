import { Content, ContentRetrievalJob } from "../models/contentRetrieval";
import { FirestoreService } from "./firestoreService";
import { NewsAPIService } from "./newsAPIService";
import { PubSubService } from "./pubsubService";
import { logger } from "../utils/logger";
import { Article, Category } from "../models/newsAPI";
import { buildLLMSummaryJob } from "../utils/messageBuilders";
require("dotenv").config();

export class ContentRetrievalService {
  private firestoreService: FirestoreService;
  private newsApiService: NewsAPIService;

  constructor() {
    try {
      this.firestoreService = new FirestoreService();
      this.newsApiService = new NewsAPIService();

      logger.info("Content retrieval service initialized successfully", {
        firestoreService: this.firestoreService,
        newsApiService: this.newsApiService,
      });
    } catch (e) {
      logger.error("Failed to initialize a service", e);
      throw e;
    }
  }

  async processJob(job: ContentRetrievalJob) {
    const categories: Category[] = job.categories;

    for (const category of categories) {
      try {
        const articles = await this.fetchArticlesForCategory(job, category);
        await this.forwardContentToLLMService(job, {
          category: category,
          articles: articles,
        });
      } catch (error) {
        logger.error("Failed to fetch articles/publish content to topic", {
          job,
          category: category,
          error,
        });
        throw error;
      }
    }
  }

  async fetchArticlesForCategory(
    job: ContentRetrievalJob,
    category: Category
  ): Promise<Article[]> {
    try {
      const articles: Article[] = await this.newsApiService.fetchArticles(
        category,
        "en"
      );

      logger.info("Successfully retrieved articles", {
        category: category,
        articles: articles,
      });

      return articles;
    } catch (error) {
      logger.error("Failed to fetch articles for job", {
        job,
        category: category,
        error,
      });
      throw error;
    }
  }

  //MAYBE: scrapeAndCacheContent(job: ContentRetrievalJob, articles: Article[]) {}

  async forwardContentToLLMService(job: ContentRetrievalJob, content: Content): Promise<void> {
    try {
      const pubsubService = new PubSubService();
      
      // Use message builder utility to create LLM summary job payload
      const llmSummaryJob = buildLLMSummaryJob(job, content);

      await pubsubService.publishToLLMSummaryTopic(llmSummaryJob, content);

      logger.info("Content forwarded to LLM service", {
        jobId: job.id,
        category: content.category,
        articlesCount: content.articles.length
      });
    } catch (error) {
      logger.error("Failed to forward content to LLM service", {
        jobId: job.id,
        category: content.category,
        error
      });
      throw error;
    }
  }
}
