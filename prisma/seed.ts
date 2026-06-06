import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const org = await prisma.organization.upsert({
    where: { slug: "demo-wholesale" },
    update: {},
    create: {
      name: "Demo Wholesale Co.",
      slug: "demo-wholesale",
    },
  });

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "admin@demo.com" } },
    update: { passwordHash },
    create: {
      organizationId: org.id,
      email: "admin@demo.com",
      passwordHash,
      firstName: "Sarah",
      lastName: "Chen",
      role: UserRole.SUPER_ADMIN,
    },
  });

  const categories = await Promise.all(
    ["T-Shirts", "Jackets", "Blouses", "Pants", "Hoodies"].map((name, i) =>
      prisma.category.upsert({
        where: { organizationId_slug: { organizationId: org.id, slug: name.toLowerCase() } },
        update: {},
        create: { organizationId: org.id, name, slug: name.toLowerCase(), sortOrder: i },
      })
    )
  );

  const productData = [
    { sku: "CTW-M-WHT", name: "Classic Cotton Tee", brand: "Basics Co", color: "White", size: "M", cost: 4.5, wholesale: 8.5, sell: 24.99 },
    { sku: "DJB-L-BLU", name: "Premium Denim Jacket", brand: "Urban Edge", color: "Blue", size: "L", cost: 18, wholesale: 32, sell: 89.99 },
    { sku: "SBB-S-BLK", name: "Silk Blend Blouse", brand: "Luxe Line", color: "Black", size: "S", cost: 9, wholesale: 18, sell: 54.99 },
    { sku: "PHN-M-NVY", name: "Performance Hoodie", brand: "ActiveWear", color: "Navy", size: "M", cost: 11, wholesale: 22, sell: 59.99 },
  ];

  const products = await Promise.all(
    productData.map((p) =>
      prisma.product.upsert({
        where: { organizationId_sku: { organizationId: org.id, sku: p.sku } },
        update: {},
        create: {
          organizationId: org.id,
          categoryId: categories[0].id,
          sku: p.sku,
          barcode: p.sku,
          name: p.name,
          brand: p.brand,
          color: p.color,
          size: p.size,
          costPrice: p.cost,
          wholesalePrice: p.wholesale,
          sellPrice: p.sell,
          minStock: 20,
        },
      })
    )
  );

  let warehouse = await prisma.warehouse.findFirst({
    where: { organizationId: org.id, code: "WH-MAIN" },
    include: { zones: { include: { shelves: true } } },
  });

  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        organizationId: org.id,
        name: "Main Distribution Center",
        code: "WH-MAIN",
        address: "123 Commerce Blvd",
        city: "Los Angeles",
        country: "USA",
        capacity: 50000,
        zones: {
          create: [
            {
              name: "Zone A",
              code: "A",
              shelves: { create: [{ name: "Shelf 01", code: "A-01", capacity: 500 }] },
            },
          ],
        },
      },
      include: { zones: { include: { shelves: true } } },
    });
  }

  const shelfId = warehouse.zones[0]?.shelves[0]?.id;
  if (shelfId) {
    for (const product of products) {
      await prisma.inventoryItem.upsert({
        where: {
          productId_warehouseId_shelfId: {
            productId: product.id,
            warehouseId: warehouse.id,
            shelfId,
          },
        },
        update: {},
        create: {
          productId: product.id,
          warehouseId: warehouse.id,
          shelfId,
          quantity: Math.floor(Math.random() * 400) + 50,
        },
      });
    }
  }

  const customerData = [
    { name: "Nordstrom Inc.", code: "CUST-001" },
    { name: "Urban Outfitters", code: "CUST-002" },
    { name: "Bloomingdale's", code: "CUST-003" },
    { name: "Revolve", code: "CUST-004" },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.customer.upsert({
        where: { organizationId_code: { organizationId: org.id, code: c.code } },
        update: {},
        create: {
          organizationId: org.id,
          name: c.name,
          code: c.code,
          type: "WHOLESALE",
          email: `buyer@${c.name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
          creditLimit: 100000,
        },
      })
    )
  );

  const dealCount = await prisma.deal.count({ where: { organizationId: org.id } });
  if (dealCount === 0) {
    await prisma.deal.createMany({
      data: [
        { organizationId: org.id, customerId: customers[0].id, title: "Nordstrom Q3 Collection", value: 85000, stage: "NEGOTIATION", probability: 75 },
        { organizationId: org.id, customerId: customers[1].id, title: "Urban Outfitters Spring Line", value: 62000, stage: "PROPOSAL", probability: 50 },
        { organizationId: org.id, customerId: customers[2].id, title: "Bloomingdale's Exclusive", value: 120000, stage: "QUALIFICATION", probability: 30 },
      ],
    });
  }

  const activityCount = await prisma.activityLog.count({ where: { organizationId: org.id } });
  if (activityCount === 0) {
    await prisma.activityLog.createMany({
      data: [
        { organizationId: org.id, userId: admin.id, action: "created", entity: "Sale #SO-2024-0892" },
        { organizationId: org.id, userId: admin.id, action: "updated", entity: "Deal: Nordstrom Q3 Order" },
        { organizationId: org.id, userId: admin.id, action: "received", entity: "PO #PO-2024-0156" },
      ],
    });
  }

  console.log("✅ Seed complete!");
  console.log("   Login: admin@demo.com / Password123!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
