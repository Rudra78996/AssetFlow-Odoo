import { Prisma, type MaintenanceStatus, type AssetStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const withRelations = {
  asset: { select: { name: true, status: true } },
} satisfies Prisma.MaintenanceRequestInclude;

export const maintenanceRepository = {
  create(data: Prisma.MaintenanceRequestUncheckedCreateInput) {
    return prisma.maintenanceRequest.create({ data, include: withRelations });
  },
  findById(id: string) {
    return prisma.maintenanceRequest.findUnique({ where: { id }, include: withRelations });
  },
  async list(where: Prisma.MaintenanceRequestWhereInput, skip: number, take: number) {
    const [items, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({ where, include: withRelations, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.maintenanceRequest.count({ where }),
    ]);
    return { items, total };
  },

  // Atomically update the request and (optionally) flip the asset's status.
  transitionTx(
    id: string,
    data: Prisma.MaintenanceRequestUpdateInput,
    assetChange?: { assetId: string; status: AssetStatus },
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceRequest.update({ where: { id }, data, include: withRelations });
      if (assetChange) {
        await tx.asset.update({ where: { id: assetChange.assetId }, data: { status: assetChange.status } });
      }
      return updated;
    });
  },

  simpleUpdate(id: string, data: Prisma.MaintenanceRequestUpdateInput) {
    return prisma.maintenanceRequest.update({ where: { id }, data, include: withRelations });
  },
};

export type { MaintenanceStatus };
