/**
 * AssetFlow Inventory Report Script
 * 
 * This script safely queries the database in read-only mode to generate 
 * a quick high-level summary of the company's assets. It does NOT modify any data.
 * 
 * Run with: npx tsx scripts/inventory-report.ts
 */

import { prisma } from "../src/lib/prisma";

async function generateReport() {
  console.log("📊 Generating AssetFlow Inventory Report...\n");

  try {
    // 1. Total Assets
    const totalAssets = await prisma.asset.count({
      where: { deletedAt: null }
    });

    // 2. Assets by Status
    const statusCounts = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { deletedAt: null }
    });

    // 3. Assets by Category
    const categoryCounts = await prisma.asset.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: { deletedAt: null }
    });
    
    // Fetch Category Names to map IDs to Names
    const categories = await prisma.assetCategory.findMany();
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    // Print Results
    console.log(`🏢 Total Active Assets: ${totalAssets}\n`);
    
    console.log("--- Assets By Status ---");
    statusCounts.forEach(stat => {
      console.log(`- ${stat.status}: ${stat._count.id}`);
    });

    console.log("\n--- Assets By Category ---");
    categoryCounts.forEach(cat => {
      const name = categoryMap[cat.categoryId] || "Unknown Category";
      console.log(`- ${name}: ${cat._count.id}`);
    });

    console.log("\n✅ Report generated successfully.");
  } catch (error) {
    console.error("❌ Error generating report:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateReport();
