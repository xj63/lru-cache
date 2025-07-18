// .github/scripts/gen-badge.ts
import { writeFile } from "fs/promises"

function createBadge(label: string, value: string, color: string): string {
  const labelWidth = 60
  const valueWidth = 50 + value.length * 20
  const width = labelWidth + valueWidth
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset="1" stop-opacity=".7"/>
  </linearGradient>
  <mask id="m"><rect width="${width}" height="20" rx="3" fill="#fff"/></mask>
  <g mask="url(#m)">
    <rect width="${labelWidth}" height="20" fill="${color}"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#555"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana" font-size="11">
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>
`.trim()
}

const args = process.argv.slice(2)
const [label, value, color, output] = args
if (!label || !value || !color || !output) {
  console.error("Usage: bun gen-badge.ts <label> <value> <color> <output.svg>")
  process.exit(1)
}

await writeFile(output, createBadge(label, value, color))
console.log(`Generated: ${output}`)
