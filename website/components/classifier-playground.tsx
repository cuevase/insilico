"use client"

import { useState } from "react"

const EXAMPLE_INPUTS = [
  { text: "Why don't scientists trust atoms? Because they make up everything!", expected: "humor" },
  { text: "The average human body contains approximately 206 bones.", expected: "neutral" },
  { text: "I told my wife she was drawing her eyebrows too high. She looked surprised.", expected: "humor" },
  { text: "Water boils at 100 degrees Celsius at standard atmospheric pressure.", expected: "neutral" },
]

function mockClassify(text: string): { label: string; confidence: number; features: Record<string, number> } {
  const humorSignals = [
    /why\s+(did|do|don't|does)/i,
    /\?.*!/,
    /told\s+my/i,
    /walk(s|ed)?\s+into/i,
    /knock\s+knock/i,
    /what('s|s|\s+is|do)/i,
  ]
  let score = 0.5
  for (const re of humorSignals) {
    if (re.test(text)) score += 0.12
  }
  if (text.includes("!")) score += 0.05
  if (text.includes("?")) score += 0.03
  if (text.length < 50) score += 0.02
  if (text.length > 200) score -= 0.05
  const words = text.split(/\s+/).length
  if (words < 15) score += 0.03
  score = Math.min(Math.max(score + (Math.random() - 0.5) * 0.08, 0.05), 0.95)
  const isHumor = score > 0.5

  return {
    label: isHumor ? "Humor" : "Neutral",
    confidence: isHumor ? score : 1 - score,
    features: {
      "TPJ activation": +(0.3 + Math.random() * 0.4).toFixed(3),
      "STS activation": +(0.2 + Math.random() * 0.5).toFixed(3),
      "mPFC activation": +(0.25 + Math.random() * 0.35).toFixed(3),
      "IFG activation": +(0.15 + Math.random() * 0.45).toFixed(3),
    },
  }
}

export default function ClassifierPlayground() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<ReturnType<typeof mockClassify> | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  async function handleClassify() {
    if (!input.trim()) return
    setIsRunning(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
    setResult(mockClassify(input))
    setIsRunning(false)
  }

  function handleExample(text: string) {
    setInput(text)
    setResult(null)
  }

  return (
    <div className="rounded-md border border-border bg-background p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-[#9C9488] mb-1">Try it</p>
        <p className="text-sm text-[#6B6459]">
          Enter a sentence to see how the classifier would label it. This is a simplified demo — the
          real classifier runs on 20,484-dimensional brain activation vectors.
        </p>
      </div>

      <div className="mb-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a sentence..."
          rows={2}
          className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-[#C8C2B8] focus:border-[#C4704B] focus:outline-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_INPUTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleExample(ex.text)}
              className="text-xs text-[#6B6459] border border-border rounded px-2 py-1 hover:border-[#C4704B]/40 hover:text-[#C4704B] transition-colors"
            >
              {ex.expected === "humor" ? "🎭" : "📄"} Example {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={handleClassify}
          disabled={!input.trim() || isRunning}
          className="shrink-0 rounded-md bg-[#C4704B] px-4 py-2 text-sm font-medium text-white hover:bg-[#A85D3D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? "Classifying..." : "Classify"}
        </button>
      </div>

      {result && (
        <div className="animate-fade-in border-t border-border pt-4">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-sm font-semibold"
              style={{
                backgroundColor: result.label === "Humor" ? "rgba(231, 76, 60, 0.1)" : "rgba(52, 152, 219, 0.1)",
                color: result.label === "Humor" ? "#E74C3C" : "#3498DB",
              }}
            >
              {result.label === "Humor" ? "🎭" : "📄"} {result.label}
            </span>
            <span className="text-sm tabular-nums text-[#6B6459]">
              {(result.confidence * 100).toFixed(1)}% confidence
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(result.features).map(([name, value]) => (
              <div key={name} className="rounded border border-border/50 px-3 py-2">
                <p className="text-[10px] text-[#9C9488] uppercase tracking-wider mb-0.5">{name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
                  <div className="flex-1 h-1 rounded-full bg-[#EDE8DE] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C4704B] transition-all duration-500"
                      style={{ width: `${(value as number) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-[#9C9488] mt-3">
            Note: This demo uses heuristic approximations. Real predictions require running TRIBE v2 to generate brain
            activation patterns, then applying the trained logistic regression classifier.
          </p>
        </div>
      )}
    </div>
  )
}
