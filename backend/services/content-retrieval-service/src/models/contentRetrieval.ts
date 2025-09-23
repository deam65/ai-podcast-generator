import { Article, Category } from "./newsAPI";

export interface ContentRetrievalJob {
  id: string;
  categories: Category[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  sseEndpoint: string;
}

export interface Content {
  category: string,
  articles: Article[]
}

export interface CategorizedContent {

}