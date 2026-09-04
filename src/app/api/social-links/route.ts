import { SocialLink } from "@/models/SocialLink";
import { socialLinkSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: SocialLink,
  schema: socialLinkSchema,
  sort: { order: 1 },
  publicRead: true,
});
