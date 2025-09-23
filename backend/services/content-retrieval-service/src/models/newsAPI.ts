export type Category = 
  | 'business' 
  | 'entertainment' 
  | 'general' 
  | 'health' 
  | 'science' 
  | 'sports' 
  | 'technology'

export interface Article {
  source: {
    id: string,
    name: string
  },
  author: string,
  title: string,
  description: string,
  url: string,
  urlToImage: string,
  publishedAt: string,
  content: string,
}

export interface NewsAPIResponse {
  status: 'ok',
  totalResults: number,
  articles: Article[],
}

export interface NewsAPIError {
  status: 'error',
  code: number,
  message: string,
}