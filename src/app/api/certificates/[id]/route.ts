import { Certificate } from "@/models";
import { certificateSchema } from "@/schemas";
import { createItemHandlers } from "@/lib/crud-factory";

export const { GET, PUT, DELETE } = createItemHandlers({
  model: Certificate,
  schema: certificateSchema,
  dateFields: ["issueDate"],
});
