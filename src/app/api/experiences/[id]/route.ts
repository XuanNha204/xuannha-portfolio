import { Experience } from "@/models";
import { experienceSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Experience,
  schema: experienceSchema,
  dateFields: ["startDate", "endDate"],
});
