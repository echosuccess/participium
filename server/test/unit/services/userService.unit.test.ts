// Mock UserRepository
const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByRoles: jest.fn(),
};

jest.mock("../../../src/repositories/UserRepository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

import {
  findByEmail,
  findById,
  createUser,
  updateUser,
  deleteUser,
  findUsersByRoles,
} from "../../../src/services/userService";
import { Roles } from "../../../src/interfaces/UserDTO";

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should return user if found", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      const result = await findByEmail("test@example.com");
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const result = await findByEmail("notfound@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user if found", async () => {
      const mockUser = { id: 1 };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const result = await findById(1);
      expect(result).toEqual(mockUser);
    });

    it("should return null if not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      const result = await findById(999);
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create user with all fields", async () => {
      const input = {
        email: "test@test.com",
        first_name: "T",
        last_name: "U",
        password: "p",
        salt: "s",
        role: Role.CITIZEN,
        telegram_username: "tele",
        email_notifications_enabled: true,
      };
      mockUserRepository.create.mockResolvedValue({ id: 1, ...input });

      const res = await createUser(input);
      expect(mockUserRepository.create).toHaveBeenCalledWith(input);
      expect(res).toEqual({ id: 1, ...input });
    });

    it("should create user with optional fields defaults", async () => {
      const input = {
        email: "test@test.com",
        first_name: "T",
        last_name: "U",
        password: "p",
        salt: "s",
        role: Role.CITIZEN,
      };
      mockUserRepository.create.mockResolvedValue({ id: 1, ...input });

      await createUser(input);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...input,
        telegram_username: null,
        email_notifications_enabled: undefined,
      });
    });
  });

  describe("updateUser", () => {
    it("should update and return user on success", async () => {
      const input = { first_name: "Updated" };
      mockUserRepository.update.mockResolvedValue({ id: 1, ...input });

      const res = await updateUser(1, input);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, input);
      expect(res).toEqual({ id: 1, ...input });
    });

    it("should handle all optional fields in update", async () => {
      const input = {
        email: "new@mail.com",
        first_name: "F",
        last_name: "L",
        password: "p",
        salt: "s",
        role: Role.ADMINISTRATOR,
        telegram_username: "tg",
        email_notifications_enabled: false,
      };
      mockUserRepository.update.mockResolvedValue({ id: 1 });

      await updateUser(1, input);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, input);
    });

    it("should return null on database error (catch block)", async () => {
      mockUserRepository.update.mockRejectedValue(new Error("DB Error"));
      const res = await updateUser(1, { first_name: "Fail" });
      expect(res).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should return true on successful deletion", async () => {
      mockUserRepository.delete.mockResolvedValue({ id: 1 });
      const res = await deleteUser(1);
      expect(res).toBe(true);
    });

    it("should return false on database error (catch block)", async () => {
      mockUserRepository.delete.mockRejectedValue(new Error("DB Error"));
      const res = await deleteUser(1);
      expect(res).toBe(false);
    });
  });

  describe("findUsersByRoles", () => {
    it("should call findByRoles with in operator", async () => {
      mockUserRepository.findByRoles.mockResolvedValue([]);
      await findUsersByRoles([Roles.CITIZEN, Roles.ADMINISTRATOR]);
      expect(mockUserRepository.findByRoles).toHaveBeenCalledWith([
        Roles.CITIZEN,
        Roles.ADMINISTRATOR,
      ]);
    });
  });
});
