import { Timestamp } from "@google-cloud/firestore";

// Base interface for all entities that can be stored in Firestore
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Firestore document representation
export interface FirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  [key: string]: any;
}

// Logger interface to ensure consistent logging across services
export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// PubSub message attributes
export interface MessageAttributes {
  [key: string]: string;
}

// PubSub message payload
export interface MessagePayload {
  [key: string]: any;
}
