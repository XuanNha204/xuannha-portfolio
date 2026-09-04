import { Skill } from "@/models/Skill";
import { skillSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Skill,
  schema: skillSchema,
});
