export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { assetService } from "@/modules/assets/asset.service";
import {
  createAssetSchema,
  listAssetQuerySchema,
  type CreateAssetInput,
  type ListAssetQuery,
} from "@/modules/assets/asset.schema";

export const GET = defineRoute<unknown, ListAssetQuery>(
  { auth: true, querySchema: listAssetQuerySchema },
  async ({ query }) => {
    const { items, meta } = await assetService.list(query);
    return ok(items, { meta });
  },
);

// Register asset — manager/admin only.
export const POST = defineRoute<CreateAssetInput>(
  { auth: ["MANAGER", "ADMIN"], bodySchema: createAssetSchema },
  async ({ body, user }) => created(await assetService.create(body, user!.id)),
);
