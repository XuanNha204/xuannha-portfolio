import { Education } from "@/models";
import { educationSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Education,
  schema: educationSchema,
  dateFields: ["startDate", "endDate"],
});
