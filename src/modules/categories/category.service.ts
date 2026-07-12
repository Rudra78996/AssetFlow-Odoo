import type { AssetCategory, CustomFieldType } from "@prisma/client";
import { categoryRepository } from "./category.repository";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.schema";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity.service";

const TypeLabel: Record<CustomFieldType, "Text" | "Numeric" | "Date" | "Boolean"> = {
  TEXT: "Text",
  NUMERIC: "Numeric",
  DATE: "Date",
  BOOLEAN: "Boolean",
};

function toDto(c: AssetCategory) {
  return {
    id: c.id,
    name: c.name,
    icon: c.icon ?? "category",
    // Synthesize stable field ids from index — the frontend expects ids but the
    // embedded type has none (no separate collection needed for custom fields).
    customFields: c.customFields.map((f, i) => ({
      id: `${c.id}-f${i}`,
      name: f.name,
      type: TypeLabel[f.type],
      required: f.required,
    })),
  };
}

export const categoryService = {
  async list() {
    return (await categoryRepository.list()).map(toDto);
  },
  async create(input: CreateCategoryInput, actorId: string) {
    const c = await categoryRepository.create({
      name: input.name,
      icon: input.icon ?? null,
      customFields: input.customFields.map((f) => ({ name: f.name, type: f.type, required: f.required ?? false })),
    });
    await logActivity({ userId: actorId, action: "category.created", objectType: "AssetCategory", objectId: c.id });
    return toDto(c);
  },
  async update(id: string, input: UpdateCategoryInput, actorId: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");
    const c = await categoryRepository.update(id, {
      name: input.name,
      icon: input.icon,
      customFields: input.customFields
        ? { set: input.customFields.map((f) => ({ name: f.name, type: f.type, required: f.required ?? false })) }
        : undefined,
    });
    await logActivity({ userId: actorId, action: "category.updated", objectType: "AssetCategory", objectId: id });
    return toDto(c);
  },
  async remove(id: string, actorId: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw new NotFoundError("Category not found");
    const count = await categoryRepository.countAssets(id);
    if (count > 0) throw new ConflictError(`Cannot delete a category with ${count} asset(s)`);
    await categoryRepository.delete(id);
    await logActivity({ userId: actorId, action: "category.deleted", objectType: "AssetCategory", objectId: id });
    return { id };
  },
};
