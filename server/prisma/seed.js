import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "lozaashenafi@gmail.com";
  const passwordHash = await bcrypt.hash("loza123", 10);

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
    console.log("Super Admin created");
  }

  // -------------------------------------------------------
  // ROOM TYPES
  // -------------------------------------------------------
  await prisma.roomType.createMany({
    data: roomTypes,
  });

  // -------------------------------------------------------
  // ROOMS
  // -------------------------------------------------------
  await prisma.room.createMany({
    data: rooms,
  });

  // -------------------------------------------------------
  // PRICE OF CARE
  // -------------------------------------------------------
  await prisma.priceofCare.createMany({
    data: priceOfCare,
  });

  await prisma.utilityType.createMany({
    data: utilityTypes,
  });

  console.log("Seed completed ✔");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
const utilityTypes = [
  {
    name: "Water",
    description: "Monthly water consumption charges",
  },
  {
    name: "Electricity",
    description: "Electric power usage charges",
  },
  {
    name: "Parking",
    description: "Parking space fees for tenants",
  },
  {
    name: "Service",
    description: "General building maintenance fee",
  },
  {
    name: "Generator",
    description: "Backup power supply charges",
  },
];

// Seed data arrays
const roomTypes = [
  { typeName: "Retail Shop", description: "Standard shop for retail tenants" },
  { typeName: "Premium Retail Shop", description: "High-traffic area shop" },
  {
    typeName: "Food Court Stall",
    description: "Small kitchen-ready food vendor space",
  },
  {
    typeName: "Restaurant Space",
    description: "Full dine-in restaurant space",
  },
  { typeName: "Office Space", description: "Quiet office space for tenants" },
  { typeName: "Storage Room", description: "Secure storage room for goods" },
  { typeName: "Kiosk", description: "Small open-area selling spot" },
  {
    typeName: "Entertainment Zone",
    description: "VR, playground or gaming area",
  },
  { typeName: "Cinema Hall", description: "Large entertainment hall" },
  { typeName: "Anchor Store", description: "Large brand retail space" },
];

const rooms = [
  {
    unitNumber: "R101",
    floor: 1,
    size: 40,
    roomTypeId: 1,
    roomPrice: 8000,
    status: "Vacant",
    hasParking: false,
  },
  {
    unitNumber: "R102",
    floor: 1,
    size: 45,
    roomTypeId: 1,
    roomPrice: 8500,
    status: "Vacant",
    hasParking: false,
  },
  {
    unitNumber: "R103",
    floor: 1,
    size: 60,
    roomTypeId: 2,
    roomPrice: 12000,
    status: "Vacant",
    hasParking: false,
  },
];

const priceOfCare = [
  { floor: 1, basePrice: 500 },
  { floor: 2, basePrice: 450 },
  { floor: 3, basePrice: 400 },
  { floor: 4, basePrice: 350 },
  { floor: 5, basePrice: 300 },
];
