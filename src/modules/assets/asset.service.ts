import { Prisma } from "@prisma/client";
import { assetRepository } from "./asset.repository";
import type { CreateAssetInput, UpdateAssetInput, ListAssetQuery } from "./asset.schema";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { resolvePagination, skipTake, buildMeta } from "@/lib/pagination";
import { AssetStatusLabel, AssetConditionLabel } from "@/modules/shared/presenters";
import { logActivity } from "@/modules/activity/activity.service";
import type { Asset, AssetCategory } from "@prisma/client";

type AssetWithCategory = Asset & { category: AssetCategory };

function toDto(a: AssetWithCategory) {
  return {
    id: a.id,
    tag: a.tag,
    name: a.name,
    category: a.category?.name ?? "",
    serialNumber: a.serialNumber,
    acquisitionDate: a.acquisitionDate.toISOString().slice(0, 10),
    acquisitionCost: a.acquisitionCost,
    condition: AssetConditionLabel[a.condition],
    location: a.location,
    status: AssetStatusLabel[a.status],
    shared: a.shared,
    bookable: a.bookable,
    customFieldValues: a.customFieldValues ?? {},
  };
}

function tagFromSeq(seq: number): string {
  return `AF-${String(seq).padStart(4, "0")}`;
}

export const assetService = {
  toDto,

  async list(rawQuery: ListAssetQuery) {
    const p = resolvePagination(rawQuery);
    const where: Prisma.AssetWhereInput = {};
    if (rawQuery.status) where.status = rawQuery.status;
    if (rawQuery.location) where.location = { contains: rawQuery.location, mode: "insensitive" };
    if (rawQuery.category) {
      where.OR = [
        { categoryId: rawQuery.category },
        { category: { name: { contains: rawQuery.category, mode: "insensitive" } } },
      ];
    }
    if (p.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: p.search, mode: "insensitive" } },
            { serialNumber: { contains: p.search, mode: "insensitive" } },
            { tag: { contains: p.search, mode: "insensitive" } },
            { location: { contains: p.search, mode: "insensitive" } },
            { category: { name: { contains: p.search, mode: "insensitive" } } },
          ],
        },
      ];
    }
    const sortable = new Set(["name", "acquisitionDate", "acquisitionCost", "status", "createdAt"]);
    const orderBy: Prisma.AssetOrderByWithRelationInput = sortable.has(p.sortBy ?? "")
      ? { [p.sortBy as string]: p.sortOrder }
      : { createdAt: "desc" };

    const { skip, take } = skipTake(p);
    const { items, total } = await assetRepository.list(where, orderBy, skip, take);
    return { items: items.map(toDto), meta: buildMeta(total, p) };
  },

  async getDetail(id: string) {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new NotFoundError("Asset not found");

    const [allocations, maintenance] = await Promise.all([
      assetRepository.allocationHistory(id),
      assetRepository.maintenanceHistory(id),
    ]);

    return {
      ...toDto(asset),
      allocationHistory: allocations.map((al) => ({
        id: al.id,
        type: al.type,
        person: al.recipient?.name ?? "Unknown",
        department: al.recipient?.department?.name ?? "",
        date: (al.approvedAt ?? al.requestedAt).toISOString(),
        notes: al.notes ?? "",
      })),
      maintenanceHistory: maintenance.map((m) => ({
        id: m.id,
        type: m.issue,
        date: (m.resolvedAt ?? m.createdAt).toISOString().slice(0, 10),
        status: m.status === "RESOLVED" ? "completed" : "upcoming",
      })),
    };
  },

  async create(input: CreateAssetInput, actorId: string) {
    const category = await assetRepository.categoryExists(input.categoryId);
    if (!category) throw new ValidationError("categoryId does not reference an existing category");

    const seq = await assetRepository.nextTagSeq();
    try {
      const asset = await assetRepository.create({
        tag: tagFromSeq(seq),
        name: input.name,
        categoryId: input.categoryId,
        serialNumber: input.serialNumber,
        acquisitionDate: input.acquisitionDate,
        acquisitionCost: input.acquisitionCost,
        condition: input.condition ?? "GOOD",
        location: input.location,
        shared: input.shared ?? false,
        bookable: input.bookable ?? false,
        customFieldValues: (input.customFieldValues ?? undefined) as never,
      });
      await logActivity({
        userId: actorId,
        action: "asset.created",
        objectType: "Asset",
        objectId: asset.id,
        metadata: { tag: asset.tag },
      });
      return toDto(asset);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictError("An asset with this serial number already exists");
      }
      throw err;
    }
  },

  async update(id: string, input: UpdateAssetInput, actorId: string) {
    const existing = await assetRepository.findById(id);
    if (!existing) throw new NotFoundError("Asset not found");
    const data: Prisma.AssetUpdateInput = { ...input, customFieldValues: input.customFieldValues as never };
    if (input.categoryId) {
      const cat = await assetRepository.categoryExists(input.categoryId);
      if (!cat) throw new ValidationError("categoryId does not reference an existing category");
    }
    const updated = await assetRepository.update(id, data);
    await logActivity({ userId: actorId, action: "asset.updated", objectType: "Asset", objectId: id });
    return toDto(updated);
  },

  // Soft delete only — hard deleting would orphan allocation/maintenance/audit history.
  async remove(id: string, actorId: string) {
    const existing = await assetRepository.findById(id);
    if (!existing) throw new NotFoundError("Asset not found");
    await assetRepository.softDelete(id);
    await logActivity({ userId: actorId, action: "asset.deleted", objectType: "Asset", objectId: id });
    return { id };
  },
};
