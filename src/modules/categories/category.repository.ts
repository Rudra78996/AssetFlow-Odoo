import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const categoryRepository = {
  list() {
    return prisma.assetCategory.findMany({ orderBy: { name: "asc" } });
  },
  findById(id: string) {
    return prisma.assetCategory.findUnique({ where: { id } });
  },
  create(data: Prisma.AssetCategoryCreateInput) {
    return prisma.assetCategory.create({ data });
  },
  update(id: string, data: Prisma.AssetCategoryUpdateInput) {
    return prisma.assetCategory.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.assetCategory.delete({ where: { id } });
  },
  countAssets(categoryId: string) {
    return prisma.asset.count({ where: { categoryId, deletedAt: null } });
  },
};
