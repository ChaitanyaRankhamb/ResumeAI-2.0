"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language = "javascript", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-zinc-950 font-mono text-sm text-zinc-50",
        className
      )}
    >
      {/* Copy Button */}
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={copyToClipboard}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-50"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Language Label */}
      {language && (
        <div className="px-4 pt-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {language}
        </div>
      )}

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.9rem",
        }}
        codeTagProps={{
          style: {
            fontFamily: "inherit",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}