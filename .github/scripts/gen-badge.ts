import { writeFile } from "fs/promises"

function createBadge(label: string, value: string, color: string): string {
  // 根据字符长度算宽度，避免过窄或过宽
  const leftWidth = Math.max(44, label.length * 14) // 左侧灰色宽度
  const rightWidth = Math.max(54, value.length * 14) // 右侧彩色宽度
  const width = leftWidth + rightWidth
  const height = 20

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="${label}Grad" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="${label}Mask"><rect width="${width}" height="${height}" rx="3" fill="#fff"/></mask>
  <g mask="url(#${label}Mask)">
    <rect width="${leftWidth}" height="${height}" fill="#555"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="${color}"/>
    <rect width="${width}" height="${height}" fill="url(#${label}Grad)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" font-size="11">
    <text x="${leftWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${leftWidth / 2}" y="14">${label}</text>
    <text x="${leftWidth + rightWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${value}</text>
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
console.log(`Generated ${output}`)
