#!/usr/bin/env node
// Reproducible asset build: master SVG (src/icon.svg) + hand-built vector wordmark -> all rasters, ico, icns.
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const png2icons = require('png2icons')

const root = path.resolve(__dirname, '..')
const out = (...p) => path.join(root, ...p)
const NAVY = '#0B1220'
const CYAN = '#22D3EE'
const GREEN = '#34D399'

const iconSvg = fs.readFileSync(out('src', 'icon.svg'), 'utf8')
const inner = iconSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

// Monoline uppercase glyphs on a 32x40 grid (no font dependency)
const glyphs = {
  Z: 'M0 0H32L0 40H32',
  E: 'M32 0H0V40H32M0 20H26',
  R: 'M0 40V0H20A11 11 0 0 1 20 22H0M16 22L32 40',
  O: 'M12 0H20A12 12 0 0 1 32 12V28A12 12 0 0 1 20 40H12A12 12 0 0 1 0 28V12A12 12 0 0 1 12 0Z',
  D: 'M0 0V40H12A20 20 0 0 0 32 20A20 20 0 0 0 12 0Z',
  A: 'M0 40L16 0L32 40M6 26H26',
  Y: 'M0 0L16 20L32 0M16 20V40',
  T: 'M0 0H32M16 0V40',
  N: 'M0 40V0L32 40V0',
  U: 'M0 0V28A12 12 0 0 0 12 40H20A12 12 0 0 0 32 28V0',
  B: 'M0 0H20A10 10 0 0 1 20 20H0M0 0V40H21A10 10 0 0 0 21 20',
  I: 'M8 0H24M16 0V40M8 40H24',
  S: 'M32 5C28 1 22 0 16 0C0 0 0 20 16 20C32 20 32 40 16 40C10 40 4 39 0 35',
  C: 'M32 6C28 2 22 0 16 0C4 0 0 10 0 20C0 30 4 40 16 40C22 40 28 38 32 34',
  L: 'M0 0V40H32',
  '-': 'M4 20H28'
}

// Wordmark "ANUBIS-SECURITY-TOOL" on two lines, each line scaled to the same width
function textLine (text, color, accent, accentFrom, stroke) {
  let cx = 0
  let s = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    s += `<path d="${glyphs[ch]}" transform="translate(${cx} 0)" stroke="${i >= accentFrom ? accent : color}"/>`
    cx += ch === '-' ? 38 : 46
  }
  return { width: cx - 14, body: s, stroke }
}

function wordmark (x, y, availW, h, c1, c2) {
  const l1 = textLine('ANUBIS', c1, c1, 99, 4.5)
  const l2 = textLine('SECURITY-TOOL', c2, c2, 99, 6)
  const s1 = availW / l1.width
  const s2 = availW / l2.width
  const gap = 40
  const total = 40 * s1 + gap + 40 * s2
  const top = y + (h - total) / 2
  const g = (l, s, ty) => `<g transform="translate(${x} ${ty}) scale(${s})" fill="none" stroke-width="${l.stroke}" stroke-linecap="round" stroke-linejoin="round">${l.body}</g>`
  return { svg: g(l1, s1, top) + g(l2, s2, top + 40 * s1 + gap) }
}

const wrap = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
const logoGroup = (x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 512})">${inner}</g>`

function lockup (w, h, bg, opacity) {
  const iconSize = h * 0.72
  const pad = h * 0.14
  const wm = wordmark(pad * 2 + iconSize, 0, w - pad * 3 - iconSize, h, bg ? '#FFFFFF' : '#E6EDF7', CYAN)
  const plate = bg ? `<rect width="${w}" height="${h}" rx="${h * 0.12}" fill="${NAVY}"/>` : ''
  return wrap(w, h, `<g opacity="${opacity}">${plate}${logoGroup(pad, (h - iconSize) / 2, iconSize)}${wm.svg}</g>`)
}

function roundIcon (size) {
  const s = size * 0.72
  return wrap(size, size, `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${NAVY}"/>${logoGroup((size - s) / 2, (size - s) / 2, s)}`)
}

const svgOf = (svg) => Buffer.from(svg)
const png = async (svg, w, h, file) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await sharp(svgOf(svg), { density: 300 }).resize(w, h).png({ compressionLevel: 9 }).toFile(file)
}
const square = (size) => wrap(size, size, logoGroup(0, 0, size))

async function main () {
  const icon = square(1024)
  for (const n of [16, 24, 32, 48, 64, 128, 256, 512, 1024]) {
    await png(icon, n, n, out('build-res', 'linux', `${n}x${n}.png`))
  }
  await png(icon, 150, 150, out('build-res', 'appx', 'Square150x150Logo.png'))
  await png(icon, 44, 44, out('build-res', 'appx', 'Square44x44Logo.png'))
  await png(icon, 1080, 1080, out('build-res', 'appx', 'StoreLogo.png'))
  await png(lockup(1240, 600, true, 1), 310, 150, out('build-res', 'appx', 'Wide310x150Logo.png'))

  await png(lockup(1532, 532, true, 1), 766, 266, out('res', 'imgs', 'electerm.png'))
  await png(lockup(1532, 532, false, 0.45), 766, 266, out('res', 'imgs', 'electerm-watermark.png'))
  await png(roundIcon(1532), 766, 766, out('res', 'imgs', 'electerm-round-128x128.png'))
  fs.writeFileSync(out('res', 'imgs', 'electerm.svg'), lockup(766, 266, true, 1))

  const master = fs.readFileSync(out('build-res', 'linux', '1024x1024.png'))
  const ico = png2icons.createICO(master, png2icons.BICUBIC2, 0, false, true)
  const icns = png2icons.createICNS(master, png2icons.BICUBIC2, 0)
  if (!ico || !icns) throw new Error('icon conversion failed')
  fs.mkdirSync(out('build'), { recursive: true })
  fs.writeFileSync(out('build', 'icons-win.ico'), ico)
  fs.writeFileSync(out('build', 'icons.ico'), ico)
  fs.writeFileSync(out('build', 'icons.icns'), icns)
  console.log('assets built')
}

module.exports = { inner, wordmark, wrap, logoGroup, NAVY, CYAN, GREEN }

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1) })
}
