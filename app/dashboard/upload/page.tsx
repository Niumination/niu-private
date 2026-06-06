import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import UploadClient from "./UploadClient";

export default async function UploadPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");
  return <UploadClient />;
}
