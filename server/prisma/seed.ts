import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/services/passwordService";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");
  // Helper to check whether a table exists in the current DB schema.
  async function tableExists(tableName: string) {
    const rows: Array<any> = (await prisma.$queryRawUnsafe(
      `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND (table_name = '${tableName}' OR lower(table_name) = lower('${tableName}')) LIMIT 1`
    )) as any;
    return Array.isArray(rows) && rows.length > 0;
  }

  // If the core tables (migrations haven't been applied yet) are not present,
  // skip the seed. This avoids races where the seed container runs before
  // the server has applied Prisma migrations and created tables.
  if (!(await tableExists('Report'))) {
    console.log('seed: core tables not present yet, skipping seed.');
    return;
  }

  // Detect which column name is present in the DB for the report rejection reason
  // Some older migrations used `rejectedReason` while newer schema uses `rejectionReason`.
  // We'll query information_schema to pick the correct column name, or null if none.
  const rejectionColumnRows: Array<{ column_name: string }> = (await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('Report','report') AND column_name IN ('rejectionReason','rejectedReason')`
  )) as any;
  const rejectionColumn = rejectionColumnRows.length
    ? (rejectionColumnRows[0].column_name as string)
    : null;

  // Clear dependent tables first to avoid foreign key constraint violations
  // Delete messages (they reference reports and users)
  if (await tableExists('ReportMessage')) {
    if ((prisma as any).reportMessage?.deleteMany) {
      await prisma.reportMessage.deleteMany();
    } else {
      await prisma.$executeRawUnsafe('DELETE FROM "ReportMessage";');
    }
  }
  // Delete photos (they reference reports)
  await prisma.reportPhoto.deleteMany();
  // Delete citizen photos (they reference users)
  await prisma.citizenPhoto.deleteMany();
  // Delete reports (they reference users)
  if (await tableExists('Report')) {
    if ((prisma as any).report?.deleteMany) {
      await prisma.report.deleteMany();
    } else {
      await prisma.$executeRawUnsafe('DELETE FROM "Report";');
    }
  }
  // Delete notifications (they reference users)
  if (await tableExists('Notification')) {
    if ((prisma as any).notification?.deleteMany) {
      await prisma.notification.deleteMany();
    } else {
      await prisma.$executeRawUnsafe('DELETE FROM "Notification";');
    }
  }
  // Now it's safe to delete users
  if (await tableExists('User')) {
    if ((prisma as any).user?.deleteMany) {
      await prisma.user.deleteMany();
    } else {
      await prisma.$executeRawUnsafe('DELETE FROM "User";');
    }
  }

  // Users to insert (plain passwords)
  const users = [
    {
      email: "admin@participium.com",
      first_name: "Admin",
      last_name: "User",
      password: "adminpass",
      role: "ADMINISTRATOR",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "citizen@participium.com",
      first_name: "Mario",
      last_name: "Rossi",
      password: "citizenpass",
      role: "CITIZEN",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "pr@participium.com",
      first_name: "Public",
      last_name: "Relations",
      password: "prpass",
      role: "PUBLIC_RELATIONS",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "tech@participium.com",
      first_name: "Luca",
      last_name: "Bianchi",
      password: "techpass",
      role: "MUNICIPAL_BUILDING_MAINTENANCE",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "culture@participium.com",
      first_name: "Chiara",
      last_name: "Rossi",
      password: "techpass",
      role: "CULTURE_EVENTS_TOURISM_SPORTS",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "localpublic@participium.com",
      first_name: "Marco",
      last_name: "Moretti",
      password: "techpass",
      role: "LOCAL_PUBLIC_SERVICES",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "education@participium.com",
      first_name: "Sara",
      last_name: "Conti",
      password: "techpass",
      role: "EDUCATION_SERVICES",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "residential@participium.com",
      first_name: "Davide",
      last_name: "Ferrari",
      password: "techpass",
      role: "PUBLIC_RESIDENTIAL_HOUSING",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "infosys@participium.com",
      first_name: "Elena",
      last_name: "Galli",
      password: "techpass",
      role: "INFORMATION_SYSTEMS",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "privatebuild@participium.com",
      first_name: "Antonio",
      last_name: "Marini",
      password: "techpass",
      role: "PRIVATE_BUILDINGS",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "greenspaces@participium.com",
      first_name: "Giulia",
      last_name: "Pellegrini",
      password: "techpass",
      role: "GREENSPACES_AND_ANIMAL_PROTECTION",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "road@participium.com",
      first_name: "Francesco",
      last_name: "Sala",
      password: "techpass",
      role: "ROAD_MAINTENANCE",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "civilprot@participium.com",
      first_name: "Valentina",
      last_name: "Riva",
      password: "techpass",
      role: "CIVIL_PROTECTION",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "infra@participium.com",
      first_name: "Giorgio",
      last_name: "Costa",
      password: "infrapass",
      role: "INFRASTRUCTURES",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "waste@participium.com",
      first_name: "Federica",
      last_name: "Neri",
      password: "wastepass",
      role: "WASTE_MANAGEMENT",
      telegram_username: null,
      email_notifications_enabled: true,
    },
    {
      email: "techPR@participium.com",
      first_name: "Alessandro",
      last_name: "Romano",
      password: "techpass",
      role: "PUBLIC_RELATIONS",
      telegram_username: null,
      email_notifications_enabled: true,
    },
  ];

  // Hash passwords and insert users (keep created records for relations)
  const createdUsers: Array<any> = [];
  for (const u of users) {
    const { hashedPassword, salt } = await hashPassword(u.password);
    const created = await prisma.user.create({
      data: {
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        password: hashedPassword,
        salt,
        role: u.role as any,
        telegram_username: u.telegram_username,
        email_notifications_enabled: u.email_notifications_enabled,
      },
    });
    createdUsers.push(created);
    console.log(`✅ Created user: ${u.email}`);
  }

  // Create one report per ReportStatus with different categories
  const statuses = [
    "PENDING_APPROVAL",
    "ASSIGNED",
    "IN_PROGRESS",
    "SUSPENDED",
    "REJECTED",
    "RESOLVED",
  ];

  const categories = [
    "WATER_SUPPLY_DRINKING_WATER",
    "ARCHITECTURAL_BARRIERS",
    "SEWER_SYSTEM",
    "PUBLIC_LIGHTING",
    "WASTE",
    "ROAD_SIGNS_TRAFFIC_LIGHTS",
  ];

  // helper to find users by role/email
  const citizen = createdUsers.find(
    (x) => x.email === "citizen@participium.com"
  );
  const tech =
    createdUsers.find((x) => x.email === "tech@participium.com") ||
    createdUsers[0];
  // realistic samples per category
  const categorySamples: Record<
    string,
    { title: string; description: string; preferredRole: string }
  > = {
    WATER_SUPPLY_DRINKING_WATER: {
      title: "Contaminated drinking water at the city fountain",
      description:
        "The central fountain has a strong smell and the water appears cloudy. Please inspect as soon as possible.",
      preferredRole: "LOCAL_PUBLIC_SERVICES",
    },
    ARCHITECTURAL_BARRIERS: {
      title: "Staircase missing handrail limits access",
      description:
        "The park staircase lacks a handrail and poses a risk to elderly and disabled people.",
      preferredRole: "MUNICIPAL_BUILDING_MAINTENANCE",
    },
    SEWER_SYSTEM: {
      title: "Road drain flooding after heavy rain",
      description:
        "After heavy rain the street drain on Via Roma clogs and causes local flooding.",
      preferredRole: "INFRASTRUCTURES",
    },
    PUBLIC_LIGHTING: {
      title: "Streetlight out on Viale Garibaldi",
      description:
        "Streetlight no.45 on Viale Garibaldi has been out for weeks, area poorly lit at night.",
      preferredRole: "LOCAL_PUBLIC_SERVICES",
    },
    WASTE: {
      title: "Illegal waste dump near bin",
      description:
        "Accumulation of waste and bulky items near the bin at Via Milano corner, sanitary risk.",
      preferredRole: "WASTE_MANAGEMENT",
    },
    ROAD_SIGNS_TRAFFIC_LIGHTS: {
      title: "Traffic light malfunction at Corso Italia intersection",
      description:
        "The traffic light stays red for only one direction causing confusion and danger.",
      preferredRole: "ROAD_MAINTENANCE",
    },
  };

  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const category = categories[i % categories.length];
    const sample = categorySamples[category] || {
      title: `Segnalazione ${category}`,
      description: "Segnalazione generica",
      preferredRole: "INFRASTRUCTURES",
    };


    const reportData: any = {
      title: sample.title,
      description: sample.description,
      category: category,
      latitude: (45.0703 + i * 0.001).toString(),
      longitude: (7.6869 + i * 0.001).toString(),
      address: `Via esempio ${100 + i}, Torino`,
      isAnonymous: false,
      status: status,
      userId: citizen.id,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
    };

    // Associa sempre il tecnico con email 'tech@participium.com' ai report del citizen
    const techUser = createdUsers.find((u) => u.email === "tech@participium.com");
    if (techUser) {
      reportData.assignedToId = techUser.id;
    }

    if (status === "REJECTED") {
      reportData.rejectionReason =
        "Segnalazione non pertinente al patrimonio comunale.";
    }

    const createdReport = await prisma.report.create({ data: reportData });
    console.log(
      `📝 Created report id=${createdReport.id} status=${status} category=${category}`
    );

    // Log assignment info if present
    if (reportData.assignedToId) {
      const assignedUser = createdUsers.find(
        (u) => u.id === reportData.assignedToId
      );
      if (assignedUser) {
        console.log(
          `   → Assigned to: ${assignedUser.email} (${assignedUser.role})`
        );
      }
    }

    // add 1-3 realistic photo placeholders for the report (vary per report)
    const numPhotos = (i % 3) + 1; // 1,2,3 repeating
    for (let p = 1; p <= numPhotos; p++) {
      const photoUrl = `https://picsum.photos/seed/participium-${createdReport.id}-${p}/800/600`;
      await prisma.reportPhoto.create({
        data: {
          url: photoUrl,
          filename: `seed-${createdReport.id}-${p}.jpg`,
          reportId: createdReport.id,
        },
      });
    }

    // Add a clear citizen message for every report
    await prisma.reportMessage.create({
      data: {
        content: `Citizen message: ${sample.description}`,
        reportId: createdReport.id,
        senderId: citizen.id,
      },
    });

    // For assigned/in-progress, add a technician message
    if (status === "ASSIGNED" || status === "IN_PROGRESS") {
      const assignedUser = createdUsers.find(
        (u) => u.id === (reportData.assignedToId as any)
      );
      if (assignedUser) {
        await prisma.reportMessage.create({
          data: {
            content: `Technician update: Inspection started by ${assignedUser.first_name} ${assignedUser.last_name}.`,
            reportId: createdReport.id,
            senderId: assignedUser.id,
          },
        });
      }
    }

    // For rejected, add a PR message with reason
    if (status === "REJECTED") {
      // If the DB uses the old `rejectedReason` column name, update it now.
      if (rejectionColumn === 'rejectedReason' && (reportData as any).__rejectionReasonForRawUpdate) {
        await prisma.$executeRaw`
          UPDATE "Report" SET "rejectedReason" = ${ (reportData as any).__rejectionReasonForRawUpdate } WHERE id = ${ createdReport.id }
        `;
      }

      const prUser = createdUsers.find((u) => u.role === "PUBLIC_RELATIONS") || createdUsers[2];
      await prisma.reportMessage.create({
        data: {
          content:
            "Public Relations: The report was rejected because it falls outside municipal responsibilities.",
          reportId: createdReport.id,
          senderId: prUser.id,
        },
      });
    }
  }

  console.log("\n✅ Database seed completed successfully!");
  console.log(`\nCreated ${users.length} sample users with hashed passwords`);
  console.log("\n📋 Test credentials:");
  console.log("  Admin: admin@participium.com / adminpass");
  console.log("  Citizen: citizen@participium.com / citizenpass");
  console.log("  PR: pr@participium.com / prpass");
  console.log("  Tech: tech@participium.com / techpass");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
