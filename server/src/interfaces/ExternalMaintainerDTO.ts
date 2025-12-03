import { UserDTO } from "./UserDTO";
import { User } from "../entities/User";

export type ExternalMaintainerDTO = UserDTO & {
  companyId: number;
  companyName: string;
};

export function toExternalMaintainerDTO(u: User | (User & { externalCompany?: { id: number; name: string } })): ExternalMaintainerDTO | null {
  if (!u || !u.externalCompany) return null;
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    role: u.role as any,
    telegramUsername: u.telegram_username ?? null,
    emailNotificationsEnabled: u.email_notifications_enabled ?? true,
    companyId: u.externalCompany.id,
    companyName: u.externalCompany.name,
  };
}
