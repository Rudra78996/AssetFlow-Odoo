export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { defineRoute } from "@/middleware/compose";
import { ok, created } from "@/lib/apiResponse";
import { bookingService } from "@/modules/bookings/booking.service";
import {
  createBookingSchema,
  listBookingQuerySchema,
  type CreateBookingInput,
  type ListBookingQuery,
} from "@/modules/bookings/booking.schema";

export const GET = defineRoute<unknown, ListBookingQuery>(
  { auth: true, querySchema: listBookingQuerySchema },
  async ({ query }) => {
    const { items, meta } = await bookingService.list(query);
    return ok(items, { meta });
  },
);

export const POST = defineRoute<CreateBookingInput>(
  { auth: true, bodySchema: createBookingSchema },
  async ({ body, user }) => created(await bookingService.create(body, user!.id)),
);
