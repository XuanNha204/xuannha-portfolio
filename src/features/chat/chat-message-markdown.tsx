"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

interface ChatMessageMarkdownProps {
  content: string;
  onInternalNavigate: () => void;
}

function ChatMessageMarkdownComponent({
  content,
  onInternalNavigate,
}: ChatMessageMarkdownProps) {
  const components = useMemo<Components>(
    () => ({
      a({ href, children }) {
        const url = href ?? "#";
        if (url.startsWith("/")) {
          return (
            <Link
              href={url}
              onClick={onInternalNavigate}
              className="font-medium text-accent underline underline-offset-2"
            >
              {children}
            </Link>
          );
        }
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline underline-offset-2"
          >
            {children}
          </a>
        );
      },
      p({ children }) {
        return <p className="mb-2 last:mb-0">{children}</p>;
      },
      ul({ children }) {
        return <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>;
      },
      code({ children }) {
        return <code className="rounded bg-border/60 px-1 py-0.5 text-xs">{children}</code>;
      },
    }),
    [onInternalNavigate]
  );

  return (
    <div className="prose-chat">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(ChatMessageMarkdownComponent);
