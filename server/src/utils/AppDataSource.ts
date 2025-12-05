import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { CitizenPhoto } from "../entities/CitizenPhoto";
import { Report } from "../entities/Report";
import { ReportPhoto } from "../entities/ReportPhoto";
import { ReportMessage } from "../entities/ReportMessage";
import { Notification } from "../entities/Notification";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  
  // All entity definitions (User includes PT27 verification fields)
  entities: [User, CitizenPhoto, Report, ReportPhoto, ReportMessage, Notification],
  
  // Migration files location (not currently used - using synchronize instead)
  migrations: ["dist/app/src/migrations/*.js"],
  
  // Auto-sync schema with entity changes (e.g., PT27 adds isVerified, verificationToken, verificationCodeExpiresAt)
  // Set TYPEORM_SYNCHRONIZE=true in .env to enable automatic schema updates
  synchronize: process.env.TYPEORM_SYNCHRONIZE === "true", 
  
  // SQL query logging for debugging
  logging: process.env.NODE_ENV === "development" || process.env.TYPEORM_LOGGING === "true",
  
  // Preserve existing data - never drop schema
  dropSchema: false,
  
  // Connection timeout and pooling settings for Docker environment
  connectTimeoutMS: 20000,
  extra: {
    max: 10, // Maximum connection pool size
    connectionTimeoutMillis: 10000,
  },
});

export default AppDataSource;