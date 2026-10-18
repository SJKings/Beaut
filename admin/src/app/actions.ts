"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, startSession } from "@/lib/auth";

export async function login(_prev: { error: string } | null, form: FormData) {
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "That password isn't right." };
  await startSession();
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
