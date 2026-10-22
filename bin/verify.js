#!/usr/bin/env node
// Compares generated files + PNG dimensions with the original @electerm/electerm-resource@2.2.1 inventory.
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const root = path.resolve(__dirname, '..')
const inventory = {
  'build/icons-win.ico': null,
  'build/icons.icns': null,
  'build/icons.ico': null,
  'build-res/appx/Square150x150Logo.png': [150, 150],
  'build-res/appx/Square44x44Logo.png': [44, 44],
  'build-res/appx/StoreLogo.png': [1080, 1080],
  'build-res/appx/Wide310x150Logo.png': [310, 150],
  'build-res/linux/1024x1024.png': [1024, 1024],
  'build-res/linux/128x128.png': [128, 128],
  'build-res/linux/16x16.png': [16, 16],
  'build-res/linux/24x24.png': [24, 24],
  'build-res/linux/256x256.png': [256, 256],
  'build-res/linux/32x32.png': [32, 32],
  'build-res/linux/48x48.png': [48, 48],
  'build-res/linux/512x512.png': [512, 512],
  'build-res/linux/64x64.png': [64, 64],
  'res/imgs/electerm-round-128x128.png': [766, 766],
  'res/imgs/electerm-watermark.png': [766, 266],
  'res/imgs/electerm.png': [766, 266],
  'res/imgs/electerm.svg': null
}

async function main () {
  let bad = 0
  for (const [rel, dim] of Object.entries(inventory)) {
    const f = path.join(root, rel)
    if (!fs.existsSync(f) || fs.statSync(f).size === 0) { console.log('MISSING', rel); bad++; continue }
    if (dim) {
      const m = await sharp(f).metadata()
      if (m.width !== dim[0] || m.height !== dim[1]) { console.log('DIM MISMATCH', rel, `${m.width}x${m.height}`, 'expected', dim.join('x')); bad++ }
    }
  }
  const ico = fs.readFileSync(path.join(root, 'build/icons-win.ico'))
  if (ico.readUInt16LE(2) !== 1) { console.log('BAD ICO'); bad++ }
  const icns = fs.readFileSync(path.join(root, 'build/icons.icns'))
  if (icns.toString('ascii', 0, 4) !== 'icns') { console.log('BAD ICNS'); bad++ }
  console.log(bad ? `FAILED (${bad})` : `OK: ${Object.keys(inventory).length} files match inventory`)
  process.exit(bad ? 1 : 0)
}
main()
