import { writeFile } from "fs/promises";

function createBadge(label: string, value: string, color: string): string {
  // 计算宽度，预留字符宽度和一定边距
  const leftWidth = Math.max(56, label.length * 14);
  const rightWidth = Math.max(60, value.length * 14);
  const width = leftWidth + rightWidth;
  const height = 20;
  const rx = 6;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <defs>
    <linearGradient id="${label}Grad" x2="0" y2="100%">
      <stop offset="0" stop-color="#fff" stop-opacity=".2"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.15"/>
    </filter>
  </defs>
  <mask id="${label}Mask"><rect width="${width}" height="${height}" rx="${rx}" fill="#fff"/></mask>
  <g mask="url(#${label}Mask)">
    <rect width="${leftWidth}" height="${height}" fill="${color}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="#555"/>
    <rect width="${width}" height="${height}" fill="url(#${label}Grad)"/>
    <rect x="1" y="1" width="${leftWidth - 2}" height="${height - 2}" rx="${rx - 1}" fill="none" stroke="rgba(255,255,255,0.3)" />
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="600" filter="url(#shadow)" >
    <text x="${leftWidth / 2}" y="14">${label}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14">${value}</text>
  </g>
</svg>
`.trim();
}

const args = process.argv.slice(2);
const [label, value, color, output] = args;
if (!label || !value || !color || !output) {
  console.error("Usage: bun gen-badge.ts <label> <value> <color> <output.svg>");
  process.exit(1);
}

await writeFile(output, createBadge(label, value, color));
console.log(`Generated ${output}`);
