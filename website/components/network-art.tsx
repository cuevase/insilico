export default function NetworkArt() {
  const nodes = [
    [44, 205, 5], [102, 75, 5], [155, 248, 4], [207, 125, 6],
    [273, 39, 5], [310, 209, 6], [379, 93, 4], [427, 248, 5],
    [465, 143, 5],
  ]
  return (
    <svg className="network-art h-auto w-full overflow-visible" viewBox="0 0 510 300" role="img" aria-label="Scattered orange dots">
      {nodes.map(([x, y, radius], index) => (
        <circle key={index} cx={x} cy={y} r={radius} className={index === 1 || index === 3 || index === 5 || index === 8 ? 'network-node-strong' : 'network-node'} />
      ))}
    </svg>
  )
}
