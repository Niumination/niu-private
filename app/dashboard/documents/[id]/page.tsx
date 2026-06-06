import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import DocumentDetailClient from "./DocumentDetailClient";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");
  const { id } = await params;
  return <DocumentDetailClient id={id} />;
}
