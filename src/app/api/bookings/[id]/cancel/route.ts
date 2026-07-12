export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok } from "@/lib/apiResponse";
import { bookingService } from "@/modules/bookings/booking.service";

export const PATCH = defineRoute({ auth: true }, async ({ params, user }) =>
  ok(await bookingService.cancel(params.id, user!.id)),
);
