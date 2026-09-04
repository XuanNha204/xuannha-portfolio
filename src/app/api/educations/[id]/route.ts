import { Education } from "@/models/Education";
import { educationSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Education,
  schema: educationSchema,
  dateFields: ["startDate", "endDate"],
});
