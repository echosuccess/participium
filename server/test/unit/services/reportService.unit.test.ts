import { createReport, getApprovedReports } from "../../../src/services/reportService";
import { ReportCategory } from "../../../../shared/ReportTypes";

// Mock Prisma
var mockPrisma: any;

jest.mock("../../../src/index", () => {
  mockPrisma = {
    report: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  return {
    prisma: mockPrisma,
  };
});

describe("reportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createReport", () => {
    const validReportData = {
      title: "Broken streetlight",
      description: "The streetlight on Via Roma is not working",
      category: "PUBLIC_LIGHTING" as ReportCategory,
      latitude: 45.0703,
      longitude: 7.6869,
      isAnonymous: false,
      userId: 1,
      photos: [
        {
          id: 1,
          url: "https://example.com/photo.jpg",
          filename: "streetlight.jpg"
        }
      ]
    };

    it("should create a report with valid data", async () => {
      const mockCreatedReport = {
        id: 1,
        ...validReportData,
        status: "PENDING_APPROVAL",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
        photos: [
          {
            id: 1,
            url: "https://example.com/photo.jpg",
            filename: "streetlight.jpg",
            reportId: 1
          }
        ]
      };

      mockPrisma.report.create.mockResolvedValue(mockCreatedReport);

      const result = await createReport(validReportData);

      expect(mockPrisma.report.create).toHaveBeenCalledWith({
        data: {
          title: validReportData.title,
          description: validReportData.description,
          category: validReportData.category,
          latitude: validReportData.latitude,
          longitude: validReportData.longitude,
          isAnonymous: validReportData.isAnonymous,
          status: "PENDING_APPROVAL",
          userId: validReportData.userId,
          photos: {
            create: [
              {
                url: "https://example.com/photo.jpg",
                filename: "streetlight.jpg"
              }
            ]
          },
        },
        include: {
          user: true,
          photos: true,
        },
      });

      expect(result).toEqual(mockCreatedReport);
    });

    it("should create anonymous report", async () => {
      const anonymousReportData = {
        ...validReportData,
        isAnonymous: true
      };

      const mockCreatedReport = {
        id: 1,
        ...anonymousReportData,
        status: "PENDING_APPROVAL",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
        photos: []
      };

      mockPrisma.report.create.mockResolvedValue(mockCreatedReport);

      const result = await createReport(anonymousReportData);

      expect(mockPrisma.report.create).toHaveBeenCalledWith({
        data: {
          title: anonymousReportData.title,
          description: anonymousReportData.description,
          category: anonymousReportData.category,
          latitude: anonymousReportData.latitude,
          longitude: anonymousReportData.longitude,
          isAnonymous: true,
          status: "PENDING_APPROVAL",
          userId: anonymousReportData.userId,
          photos: {
            create: [
              {
                url: "https://example.com/photo.jpg",
                filename: "streetlight.jpg"
              }
            ]
          },
        },
        include: {
          user: true,
          photos: true,
        },
      });

      expect(result).toEqual(mockCreatedReport);
    });

    it("should create report with multiple photos", async () => {
      const reportWithMultiplePhotos = {
        ...validReportData,
        photos: [
          {
            id: 1,
            url: "https://example.com/photo1.jpg",
            filename: "photo1.jpg"
          },
          {
            id: 2,
            url: "https://example.com/photo2.jpg",
            filename: "photo2.jpg"
          }
        ]
      };

      const mockCreatedReport = {
        id: 1,
        ...reportWithMultiplePhotos,
        status: "PENDING_APPROVAL",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
        photos: [
          {
            id: 1,
            url: "https://example.com/photo1.jpg",
            filename: "photo1.jpg",
            reportId: 1
          },
          {
            id: 2,
            url: "https://example.com/photo2.jpg",
            filename: "photo2.jpg",
            reportId: 1
          }
        ]
      };

      mockPrisma.report.create.mockResolvedValue(mockCreatedReport);

      const result = await createReport(reportWithMultiplePhotos);

      expect(mockPrisma.report.create).toHaveBeenCalledWith({
        data: {
          title: reportWithMultiplePhotos.title,
          description: reportWithMultiplePhotos.description,
          category: reportWithMultiplePhotos.category,
          latitude: reportWithMultiplePhotos.latitude,
          longitude: reportWithMultiplePhotos.longitude,
          isAnonymous: reportWithMultiplePhotos.isAnonymous,
          status: "PENDING_APPROVAL",
          userId: reportWithMultiplePhotos.userId,
          photos: {
            create: [
              {
                url: "https://example.com/photo1.jpg",
                filename: "photo1.jpg"
              },
              {
                url: "https://example.com/photo2.jpg",
                filename: "photo2.jpg"
              }
            ]
          },
        },
        include: {
          user: true,
          photos: true,
        },
      });

      expect(result).toEqual(mockCreatedReport);
    });

    it("should create report with Turin coordinates", async () => {
      const turinReportData = {
        ...validReportData,
        latitude: 45.0703,
        longitude: 7.6869
      };

      const mockCreatedReport = {
        id: 1,
        ...turinReportData,
        status: "PENDING_APPROVAL",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 1 },
        photos: []
      };

      mockPrisma.report.create.mockResolvedValue(mockCreatedReport);

      const result = await createReport(turinReportData);

      expect(mockPrisma.report.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            latitude: 45.0703,
            longitude: 7.6869
          })
        })
      );

      expect(result).toEqual(mockCreatedReport);
    });

    it("should create report with different categories", async () => {
      const categories: ReportCategory[] = [
        "WATER_SUPPLY_DRINKING_WATER",
        "ARCHITECTURAL_BARRIERS", 
        "SEWER_SYSTEM",
        "PUBLIC_LIGHTING",
        "WASTE",
        "ROAD_SIGNS_AND_TRAFFIC_LIGHTS",
        "ROADS_AND_URBAN_FURNISHINGS",
        "PUBLIC_GREEN_AREAS_AND_PLAYGROUNDS",
        "OTHER"
      ];

      for (const category of categories) {
        const reportWithCategory = {
          ...validReportData,
          category
        };

        const mockCreatedReport = {
          id: 1,
          ...reportWithCategory,
          status: "PENDING_APPROVAL",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 1 },
          photos: []
        };

        mockPrisma.report.create.mockResolvedValue(mockCreatedReport);

        await createReport(reportWithCategory);

        expect(mockPrisma.report.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              category: category
            })
          })
        );

        jest.clearAllMocks();
      }
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      mockPrisma.report.create.mockRejectedValue(error);

      await expect(createReport(validReportData)).rejects.toThrow(error);

      expect(mockPrisma.report.create).toHaveBeenCalled();
    });

    it("should create report with boundary coordinates", async () => {
      // Test coordinate ai limiti
      const boundaryTests = [
        { latitude: -90, longitude: -180 },   // Limite sud-ovest
        { latitude: 90, longitude: 180 },     // Limite nord-est  
        { latitude: 0, longitude: 0 },        // Equatore e meridiano di Greenwich
        { latitude: 45.1, longitude: 7.7 },  // Coordinate vicino a Torino
      ];

      for (const coords of boundaryTests) {
        const reportWithBoundaryCoords = {
          ...validReportData,
          latitude: coords.latitude,
          longitude: coords.longitude
        };

        const mockCreatedReport = {
          id: 1,
          ...reportWithBoundaryCoords,
          status: "PENDING_APPROVAL",
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 1 },
          photos: []
        };

        mockPrisma.report.create.mockResolvedValue(mockCreatedReport);

        await createReport(reportWithBoundaryCoords);

        expect(mockPrisma.report.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              latitude: coords.latitude,
              longitude: coords.longitude
            })
          })
        );

        jest.clearAllMocks();
      }
    });
  });

  describe("getApprovedReports", () => {
    it("should return approved reports ordered by creation date", async () => {
      const mockReports = [
        {
          id: 1,
          title: "Recent report",
          description: "Recent issue",
          category: "PUBLIC_LIGHTING",
          latitude: 45.0703,
          longitude: 7.6869,
          status: "ASSIGNED",
          createdAt: new Date("2023-12-01"),
          user: {
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com"
          }
        },
        {
          id: 2,
          title: "Older report",
          description: "Older issue",
          category: "ROADS_AND_URBAN_FURNISHINGS",
          latitude: 45.0704,
          longitude: 7.6870,
          status: "IN_PROGRESS",
          createdAt: new Date("2023-11-01"),
          user: {
            first_name: "Jane",
            last_name: "Smith",
            email: "jane.smith@example.com"
          }
        }
      ];

      mockPrisma.report.findMany.mockResolvedValue(mockReports);

      const result = await getApprovedReports();

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: [
              "ASSIGNED",
              "IN_PROGRESS", 
              "RESOLVED"
            ]
          }
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      expect(result).toEqual(mockReports);
    });

    it("should return empty array when no approved reports exist", async () => {
      mockPrisma.report.findMany.mockResolvedValue([]);

      const result = await getApprovedReports();

      expect(mockPrisma.report.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should filter out pending and rejected reports", async () => {
      const mockApprovedReports = [
        {
          id: 1,
          status: "ASSIGNED",
          user: { first_name: "John", last_name: "Doe", email: "john@example.com" }
        },
        {
          id: 2,
          status: "IN_PROGRESS",
          user: { first_name: "Jane", last_name: "Smith", email: "jane@example.com" }
        },
        {
          id: 3,
          status: "RESOLVED",
          user: { first_name: "Bob", last_name: "Johnson", email: "bob@example.com" }
        }
      ];

      mockPrisma.report.findMany.mockResolvedValue(mockApprovedReports);

      const result = await getApprovedReports();

      // Verifica che la query filtri correttamente gli stati
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"]
          }
        },
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      expect(result).toEqual(mockApprovedReports);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database query failed");
      mockPrisma.report.findMany.mockRejectedValue(error);

      await expect(getApprovedReports()).rejects.toThrow(error);

      expect(mockPrisma.report.findMany).toHaveBeenCalled();
    });

    it("should include user information in results", async () => {
      const mockReports = [
        {
          id: 1,
          title: "Test report",
          description: "Test description",
          category: "PUBLIC_LIGHTING",
          latitude: 45.0703,
          longitude: 7.6869,
          status: "ASSIGNED",
          user: {
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com"
          }
        }
      ];

      mockPrisma.report.findMany.mockResolvedValue(mockReports);

      const result = await getApprovedReports();

      expect(result[0].user).toEqual({
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com"
      });
    });

    it("should order reports by creation date descending", async () => {
      mockPrisma.report.findMany.mockResolvedValue([]);

      await getApprovedReports();

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: "desc"
          }
        })
      );
    });
  });
});