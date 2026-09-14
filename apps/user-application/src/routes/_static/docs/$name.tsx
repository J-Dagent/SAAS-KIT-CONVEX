import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Copy, Check } from "lucide-react";
import { DocsNavigation } from "@/components/docs/docs-navigation";

const loadMarkdown = createServerFn({ method: "GET" })
  .validator((name: string) => name)
  .handler(async ({ data: name }) => {
    if (!/^[a-z0-9-]+$/.test(name)) return null;

    const { getRequest } = await import("@tanstack/react-start/server");
    const response = await fetch(
      new URL(`/docs/${name}.md`, getRequest().url),
    );
    return response.ok ? await response.text() : null;
  });

export const Route = createFileRoute("/_static/docs/$name")({
  component: RouteComponent,
  loader: async (event) => {
    const markdown = await loadMarkdown({ data: event.params.name });
    if (markdown === null) throw notFound();
    return { markdown };
  },
});

const markdownStyles = {
  h1: "text-3xl sm:text-4xl font-bold tracking-tight mb-8",
  h2: "text-xl sm:text-2xl font-semibold mt-12 mb-4 border-b border-border pb-3",
  h3: "text-lg sm:text-xl font-medium mt-8 mb-3",
  p: "my-4 leading-7 text-sm sm:text-base text-foreground/90",
  a: "text-primary underline break-words",
  ul: "list-disc ml-4 sm:ml-6 my-2 text-sm sm:text-base",
  ol: "list-decimal ml-4 sm:ml-6 my-2 text-sm sm:text-base",
  li: "my-1",
  code: "bg-muted px-1.5 py-0.5 rounded font-mono text-xs sm:text-sm text-muted-foreground border border-border",
  pre: "bg-zinc-950 p-3 sm:p-5 rounded-b-lg overflow-x-auto text-xs sm:text-sm border border-zinc-800 text-zinc-100",
  blockquote:
    "border-l-4 border-primary pl-3 sm:pl-4 italic my-3 sm:my-4 text-sm sm:text-base",
};

function CodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const codeChild = Array.isArray(children) ? children[0] : children;
  const codeClassName = codeChild?.props?.className || "";
  const language = (
    codeClassName.match(/language-([a-z0-9+#-]+)/i)?.[1] || "text"
  ).toUpperCase();

  const extractText = (node: any): string => {
    if (typeof node === "string") return node;
    if (node?.props?.children) return extractText(node.props.children);
    if (Array.isArray(node)) return node.map(extractText).join("");
    return "";
  };

  const handleCopy = async () => {
    const codeText = extractText(codeChild ?? children);
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative my-4 group">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 backdrop-blur-sm border border-b-0 border-border rounded-t-lg">
        <span className="font-mono text-[10px] sm:text-xs tracking-wider uppercase text-muted-foreground">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-foreground bg-primary/10 hover:bg-primary/20 transition-colors"
          aria-label="Copy code"
          title={copied ? "Copied" : "Copy"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className={markdownStyles.pre + " rounded-t-none"} {...props}>
        {children}
      </pre>
    </div>
  );
}

function RouteComponent() {
  const { markdown: content } = Route.useLoaderData();
  const { name } = Route.useParams();

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-14">
      <DocsNavigation current={name} />
      <article className="min-w-0 max-w-4xl">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => (
              <h1 className={markdownStyles.h1}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className={markdownStyles.h2}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className={markdownStyles.h3}>{children}</h3>
            ),
            p: ({ children }) => <p className={markdownStyles.p}>{children}</p>,
            a: ({ href, children }) => {
              const external = href?.startsWith("http");
              return (
                <a
                  href={href}
                  className={markdownStyles.a}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              );
            },
            ul: ({ children }) => (
              <ul className={markdownStyles.ul}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className={markdownStyles.ol}>{children}</ol>
            ),
            li: ({ children }) => (
              <li className={markdownStyles.li}>{children}</li>
            ),
            code: ({ className, children, ...props }: any) =>
              !className || !className.includes("language-") ? (
                <code className={markdownStyles.code} {...props}>
                  {children}
                </code>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              ),
            pre: CodeBlock,
            blockquote: ({ children }) => (
              <blockquote className={markdownStyles.blockquote}>
                {children}
              </blockquote>
            ),
            br: () => <br className="my-2" />,
            hr: () => <hr className="my-9 border-border" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
