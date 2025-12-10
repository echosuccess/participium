// Mock repositories
const mockUserRepository = {
  findWithPhoto: jest.fn(),
  update: jest.fn(),
};
const mockCitizenPhotoRepository = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  updateByUserId: jest.fn(),
  deleteByUserId: jest.fn(),
};

jest.mock("../../../src/repositories/UserRepository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));
jest.mock("../../../src/repositories/CitizenPhotoRepository", () => ({
  CitizenPhotoRepository: jest
    .fn()
    .mockImplementation(() => mockCitizenPhotoRepository),
}));

import {
  getCitizenById,
  updateCitizenProfile,
  uploadCitizenPhoto,
  deleteCitizenPhoto,
  getCitizenPhoto,
} from "../../../src/services/citizenService";
import { NotFoundError } from "../../../src/utils/errors";
import * as CitizenDTO from "../../../src/interfaces/CitizenDTO";

describe("citizenService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCitizenById", () => {
    it("should throw NotFoundError if user not found", async () => {
      mockUserRepository.findWithPhoto.mockResolvedValue(null);
      await expect(getCitizenById(99)).rejects.toThrow(NotFoundError);
    });

    it("should return citizen profile if found", async () => {
      const mockUser = {
        id: 1,
        first_name: "A",
        last_name: "B",
        email: "a@b.com",
        role: "CITIZEN",
        telegram_username: null,
        email_notifications_enabled: true,
        photo: null,
      };
      mockUserRepository.findWithPhoto.mockResolvedValue(mockUser);
      const spy = jest.spyOn(CitizenDTO, "toCitizenProfileDTO");

      await getCitizenById(1);
      expect(spy).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("updateCitizenProfile", () => {
    it("should update specific fields", async () => {
      const updateData = { firstName: "New", emailNotificationsEnabled: false };
      mockUserRepository.update.mockResolvedValue({ id: 1, first_name: "New" });

      await updateCitizenProfile(1, updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          first_name: "New",
          email_notifications_enabled: false,
        }),
        include: { photo: true },
      });
    });

    it("should handle all optional fields", async () => {
      const fullData = {
        firstName: "F",
        lastName: "L",
        email: "e",
        password: "p",
        salt: "s",
        telegramUsername: "t",
        emailNotificationsEnabled: true,
      };
      mockUserRepository.update.mockResolvedValue({});
      await updateCitizenProfile(1, fullData);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            first_name: "F",
            last_name: "L",
            email: "e",
            password: "p",
            salt: "s",
            telegram_username: "t",
            email_notifications_enabled: true,
          },
        })
      );
    });
  });

  describe("uploadCitizenPhoto", () => {
    it("should create new photo if none exists", async () => {
      // First call (findUnique) returns null
      mockCitizenPhotoRepository.findByUserId.mockResolvedValueOnce(null);
      mockCitizenPhotoRepository.create.mockResolvedValue({
        url: "u",
        filename: "f",
      });

      const res = await uploadCitizenPhoto(1, "u", "f");

      expect(mockCitizenPhotoRepository.create).toHaveBeenCalled();
      expect(mockCitizenPhotoRepository.updateByUserId).not.toHaveBeenCalled();
      expect(res).toEqual({ url: "u", filename: "f" });
    });

    it("should update existing photo if one exists", async () => {
      // First call returns existing
      mockCitizenPhotoRepository.findByUserId.mockResolvedValueOnce({ id: 10 });
      mockCitizenPhotoRepository.updateByUserId.mockResolvedValue({
        url: "u2",
        filename: "f2",
      });

      const res = await uploadCitizenPhoto(1, "u2", "f2");

      expect(mockCitizenPhotoRepository.updateByUserId).toHaveBeenCalled();
      expect(mockCitizenPhotoRepository.create).not.toHaveBeenCalled();
      expect(res).toEqual({ url: "u2", filename: "f2" });
    });
  });

  describe("deleteCitizenPhoto", () => {
    it("should throw NotFoundError if photo not found", async () => {
      mockCitizenPhotoRepository.findByUserId.mockResolvedValue(null);
      await expect(deleteCitizenPhoto(1)).rejects.toThrow(NotFoundError);
    });

    it("should delete photo if found", async () => {
      mockCitizenPhotoRepository.findByUserId.mockResolvedValue({ id: 10 });
      await deleteCitizenPhoto(1);
      expect(mockCitizenPhotoRepository.deleteByUserId).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe("getCitizenPhoto", () => {
    it("should return the photo", async () => {
      const photo = { url: "test" };
      mockCitizenPhotoRepository.findByUserId.mockResolvedValue(photo);
      const res = await getCitizenPhoto(1);
      expect(res).toBe(photo);
    });

    it("should return null if no photo exists", async () => {
      mockFindByUserId.mockResolvedValue(null);
      const res = await getCitizenPhoto(1);
      expect(res).toBeNull();
    });
  });
});
