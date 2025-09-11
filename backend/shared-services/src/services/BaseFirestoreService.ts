import { Firestore, Timestamp } from "@google-cloud/firestore";
import { BaseEntity, FirestoreDocument, Logger } from "../types";
require("dotenv").config();

export abstract class BaseFirestoreService<T extends BaseEntity> {
  protected firestore: Firestore;
  protected collectionName: string;
  protected logger: Logger;

  constructor(collectionName: string, logger: Logger) {
    this.collectionName = collectionName;
    this.logger = logger;

    try {
      this.firestore = new Firestore({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      });

      this.logger.info("BaseFirestoreService initialized", {
        collectionName: this.collectionName,
      });
    } catch (e) {
      this.logger.error("Firestore failed to initialize", e);
      throw new Error("Firestore initialization failed");
    }
  }

  // Abstract methods that must be implemented by subclasses
  protected abstract transformToFirestore(entity: T): FirestoreDocument;
  protected abstract transformFromFirestore(doc: FirestoreDocument): T;

  async create(entity: T): Promise<T> {
    try {
      const firestoreDoc = this.transformToFirestore(entity);

      await this.firestore
        .collection(this.collectionName)
        .doc(entity.id)
        .set(firestoreDoc);

      this.logger.info("Entity created in Firestore", { 
        entityId: entity.id,
        collection: this.collectionName 
      });
      return entity;
    } catch (error) {
      this.logger.error("Failed to create entity in Firestore", {
        entityId: entity.id,
        collection: this.collectionName,
        error,
      });
      throw new Error(`Failed to create entity: ${error}`);
    }
  }

  async get(id: string): Promise<T | null> {
    try {
      const doc = await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .get();

      if (!doc.exists) {
        this.logger.info("Entity not found in Firestore", { 
          entityId: id,
          collection: this.collectionName 
        });
        return null;
      }

      const data = doc.data();

      if (!data) {
        this.logger.warn("Entity document exists but has no data", { 
          entityId: id,
          collection: this.collectionName 
        });
        return null;
      }

      const firestoreDoc: FirestoreDocument = {
        id: data.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...data
      };

      const entity = this.transformFromFirestore(firestoreDoc);

      this.logger.info("Entity retrieved successfully from Firestore", { 
        entityId: id,
        collection: this.collectionName 
      });
      return entity;
    } catch (error) {
      this.logger.error("Failed to get entity from Firestore", { 
        entityId: id,
        collection: this.collectionName,
        error 
      });
      throw new Error(`Failed to get entity: ${error}`);
    }
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .update(updateData);

      this.logger.info("Entity updated in Firestore", { 
        entityId: id,
        collection: this.collectionName,
        updates: Object.keys(updates)
      });
    } catch (error) {
      this.logger.error("Failed to update entity in Firestore", {
        entityId: id,
        collection: this.collectionName,
        error,
      });
      throw new Error(`Failed to update entity: ${error}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<void> {
    try {
      await this.firestore.collection(this.collectionName).doc(id).update({
        status: status,
        updatedAt: Timestamp.now(),
      });

      this.logger.info("Entity status updated in Firestore", { 
        entityId: id,
        collection: this.collectionName,
        status 
      });
    } catch (error) {
      this.logger.error("Failed to update entity status in Firestore", {
        entityId: id,
        collection: this.collectionName,
        status,
        error,
      });
      throw new Error(`Failed to update entity status: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .delete();

      this.logger.info("Entity deleted from Firestore", { 
        entityId: id,
        collection: this.collectionName 
      });
    } catch (error) {
      this.logger.error("Failed to delete entity from Firestore", {
        entityId: id,
        collection: this.collectionName,
        error,
      });
      throw new Error(`Failed to delete entity: ${error}`);
    }
  }
}
