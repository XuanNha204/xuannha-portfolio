import { Education } from "@/models/Education";
import { educationSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: Education,
  schema: educationSchema,
  dateFields: ["startDate", "endDate"],
  sort: { order: 1, startDate: -1 },
  publicRead: true,
});
