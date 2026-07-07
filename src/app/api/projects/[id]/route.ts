import { Project } from "@/models";
import { projectSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Project,
  schema: projectSchema,
  slugFrom: "title",
  dateFields: ["completedAt"],
});
