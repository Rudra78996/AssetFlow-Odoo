import { Prisma, type AllocationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const withRelations = {
  asset: { select: { name: true } },
  recipient: { select: { name: true, department: { select: { name: true } } } },
} satisfies Prisma.AllocationInclude;

export const allocationRepository = {
  findActiveForAsset(assetId: string) {
    return prisma.allocation.findFirst({
      where: { assetId, status: "ACTIVE" },
      include: { recipient: { select: { name: true } } },
    });
  },

  create(data: Prisma.AllocationUncheckedCreateInput) {
    return prisma.allocation.create({ data, include: withRelations });
  },

  findById(id: string) {
    return prisma.allocation.findUnique({ where: { id }, include: withRelations });
  },

  async list(where: Prisma.AllocationWhereInput, skip: number, take: number, orderBy: Prisma.AllocationOrderByWithRelationInput) {
    const [items, total] = await Promise.all([
      prisma.allocation.findMany({ where, include: withRelations, skip, take, orderBy }),
      prisma.allocation.count({ where }),
    ]);
    return { items, total };
  },

  findOverdueCandidates(now: Date) {
    return prisma.allocation.findMany({
      where: { status: "ACTIVE", expectedReturn: { lt: now } },
      include: { recipient: { select: { id: true, name: true } } },
    });
  },

  setStatus(id: string, status: AllocationStatus) {
    return prisma.allocation.update({ where: { id }, data: { status } });
  },

  // Transaction: allocation status + asset status must flip atomically.
  approveTx(allocationId: string, assetId: string) {
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.update({
        where: { id: allocationId },
        data: { status: "ACTIVE", approvedAt: new Date(), type: "allocated" },
        include: { asset: { select: { name: true } }, recipient: { select: { name: true, department: { select: { name: true } } } } },
      });
      await tx.asset.update({ where: { id: assetId }, data: { status: "ALLOCATED" } });
      return allocation;
    });
  },

  returnTx(allocationId: string, assetId: string) {
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.update({
        where: { id: allocationId },
        data: { status: "RETURNED", returnedAt: new Date(), type: "returned" },
        include: { asset: { select: { name: true } }, recipient: { select: { name: true, department: { select: { name: true } } } } },
      });
      await tx.asset.update({ where: { id: assetId }, data: { status: "AVAILABLE" } });
      return allocation;
    });
  },
};
