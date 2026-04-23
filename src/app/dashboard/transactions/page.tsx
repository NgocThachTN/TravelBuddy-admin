import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function TransactionsPage() {
  redirect(ROUTES.TRANSACTIONS_USER_TRANSACTIONS);
}
