import { Experience } from "@/models";
import { experienceSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: Experience,
  schema: experienceSchema,
  dateFields: ["startDate", "endDate"],
  sort: { order: 1, startDate: -1 },
  publicRead: true,
});
