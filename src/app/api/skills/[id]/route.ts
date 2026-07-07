import { Skill } from "@/models";
import { skillSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Skill,
  schema: skillSchema,
});
