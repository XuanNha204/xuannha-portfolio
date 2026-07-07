"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/fetcher";

/**
 * Generic CRUD hook for simple admin resources
 * (skills, experiences, educations, certificates, social links, categories...).
 */
export function useCrud<T extends { _id: string }>(resource: string) {
  const queryClient = useQueryClient();
  const queryKey = [resource];

  const list = useQuery({
    queryKey,
    queryFn: () => apiGet<T[]>(`/api/${resource}`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const create = useMutation({
    mutationFn: (data: Partial<T>) => apiPost<T>(`/api/${resource}`, data),
    onSuccess: () => {
      toast.success("Đã tạo thành công");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
      apiPut<T>(`/api/${resource}/${id}`, data),
    onSuccess: () => {
      toast.success("Đã cập nhật");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete<{ success: boolean }>(`/api/${resource}/${id}`),
    onSuccess: () => {
      toast.success("Đã xóa");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { list, create, update, remove };
}
