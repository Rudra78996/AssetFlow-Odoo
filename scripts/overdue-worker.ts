/**
 * Standalone overdue worker. Runs node-cron and hits the internal endpoint (or
 * calls the service directly) to flip past-due ACTIVE allocations to OVERDUE and
 * notify recipients. Run with: npm run worker:overdue
 */
import cron from "node-cron";
import { allocationService } from "../src/modules/allocations/allocation.service";
import { logger } from "../src/lib/logger";

const SCHEDULE = process.env.OVERDUE_CRON ?? "0 * * * *"; // hourly

async function run() {
  const { flagged } = await allocationService.flagOverdue();
  logger.info({ flagged }, "overdue sweep complete");
}

logger.info({ schedule: SCHEDULE }, "overdue worker started");
cron.schedule(SCHEDULE, () => {
  run().catch((err) => logger.error({ err }, "overdue sweep failed"));
});

// Run once immediately on boot so a fresh deploy reconciles state.
run().catch((err) => logger.error({ err }, "initial overdue sweep failed"));
