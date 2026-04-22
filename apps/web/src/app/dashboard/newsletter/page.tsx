import { getNewsletterConfig } from "@/lib/newsletter-server"
import { NewsletterClient } from "./newsletter-client"

export const metadata = {
  title: "Newsletter Config",
}

export default async function NewsletterPage() {
  const config = await getNewsletterConfig()
  
  return <NewsletterClient config={config} />
}
