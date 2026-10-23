#!/usr/bin/env node
// Brand icon set for electron-builder / tray / NSIS, generated from src/icon.svg.
// Output: res/icons/{win,mac,linux,tray,nsis}. Run: node bin/build-brand-icons.js
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const png2icons = require('png2icons')
const { wordmark, wrap, logoGroup, NAVY, CYAN } = require('./build-assets')

const root = path.resolve(__dirname, '..')
const out = (...p) => path.join(root, 'res', 'icons', ...p)
const mk = (f) => { fs.mkdirSync(path.dirname(f), { recursive: true }); return f }

const squareSvg = (size) => wrap(size, size, logoGroup(0, 0, size))
const renderPng = (svg, w, h) => sharp(Buffer.from(svg), { density: 300 }).resize(w, h).png({ compressionLevel: 9 }).toBuffer()
const iconPng = (n) => renderPng(squareSvg(1024), n, n)

// 24-bit bottom-up BMP, the only bitmap flavour NSIS MUI accepts
function toBmp (rgb, w, h) {
  const rowSize = Math.ceil((w * 3) / 4) * 4
  const buf = Buffer.alloc(54 + rowSize * h)
  buf.write('BM', 0)
  buf.writeUInt32LE(buf.length, 2)
  buf.writeUInt32LE(54, 10)
  buf.writeUInt32LE(40, 14)
  buf.writeInt32LE(w, 18)
  buf.writeInt32LE(h, 22)
  buf.writeUInt16LE(1, 26)
  buf.writeUInt16LE(24, 28)
  buf.writeUInt32LE(rowSize * h, 34)
  for (let y = 0; y < h; y++) {
    const dst = 54 + (h - 1 - y) * rowSize
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 3
      buf[dst + x * 3] = rgb[s + 2]
      buf[dst + x * 3 + 1] = rgb[s + 1]
      buf[dst + x * 3 + 2] = rgb[s]
    }
  }
  return buf
}

async function bmp (svg, w, h, file) {
  const { data } = await sharp(Buffer.from(svg), { density: 300 })
    .resize(w, h).flatten({ background: NAVY }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  fs.writeFileSync(mk(file), toBmp(data, w, h))
}

function headerSvg () {
  const w = 600
  const h = 228
  const icon = 168
  const wm = wordmark(24 + icon + 28, 0, w - icon - 24 - 28 - 24, h, '#FFFFFF', CYAN)
  return wrap(w, h, `<rect width="${w}" height="${h}" fill="${NAVY}"/>${logoGroup(24, (h - icon) / 2, icon)}${wm.svg}`)
}

function sidebarSvg () {
  const w = 656
  const h = 1256
  const wm = wordmark(48, 820, w - 96, 300, '#FFFFFF', CYAN)
  return wrap(w, h, `<rect width="${w}" height="${h}" fill="${NAVY}"/>${logoGroup(88, 160, 480)}${wm.svg}`)
}

async function main () {
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
  const master = await iconPng(1024)

  // Windows
  const ico = png2icons.createICO(master, png2icons.BICUBIC2, 0, false, true)
  if (!ico) throw new Error('ico failed')
  fs.writeFileSync(mk(out('win', 'icon.ico')), ico)

  // macOS: iconset PNGs (+ icns when png2icons succeeds)
  const set = [[16, 1], [16, 2], [32, 1], [32, 2], [128, 1], [128, 2], [256, 1], [256, 2], [512, 1], [512, 2]]
  for (const [n, k] of set) {
    fs.writeFileSync(mk(out('mac', 'icon.iconset', `icon_${n}x${n}${k === 2 ? '@2x' : ''}.png`)), await iconPng(n * k))
  }
  const icns = png2icons.createICNS(master, png2icons.BICUBIC2, 0)
  if (!icns) throw new Error('icns failed')
  fs.writeFileSync(mk(out('mac', 'icon.icns')), icns)

  // Linux
  for (const n of sizes.filter(s => s <= 512)) {
    fs.writeFileSync(mk(out('linux', `${n}x${n}.png`)), await iconPng(n))
  }

  // Tray
  for (const [name, n] of [['tray-16.png', 16], ['tray-16@2x.png', 32], ['tray-32.png', 32], ['tray-32@2x.png', 64]]) {
    fs.writeFileSync(mk(out('tray', name)), await iconPng(n))
  }

  // NSIS (BMP 24-bit)
  await bmp(headerSvg(), 150, 57, out('nsis', 'installerHeader.bmp'))
  await bmp(sidebarSvg(), 164, 314, out('nsis', 'installerSidebar.bmp'))
  await bmp(sidebarSvg(), 164, 314, out('nsis', 'uninstallerSidebar.bmp'))
  console.log('brand icons built')
}

main().catch(e => { console.error(e); process.exit(1) })
