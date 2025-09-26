import { getServerSession as getSimpleAuthSession } from "@/lib/simple-auth"

export async function getServerSession() {
  return getSimpleAuthSession()
}
