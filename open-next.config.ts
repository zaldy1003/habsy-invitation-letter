import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No ISR or cached database responses; no R2 resource is required.
export default defineCloudflareConfig({});
