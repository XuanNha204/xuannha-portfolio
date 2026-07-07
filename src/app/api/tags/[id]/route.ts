import { Tag } from "@/models";
import { tagSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Tag,
  schema: tagSchema,
  slugFrom: "name",
});
