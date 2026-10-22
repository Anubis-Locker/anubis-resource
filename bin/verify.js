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
for (const size of [16, 24, 32, 48, 64, 128, 256, 512]) {
  inventory[`res/icons/linux/${size}x${size}.png`] = [size, size]
}
Object.assign(inventory, {
  'res/icons/win/icon.ico': null,
  'res/icons/mac/icon.icns': null,
  'res/icons/tray/tray-16.png': [16, 16],
  'res/icons/tray/tray-16@2x.png': [32, 32],
  'res/icons/tray/tray-32.png': [32, 32],
  'res/icons/tray/tray-32@2x.png': [64, 64],
  'res/icons/nsis/installerHeader.bmp': null,
  'res/icons/nsis/installerSidebar.bmp': null,
  'res/icons/nsis/uninstallerSidebar.bmp': null
})

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
  for (const [name, width, height] of [
    ['installerHeader.bmp', 150, 57],
    ['installerSidebar.bmp', 164, 314],
    ['uninstallerSidebar.bmp', 164, 314]
  ]) {
    const bitmap = fs.readFileSync(path.join(root, 'res', 'icons', 'nsis', name))
    if (bitmap.toString('ascii', 0, 2) !== 'BM' ||
        bitmap.readInt32LE(18) !== width || bitmap.readInt32LE(22) !== height ||
        bitmap.readUInt16LE(28) !== 24) {
      console.log('BAD NSIS BITMAP', name)
      bad++
    }
  }
  console.log(bad ? `FAILED (${bad})` : `OK: ${Object.keys(inventory).length} files match inventory`)
  process.exit(bad ? 1 : 0)
}
main()
