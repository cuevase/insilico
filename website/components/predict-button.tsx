'use client'

interface PredictButtonProps {
  loading: boolean
  disabled: boolean
  onClick: () => void
}

export default function PredictButton({ loading, disabled, onClick }: PredictButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="
        flex items-center gap-2.5
        rounded-md bg-[#E8E0D0] px-7 py-3
        text-sm font-medium text-[#1A1A1A]
        hover:bg-[#DDD5C4]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-[#E8E0D0] focus:ring-offset-2 focus:ring-offset-background
      "
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {loading ? 'Predicting...' : 'Predict'}
    </button>
  )
}
