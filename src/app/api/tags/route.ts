import { Tag } from "@/models";
import { tagSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: Tag,
  schema: tagSchema,
  slugFrom: "name",
  sort: { name: 1 },
  publicRead: true,
});
