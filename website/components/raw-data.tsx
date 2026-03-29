'use client'

import { useState } from 'react'

interface ROIValue {
  name: string
  label: string
  value: number
}

interface RawDataProps {
  roiValues: ROIValue[]
  processingTime: number
  nTimepoints: number
  nVertices: number
}

export default function RawData({ roiValues, processingTime, nTimepoints, nVertices }: RawDataProps) {
  const [open, setOpen] = useState(false)

  function downloadCSV() {
    const header = 'ROI Name,Anatomical Label,Activation Value\n'
    const rows = roiValues.map((r) => `"${r.name}","${r.label}",${r.value.toFixed(4)}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'insilico-roi-values.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border-t border-border pt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-[#6B6459] hover:text-foreground transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06z"
            clipRule="evenodd"
          />
        </svg>
        View raw data
      </button>

      {open && (
        <div className="mt-5 animate-fade-in">
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#9C9488]">
            <span>Processing time: <strong className="text-[#6B6459]">{processingTime}s</strong></span>
            <span>Timepoints: <strong className="text-[#6B6459]">{nTimepoints}</strong></span>
            <span>Vertices: <strong className="text-[#6B6459]">{nVertices.toLocaleString()}</strong></span>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#EDE8DE]">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6B6459]">ROI</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-[#6B6459]">Label</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-[#6B6459]">Value</th>
                </tr>
              </thead>
              <tbody>
                {roiValues.map((roi, i) => (
                  <tr
                    key={roi.name}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-background' : 'bg-[#F9F6F0]'}`}
                  >
                    <td className="px-4 py-2.5 font-serif text-sm text-foreground">{roi.name}</td>
                    <td className="px-4 py-2.5 text-xs text-[#6B6459]">{roi.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sm text-foreground">
                      {roi.value.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={downloadCSV}
            className="mt-3 flex items-center gap-1.5 text-xs text-[#6B6459] hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75z" />
              <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5z" />
            </svg>
            Download CSV
          </button>
        </div>
      )}
    </div>
  )
}
