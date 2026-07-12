import { z } from "zod";

export const notificationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  unread: z.enum(["true", "false"]).optional(),
});
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
