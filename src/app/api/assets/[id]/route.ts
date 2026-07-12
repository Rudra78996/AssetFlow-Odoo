export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { assetService } from "@/modules/assets/asset.service";
import { updateAssetSchema, type UpdateAssetInput } from "@/modules/assets/asset.schema";

export const GET = defineRoute({ auth: true }, async ({ params }) =>
  ok(await assetService.getDetail(params.id)),
);

export const PATCH = defineRoute<UpdateAssetInput>(
  { auth: ["MANAGER", "ADMIN"], bodySchema: updateAssetSchema },
  async ({ params, body, user }) => ok(await assetService.update(params.id, body, user!.id)),
);

export const DELETE = defineRoute({ auth: ["MANAGER", "ADMIN"] }, async ({ params, user }) =>
  ok(await assetService.remove(params.id, user!.id)),
);
