import { SocialLink } from "@/models";
import { socialLinkSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: SocialLink,
  schema: socialLinkSchema,
});
