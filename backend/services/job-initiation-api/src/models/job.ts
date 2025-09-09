export interface Job {
  id: string;
  numArticles: number;
  topics: string[];
  sources: Source[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  sseEndpoint: string;
}

export type Source =
  | "abc-news"
  | "abc-news-au"
  | "al-jazeera-english"
  | "ars-technica"
  | "associated-press"
  | "australian-financial-review"
  | "axios"
  | "bbc-news"
  | "bbc-sport"
  | "bleacher-report"
  | "bloomberg"
  | "breitbart-news"
  | "business-insider"
  | "cbc-news"
  | "cbs-news"
  | "cnn"
  | "engadget"
  | "financial-post"
  | "fortune"
  | "four-four-two"
  | "fox-news"
  | "google-news"
  | "google-news-au"
  | "google-news-ca"
  | "google-news-in"
  | "google-news-uk"
  | "hacker-news"
  | "ign"
  | "independent"
  | "mashable"
  | "medical-news-today"
  | "msnbc"
  | "mtv-news"
  | "mtv-news-uk"
  | "national-geographic"
  | "national-review"
  | "nbc-news"
  | "news24"
  | "new-scientist"
  | "news-com-au"
  | "newsweek"
  | "new-york-magazine"
  | "next-big-future"
  | "politico"
  | "polygon"
  | "recode"
  | "reddit-r-all"
  | "reuters"
  | "rte"
  | "techcrunch"
  | "techradar"
  | "the-american-conservative"
  | "the-globe-and-mail"
  | "the-hill"
  | "the-hindu"
  | "the-huffington-post"
  | "the-irish-times"
  | "the-jerusalem-post"
  | "the-lad-bible"
  | "the-next-web"
  | "the-times-of-india"
  | "the-verge"
  | "the-wall-street-journal"
  | "the-washington-post"
  | "the-washington-times"
  | "time"
  | "usa-today"
  | "vice-news"
  | "wired";

export interface CreateJobRequest {
  numArticles: number;
  topics: string[];
  sources: Source[];
}

export interface CreateJobResponse {
  jobId: string;
  sseEndpoint: string;
  status: string;
  createdAt: string;
}
