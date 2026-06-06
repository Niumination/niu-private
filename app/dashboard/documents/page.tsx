import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");
  return <DocumentsClient />;
}
