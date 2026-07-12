export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { allocationService } from "@/modules/allocations/allocation.service";
import {
  createAllocationSchema,
  listAllocationQuerySchema,
  type CreateAllocationInput,
  type ListAllocationQuery,
} from "@/modules/allocations/allocation.schema";

export const GET = defineRoute<unknown, ListAllocationQuery>(
  { auth: true, querySchema: listAllocationQuerySchema },
  async ({ query }) => {
    const { items, meta } = await allocationService.list(query);
    return ok(items, { meta });
  },
);

export const POST = defineRoute<CreateAllocationInput>(
  { auth: true, bodySchema: createAllocationSchema },
  async ({ body, user }) => created(await allocationService.create(body, user!.id)),
);
