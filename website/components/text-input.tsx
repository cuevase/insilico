'use client'

import { useRef, useEffect } from 'react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  maxChars?: number
}

export default function TextInput({ value, onChange, disabled = false, maxChars = 1000 }: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxChars}
        placeholder="Type or paste text here..."
        rows={4}
        className="
          w-full resize-none rounded-md border border-border bg-background px-5 py-4
          text-base text-foreground leading-relaxed
          placeholder:text-[#9C9488]
          focus:outline-none focus:ring-1 focus:ring-[#C4704B] focus:border-[#C4704B]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          min-h-[120px]
          pr-5 pb-8
        "
        style={{ overflow: 'hidden' }}
      />
      <span className="absolute bottom-3 right-4 text-xs text-[#9C9488] select-none tabular-nums">
        {value.length}/{maxChars}
      </span>
    </div>
  )
}
