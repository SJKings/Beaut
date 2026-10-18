import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAdmin, passwordConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  await connection(); // always per-request: depends on the session cookie and ADMIN_PASSWORD
  if (await isAdmin()) redirect("/");
  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          Beaut<span className="dot">.</span> <span className="brand-sub">Studio</span>
        </div>
        {passwordConfigured() ? (
          <LoginForm />
        ) : (
          <p className="muted">
            Sign-in isn&apos;t set up yet. Add an <code>ADMIN_PASSWORD</code> environment variable to this deployment, then redeploy.
          </p>
        )}
      </div>
    </div>
  );
}
