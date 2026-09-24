# Local Household Ledger & Inventory Manager

This repository contains a browser-based application intended for local household recordkeeping. It provides basic functions for manual ledger entries and home inventory tracking with a responsive user interface suitable for desktop and mobile use.

The project is designed to operate without a mandatory server-side database for normal use.

## Intended use

- Single-user, local household recordkeeping
- Manual entry and review of records
- Optional import of bank statement text files (plain text) into local records
- Optional manual export/import of data as JSON for backups and restores

## Data handling and storage

- Data is stored locally using browser-managed client-side storage (for example, Web Storage / Local Storage).
- Data is scoped to the specific browser profile on the specific device.
- Clearing site data, using private browsing modes, or uninstalling a web app may remove local data.

## Backup and restore

Where available in the user interface:

- **Export** produces a JSON file intended for manual backups.
- **Import** consumes a previously exported JSON file.

Backup files should be treated as sensitive, as they may contain user-provided household records.

## Security and operational considerations (minimal)

- **Access control**: The application relies on the operating system and browser profile for access separation. Anyone with access to the device and browser profile may be able to access local data.
- **Storage durability**: Browser storage is not guaranteed to be durable across all environments. Users should maintain backups if data retention is required.
- **File import**: Imported text files are treated as untrusted input. Only import files obtained from a known source. Avoid importing files containing unexpected content.
- **Telemetry**: This repository does not describe any mandatory telemetry requirements. Deployments should document any additional operational logging if introduced.

## Limitations

- Data is tied to the current browser profile on the current device unless manually exported and imported elsewhere.
- Local browser storage can be cleared by user action or browser policies.
- Data formats for imported statements may vary by bank and may require parser configuration.

## Technical overview

- Frontend: React
- Routing/UI framework: TanStack Router / TanStack Start
- Data validation: Zod (where used)
- Styling: Tailwind CSS

## Requirements

- Node.js (LTS recommended)
- npm (or a compatible package manager)

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## License

See repository licensing information (if provided).

