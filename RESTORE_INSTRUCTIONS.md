# RESTORE_INSTRUCTIONS (baseline-stable-pre-lean)

Ez a repo egy Lean kísérleti ágra lett leválasztva.

## Visszaállítás 1 lépésben (kód)

```bash
git checkout baseline-stable-pre-lean
```

## Visszaállítás „tiszta” munkakönyvtárral (minden kísérleti, nem commitolt változás eldobása)

```bash
git checkout baseline-stable-pre-lean
git reset --hard
git clean -fd
```

## Visszatérés a kísérleti ágra

```bash
git checkout feature/lean-thinking-experiment
```

## Megjegyzés

- A `baseline-stable-pre-lean` **tag** a commit-állapotot rögzíti. Ha vannak nem commitolt módosításaid, azok nem részei a tagnak.
- A `local_backups/` mappa `.gitignore`-olva van, itt tarthatsz tesztmentéseket biztonságosan.

