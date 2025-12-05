import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from "typeorm";

export enum Role {
  CITIZEN = "CITIZEN",
  ADMINISTRATOR = "ADMINISTRATOR",
  PUBLIC_RELATIONS = "PUBLIC_RELATIONS",
  CULTURE_EVENTS_TOURISM_SPORTS = "CULTURE_EVENTS_TOURISM_SPORTS",
  LOCAL_PUBLIC_SERVICES = "LOCAL_PUBLIC_SERVICES",
  EDUCATION_SERVICES = "EDUCATION_SERVICES",
  PUBLIC_RESIDENTIAL_HOUSING = "PUBLIC_RESIDENTIAL_HOUSING",
  INFORMATION_SYSTEMS = "INFORMATION_SYSTEMS",
  MUNICIPAL_BUILDING_MAINTENANCE = "MUNICIPAL_BUILDING_MAINTENANCE",
  PRIVATE_BUILDINGS = "PRIVATE_BUILDINGS",
  INFRASTRUCTURES = "INFRASTRUCTURES",
  GREENSPACES_AND_ANIMAL_PROTECTION = "GREENSPACES_AND_ANIMAL_PROTECTION",
  WASTE_MANAGEMENT = "WASTE_MANAGEMENT",
  ROAD_MAINTENANCE = "ROAD_MAINTENANCE",
  CIVIL_PROTECTION = "CIVIL_PROTECTION",
}

@Entity("User")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.CITIZEN,
  })
  role: Role;

  @Column({ type: "varchar", nullable: true })
  telegram_username: string | null;

  // Email notification preference for report updates
  @Column({ default: true })
  email_notifications_enabled: boolean;

  // PT27: Email verification status - user must verify email to use the system
  @Column({ default: false })
  isVerified: boolean;

  // PT27: 6-digit verification code sent via email (hashed for security)
  @Column({ type: "varchar", nullable: true })
  verificationToken: string | null;

  // PT27: Expiration timestamp for verification code (valid for 30 minutes)
  @Column({ type: "timestamp", nullable: true })
  verificationCodeExpiresAt: Date | null;

  @OneToMany("Report", "user")
  reports: import("./Report").Report[];

  @OneToMany("ReportMessage", "user")
  messages: import("./ReportMessage").ReportMessage[];

  @OneToMany("Report", "assignedTo")
  assignedReports: import("./Report").Report[];

  @OneToMany("Notification", "user")
  notifications: import("./Notification").Notification[];

  @OneToOne("CitizenPhoto", "user")
  photo: import("./CitizenPhoto").CitizenPhoto;
}