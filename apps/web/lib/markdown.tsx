import Markdown from "react-markdown";

export function MarkdownBody({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={["markdown-body", className].filter(Boolean).join(" ")}>
      <Markdown>{children}</Markdown>
    </div>
  );
}
