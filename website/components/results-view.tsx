import BrainViewer from './brain-viewer'
import ROISummary from './roi-summary'
import RawData from './raw-data'

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

interface ResultsViewProps {
  result: PredictionResult
  query: string
}

export default function ResultsView({ result, query }: ResultsViewProps) {
  return (
    <section className="mt-16 animate-fade-in" aria-label="Prediction results">
      <div className="border-t border-border pt-10">
        {/* Query echo */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[#9C9488] mb-2">Input</p>
          <p className="font-serif text-base text-[#6B6459] leading-relaxed italic max-w-2xl">
            &ldquo;{query}&rdquo;
          </p>
        </div>

        {/* Brain visualization */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-[#9C9488] mb-6">
            Cortical activation
          </p>
          <BrainViewer images={result.brain_images} />
        </div>

        {/* ROI summary */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-[#9C9488] mb-6">
            Region of interest summary
          </p>
          <ROISummary roiValues={result.roi_values} />
        </div>

        {/* Raw data */}
        <RawData
          roiValues={result.roi_values}
          processingTime={result.processing_time_seconds}
          nTimepoints={result.n_timepoints}
          nVertices={result.n_vertices}
        />
      </div>
    </section>
  )
}
