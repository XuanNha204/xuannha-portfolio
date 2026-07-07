import { Category } from "@/models";
import { categorySchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Category,
  schema: categorySchema,
  slugFrom: "name",
});
