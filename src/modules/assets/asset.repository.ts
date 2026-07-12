import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const notDeleted = { deletedAt: null };

export const assetRepository = {
  // Race-safe sequential counter via Mongo's atomic findAndModify + $inc.
  // Concurrent asset registrations can never receive the same tag number.
  async nextTagSeq(): Promise<number> {
    const res = (await prisma.$runCommandRaw({
      findAndModify: "Counter",
      query: { _id: "asset_tag" },
      update: { $inc: { seq: 1 } },
      upsert: true,
      new: true,
    })) as unknown as { value?: { seq?: number } };
    return res.value?.seq ?? 1;
  },

  create(data: Prisma.AssetUncheckedCreateInput) {
    return prisma.asset.create({ data, include: { category: true } });
  },

  findById(id: string, includeDeleted = false) {
    return prisma.asset.findFirst({
      where: { id, ...(includeDeleted ? {} : notDeleted) },
      include: { category: true },
    });
  },

  async list(where: Prisma.AssetWhereInput, orderBy: Prisma.AssetOrderByWithRelationInput, skip: number, take: number) {
    const finalWhere: Prisma.AssetWhereInput = { ...notDeleted, ...where };
    const [items, total] = await Promise.all([
      prisma.asset.findMany({ where: finalWhere, include: { category: true }, orderBy, skip, take }),
      prisma.asset.count({ where: finalWhere }),
    ]);
    return { items, total };
  },

  update(id: string, data: Prisma.AssetUpdateInput) {
    return prisma.asset.update({ where: { id }, data, include: { category: true } });
  },

  softDelete(id: string) {
    return prisma.asset.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  setStatus(id: string, status: Prisma.AssetUpdateInput["status"]) {
    return prisma.asset.update({ where: { id }, data: { status } });
  },

  // Derived allocation "history" — the source of truth is the Allocation collection.
  allocationHistory(assetId: string) {
    return prisma.allocation.findMany({
      where: { assetId },
      include: { recipient: { include: { department: true } } },
      orderBy: { requestedAt: "desc" },
    });
  },

  // Derived maintenance "history" from MaintenanceRequest records.
  maintenanceHistory(assetId: string) {
    return prisma.maintenanceRequest.findMany({
      where: { assetId },
      orderBy: { createdAt: "desc" },
    });
  },

  categoryExists(id: string) {
    return prisma.assetCategory.findUnique({ where: { id } });
  },
};
