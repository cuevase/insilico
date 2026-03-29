'use client'

import { useState, useRef } from 'react'
import Navbar from '@/components/navbar'
import TextInput from '@/components/text-input'
import PredictButton from '@/components/predict-button'
import LoadingBar from '@/components/loading-bar'
import ResultsView from '@/components/results-view'

interface PredictionResult {
  brain_images: {
    left_lateral: string
    right_lateral: string
    left_medial: string
    right_medial: string
  }
  roi_values: Array<{ name: string; label: string; value: number }>
  processing_time_seconds: number
  n_timepoints: number
  n_vertices: number
}

export default function HomePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  async function handlePredict() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setLastQuery(text.trim())

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Prediction failed.')
      }

      const data: PredictionResult = await res.json()
      setResult(data)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handlePredict()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6">
        {/* Hero */}
        <div className="pt-24 pb-14 text-center">
          <h1 className="font-serif text-5xl font-medium text-foreground leading-tight tracking-tight text-balance mb-5 md:text-6xl">
            See what the brain hears.
          </h1>
          <p className="text-lg text-[#6B6459] leading-relaxed max-w-md mx-auto">
            Type anything. We&apos;ll show you which brain regions respond.
          </p>
        </div>

        {/* Input area */}
        <div className="mx-auto max-w-2xl" onKeyDown={handleKeyDown}>
          <TextInput
            value={text}
            onChange={setText}
            disabled={loading}
          />

          <LoadingBar visible={loading} />

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-[#9C9488]">
              {loading ? 'Running prediction...' : text.trim() ? 'Press ⌘↵ or click Predict' : ''}
            </p>
            <PredictButton
              loading={loading}
              disabled={!text.trim()}
              onClick={handlePredict}
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-700 animate-fade-in">{error}</p>
          )}
        </div>

        {/* Results */}
        <div ref={resultsRef} className="pb-24">
          {result && !loading && (
            <ResultsView result={result} query={lastQuery} />
          )}
        </div>
      </main>
    </div>
  )
}
