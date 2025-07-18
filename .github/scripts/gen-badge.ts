import { writeFile } from "fs/promises";

function createBadge(label: string, value: string, leftColor: string, rightColor: string): string {
  // 宽度自适应，预留空间
  const leftWidth = Math.max(70, label.length * 14); // 左侧宽度（彩色）
  const rightWidth = Math.max(50, value.length * 14); // 右侧宽度（灰色）
  const width = leftWidth + rightWidth;
  const height = 20;
  const rx = 4;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <defs>
    <linearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="100%">
      <stop offset="0%" stop-color="${leftColor}" />
      <stop offset="100%" stop-color="${darken(leftColor, 0.3)}" />
    </linearGradient>
    <linearGradient id="rightGrad" x1="0" y1="0" x2="0" y2="100%">
      <stop offset="0%" stop-color="${rightColor}" />
      <stop offset="100%" stop-color="${darken(rightColor, 0.3)}" />
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="100%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.3" />
      <stop offset="100%" stop-opacity="0" />
    </linearGradient>
  </defs>
  <mask id="mask">
    <rect width="${width}" height="${height}" rx="${rx}" fill="#fff" />
  </mask>
  <g mask="url(#mask)">
    <rect width="${leftWidth}" height="${height}" fill="url(#leftGrad)" />
    <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="url(#rightGrad)" />
    <rect width="${width}" height="${height}" fill="url(#shine)" />
  </g>
  <g fill="#fff" font-family="'DejaVu Sans', Verdana, Geneva, sans-serif" font-size="11" text-anchor="middle" style="font-weight:600;">
    <text x="${leftWidth / 2}" y="14" fill="#010101" fill-opacity="0.3">${label}</text>
    <text x="${leftWidth / 2}" y="13">${label}</text>
    <text x="${leftWidth + rightWidth / 2}" y="14" fill="#010101" fill-opacity="0.3">${value}</text>
    <text x="${leftWidth + rightWidth / 2}" y="13">${value}</text>
  </g>
</svg>
`.trim();
}

// 简单的颜色暗化函数，返回更暗的颜色十六进制字符串
function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const args = process.argv.slice(2);
const [label, value, leftColor, rightColor, output] = args;
if (!label || !value || !leftColor || !rightColor || !output) {
  console.error("Usage: bun gen-badge.ts <label> <value> <leftColor> <rightColor> <output.svg>");
  process.exit(1);
}

await writeFile(output, createBadge(label, value, leftColor, rightColor));
console.log(`Generated ${output}`);
