import { AppShellClient } from "./app-shell-client";

export const dynamic = "force-dynamic";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}
