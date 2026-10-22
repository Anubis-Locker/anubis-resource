# @ai-security-tool/resource

Original Anubis-Security-Tool artwork (MIT). Not derived from electerm logos. Same layout and filenames as `@electerm/electerm-resource@2.2.1`, so it is a drop-in replacement.

Design: navy `#0B1220` shield with cyan `#22D3EE`→green `#34D399` outline containing a stylised geometric jackal (Anubis) head; vector two-line "ANUBIS / SECURITY-TOOL" wordmark (monoline paths, no font dependency).

## Build / verify
```
npm install
npm run build     # bin/build-assets.js from src/icon.svg
npm run verify    # file list + dimensions vs original inventory
```

## Asset → usage
| File | Size | Usage |
|---|---|---|
| res/imgs/electerm.png | 766x266 | Logo lockup (about/welcome) |
| res/imgs/electerm.svg | 766x266 | Vector lockup |
| res/imgs/electerm-watermark.png | 766x266 | Semi-transparent watermark |
| res/imgs/electerm-round-128x128.png | 766x766 | Round app icon (window/tray/web) |
| build/icons-win.ico, build/icons.ico | multi-size | Windows exe/installer |
| build/icons.icns | multi-size | macOS |
| build-res/linux/{16,24,32,48,64,128,256,512,1024}x*.png | square | Linux packages |
| build-res/appx/Square150x150Logo.png, Square44x44Logo.png, StoreLogo.png (1080), Wide310x150Logo.png | as named | Windows Store/appx |

The original package contains no tray-icons or harmony/static folders; none are generated.
