import { AppDataSource } from '../../src/utils/AppDataSource';
import { ReportMessage } from '../../src/entities/ReportMessage';
import { ReportPhoto } from '../../src/entities/ReportPhoto';
import { Report } from '../../src/entities/Report';
import { InternalNote } from '../../src/entities/InternalNote';
import { CitizenPhoto } from '../../src/entities/CitizenPhoto';
import { Notification } from '../../src/entities/Notification';
import { User } from '../../src/entities/User';
import { ExternalCompany } from '../../src/entities/ExternalCompany';

/**
 * Clean test database - runs before each test
 */
export async function cleanDatabase() {
  if (!AppDataSource.isInitialized) {
    await setupTestDatabase();
  }
  
  // Delete in order to respect foreign key constraints
  // Use createQueryBuilder to delete all records (TypeORM doesn't allow empty criteria with delete({}))
  // Order: child tables first, then parent tables
  await AppDataSource.getRepository(InternalNote).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(ReportMessage).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(ReportPhoto).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(InternalNote).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(Notification).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(CitizenPhoto).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(Report).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(User).createQueryBuilder().delete().execute();
  await AppDataSource.getRepository(ExternalCompany).createQueryBuilder().delete().execute();
}

/**
 * Disconnect database connection - runs after all tests complete
 */
export async function disconnectDatabase() {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}
