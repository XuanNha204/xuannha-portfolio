import { Certificate } from "@/models";
import { certificateSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";

export const { GET, POST } = createCollectionHandlers({
  model: Certificate,
  schema: certificateSchema,
  dateFields: ["issueDate"],
  sort: { order: 1, issueDate: -1 },
  publicRead: true,
});
