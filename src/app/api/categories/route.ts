export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { categoryService } from "@/modules/categories/category.service";
import { createCategorySchema, type CreateCategoryInput } from "@/modules/categories/category.schema";

export const GET = defineRoute({ auth: true }, async () => ok(await categoryService.list()));

export const POST = defineRoute<CreateCategoryInput>(
  { auth: ["ADMIN"], bodySchema: createCategorySchema },
  async ({ body, user }) => created(await categoryService.create(body, user!.id)),
);
