import { Category } from "@/models";
import { categorySchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: Category,
  schema: categorySchema,
  slugFrom: "name",
  sort: { name: 1 },
  publicRead: true,
});
