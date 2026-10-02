# Szcenárió Pro desktop (Tauri)

A Pro / Enterprise csomag helyi motorja: ugyanaz a statikus frontend, IndexedDB a webes motorhoz, opcionális SQLite a Tauri oldalon. Nincs felhő-adatbázis.

## Előfeltétel

- Rust (`rustup`)
- Windows: Visual Studio Build Tools
- Linux: `libwebkit2gtk`, `libssl-dev`

## Fejlesztés

```bash
npm run desktop:dev
```

A webview a `http://localhost:5100` /app munkaterületet tölti (vite). Éles csomag a `.output/public` statikus kimenetet csomagolja.

## Éles build

```bash
npm run build:node
npm run desktop:build
```

Kimenet: `desktop/src-tauri/target/release/bundle/` (msi / nsis / deb / appimage).

A gép CPU/RAM korlátja a hoszt, nem a VPS.
