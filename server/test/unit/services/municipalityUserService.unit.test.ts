// Mock UserRepository
const mockUserRepository = {
  countByRole: jest.fn(),
};

jest.mock("../../../src/repositories/UserRepository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

// Mock userService
jest.mock("../../../src/services/userService");

import {
  createMunicipalityUser,
  getAllMunicipalityUsers,
  getMunicipalityUserById,
  updateMunicipalityUser,
  deleteMunicipalityUser,
  findMunicipalityUserByEmail,
} from "../../../src/services/municipalityUserService";
import { Roles } from "../../../src/interfaces/UserDTO";
import { BadRequestError } from "../../../src/utils";
import * as userService from "../../../src/services/userService";

const mockUserService = userService as jest.Mocked<typeof userService>;

describe("municipalityUserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMunicipalityUser", () => {
    it("should delegate to userService.createUser", async () => {
      const data = {
        email: "e",
        first_name: "f",
        last_name: "l",
        password: "p",
        salt: "s",
        role: Role.PUBLIC_RELATIONS,
      };
      mockCreateUser.mockResolvedValue({ id: 1 } as any);
      await createMunicipalityUser(data);
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "e",
          role: Role.PUBLIC_RELATIONS,
          email_notifications_enabled: true,
        })
      );
    });
  });

  describe("getAllMunicipalityUsers", () => {
    it("should delegate to findUsersByRoles", async () => {
      mockFindUsersByRoles.mockResolvedValue([]);
      await getAllMunicipalityUsers();
      expect(mockFindUsersByRoles).toHaveBeenCalled();
    });
  });

  describe("getMunicipalityUserById", () => {
    it("should return null if user not found", async () => {
      mockFindById.mockResolvedValue(null);
      const res = await getMunicipalityUserById(1);
      expect(res).toBeNull();
    });

    it("should return null if user role is not municipality", async () => {
      mockFindById.mockResolvedValue({
        id: 1,
        role: Role.CITIZEN,
      } as any);
      const res = await getMunicipalityUserById(1);
      expect(res).toBeNull();
    });

    it("should return user if valid role", async () => {
      const user = { id: 1, role: Role.MUNICIPAL_BUILDING_MAINTENANCE } as any;
      mockFindById.mockResolvedValue(user);
      const res = await getMunicipalityUserById(1);
      expect(res).toEqual(user);
    });
  });

  describe("updateMunicipalityUser", () => {
    it("should return null if user validation fails", async () => {
      mockFindById.mockResolvedValue(null);
      const res = await updateMunicipalityUser(1, {});
      expect(res).toBeNull();
    });

    it("should call updateUser with mapped fields", async () => {
      const user = { id: 1, role: Role.PUBLIC_RELATIONS } as any;
      mockFindById.mockResolvedValue(user);
      mockUpdateUser.mockResolvedValue({
        ...user,
        first_name: "New",
      });

      const res = await updateMunicipalityUser(1, { first_name: "New" });
      expect(mockUpdateUser).toHaveBeenCalledWith(1, {
        first_name: "New",
      });
      expect(res).toEqual({ ...user, first_name: "New" });
    });
  });

  describe("deleteMunicipalityUser", () => {
    it("should return false if user doesn't exist", async () => {
      mockFindById.mockResolvedValue(null);
      const res = await deleteMunicipalityUser(1);
      expect(res).toBe(false);
    });

    it("should throw BadRequestError if trying to delete the last administrator", async () => {
      mockFindById.mockResolvedValue({
        id: 1,
        role: Role.ADMINISTRATOR,
      } as any);
      mockUserRepository.countByRole.mockResolvedValue(1);

      await expect(deleteMunicipalityUser(1)).rejects.toThrow(BadRequestError);
    });

    it("should allow deleting administrator if others exist", async () => {
      mockFindById.mockResolvedValue({
        id: 1,
        role: Role.ADMINISTRATOR,
      } as any);
      mockUserRepository.countByRole.mockResolvedValue(2);
      mockUserService.deleteUser.mockResolvedValue(true);

      const res = await deleteMunicipalityUser(1);
      expect(res).toBe(true);
    });

    it("should delete normal municipality user without count check", async () => {
      mockFindById.mockResolvedValue({
        id: 1,
        role: Role.PUBLIC_RELATIONS,
      } as any);
      mockDeleteUser.mockResolvedValue(true);

      await deleteMunicipalityUser(1);
      expect(mockUserRepository.countByRole).not.toHaveBeenCalled();
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
    });
  });

  describe("findMunicipalityUserByEmail", () => {
    it("should return null if not found", async () => {
      mockFindByEmail.mockResolvedValue(null);
      const res = await findMunicipalityUserByEmail("a");
      expect(res).toBeNull();
    });

    it("should return null if role invalid", async () => {
      mockFindByEmail.mockResolvedValue({
        role: Role.CITIZEN,
      } as any);
      const res = await findMunicipalityUserByEmail("a");
      expect(res).toBeNull();
    });

    it("should return user if valid", async () => {
      const u = { role: Role.PUBLIC_RELATIONS } as any;
      mockFindByEmail.mockResolvedValue(u);
      const res = await findMunicipalityUserByEmail("a");
      expect(res).toEqual(u);
    });
  });
});
