import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdmin } from "@/lib/auth";
import { Dashboard } from "./Dashboard";

export default async function Home() {
  await connection(); // always per-request: depends on the session cookie and ADMIN_PASSWORD
  if (!(await isAdmin())) redirect("/login");
  return <Dashboard />;
}
