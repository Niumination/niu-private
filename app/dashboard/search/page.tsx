import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");
  return <SearchClient />;
}
