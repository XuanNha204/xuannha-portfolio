import { notFound } from "next/navigation";
import { getPostById } from "@/services/blog.service";
import { PostForm } from "@/features/admin/posts/post-form";

export const metadata = { title: "Sửa bài viết" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return <PostForm post={post} />;
}
