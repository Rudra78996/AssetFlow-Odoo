export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { categoryService } from "@/modules/categories/category.service";
import { updateCategorySchema, type UpdateCategoryInput } from "@/modules/categories/category.schema";

export const PATCH = defineRoute<UpdateCategoryInput>(
  { auth: ["ADMIN"], bodySchema: updateCategorySchema },
  async ({ params, body, user }) => ok(await categoryService.update(params.id, body, user!.id)),
);
export const DELETE = defineRoute({ auth: ["ADMIN"] }, async ({ params, user }) =>
  ok(await categoryService.remove(params.id, user!.id)),
);
