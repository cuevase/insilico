interface LoadingBarProps {
  visible: boolean
}

export default function LoadingBar({ visible }: LoadingBarProps) {
  if (!visible) return null
  return (
    <div className="w-full overflow-hidden rounded-full bg-[#EDE8DE] h-0.5">
      <div
        className="h-full w-1/2 rounded-full bg-[#C4704B] animate-loading-bar"
      />
    </div>
  )
}
