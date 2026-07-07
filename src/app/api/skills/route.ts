import { Skill } from "@/models";
import { skillSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: Skill,
  schema: skillSchema,
  sort: { order: 1, level: -1 },
  publicRead: true,
});
