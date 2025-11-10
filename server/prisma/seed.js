import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "lozaashenafi@gmail.com";
  const password = "loza123"; // ⚠️ change this later for security

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if SuperAdmin already exists
  const existing = await prisma.user.findFirst({
    where: { role: "SuperAdmin" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        fullName: "MallSpot SuperAdmin",
        email,
        passwordHash,
        role: "SuperAdmin",
        status: "Active",
      },
    });
    console.log("✅ SuperAdmin user created:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } else {
    console.log("⚙️ SuperAdmin already exists. Skipping creation.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
