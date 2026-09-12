# Parquetly

A free online Parquet file viewer that runs entirely in your browser. Your file is never uploaded to a server. Open a `.parquet` file, inspect its schema and row groups, run SQL on it with DuckDB, and convert it to CSV or JSON - with no signup and no install.

## ✨ Features

- **🔒 100% Private**: All data processing happens in your browser. Your files never leave your computer.
- **🔍 Schema Inspection**: View column names, types, and nullability at a glance
- **📊 Data Preview**: Browse through your data with pagination
- **🗂️ Row Group Analysis**: Inspect Parquet row group metadata and statistics
- **💾 SQL Querying**: Run SQL queries against your data using DuckDB-WASM
- **🔄 Convert**: Export to [CSV](https://www.parquetly.com/parquet-to-csv) or [JSON](https://www.parquetly.com/parquet-to-json), converted locally
- **⚡ Fast & Lightweight**: Built with modern web technologies for optimal performance
- **🎨 Clean UI**: Intuitive interface built with shadcn/ui components

## 🚀 Quick Start

### Try It Online

Visit [parquetly.com](https://www.parquetly.com/) or click "Try with a sample file" to explore a Law Stack Exchange dataset.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Gilbert09/parquetly.git
cd parquetly

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router) + React + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Parquet Reading**: [parquet-wasm](https://github.com/kylebarron/parquet-wasm)
- **SQL Engine**: [DuckDB-WASM](https://github.com/duckdb/duckdb-wasm)
- **Analytics**: PostHog

## 📖 Usage

1. **Open a File**: Drag and drop a `.parquet` file or click to browse. Nothing is uploaded - the file is read locally.
2. **Explore the Data**:
   - **Data Tab**: Browse rows with pagination
   - **Schema Tab**: View column definitions and types
   - **Row Groups Tab**: Inspect Parquet file metadata
   - **Query Tab**: Write SQL queries to analyze your data
3. **Convert**: Press CSV or JSON next to the file name to download it in that format

### SQL Querying

Your Parquet data is automatically loaded into a DuckDB table named `data`. You can query it using standard SQL:

```sql
-- Get row count
SELECT COUNT(*) FROM data;

-- Filter and aggregate
SELECT category, COUNT(*) as count, AVG(score) as avg_score
FROM data
WHERE score > 10
GROUP BY category
ORDER BY count DESC;

-- DuckDB's powerful string functions
SELECT
  REGEXP_EXTRACT(email, '([^@]+)@', 1) as username,
  STRING_SPLIT(tags, ',') as tag_array
FROM data
WHERE email LIKE '%@gmail.com';

-- Advanced analytics with window functions
SELECT
  date,
  value,
  AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as moving_avg_7day,
  PERCENT_RANK() OVER (ORDER BY value) as percentile
FROM data;

-- JSON operations (if your parquet has JSON columns)
SELECT
  json_extract(metadata, '$.user.name') as user_name,
  json_extract_string(settings, '$.theme') as theme
FROM data;

-- Date/time manipulation
SELECT
  date_trunc('month', timestamp) as month,
  COUNT(*) as events,
  DATE_DIFF('day', MIN(timestamp), MAX(timestamp)) as day_span
FROM data
GROUP BY month;
```

Press `Cmd/Ctrl + Enter` to execute queries.

## ❓ FAQ

### How do I open a .parquet file without Python?

Open [parquetly.com](https://www.parquetly.com/) and drag your `.parquet` file
onto the page. The data appears in a table within seconds. You do not need
Python, pandas, PySpark, or any install — a browser is enough.

### Does Parquetly upload my Parquet file?

No. Parquetly reads your file locally using WebAssembly. The file never leaves
your computer, and there is no server that could receive it. Open your browser's
network tab while loading a file and you will see no upload.

### Can I run SQL on a Parquet file in my browser?

Yes. The file is loaded into DuckDB compiled to WebAssembly and exposed as a
table named `data`, so you can write standard SQL against it without setting up
a database.

### Is it safe for confidential data?

The file is processed entirely in your browser, so confidential data is not
transmitted anywhere. The page loads its WebAssembly engine over the network,
but your file itself is only ever read locally — and the source is open, so you
can verify that rather than trust it.

### How large a file can it open?

There is no upload cap, because there is no upload. The practical limit is your
browser's available memory. Files in the tens or low hundreds of megabytes open
comfortably.

### What is a Parquet file?

Apache Parquet is a columnar storage format for analytics data. It stores values
column by column rather than row by row, which makes it far smaller and faster to
query than CSV. It is binary, which is why a text editor shows only unreadable
bytes and a dedicated viewer is needed.

## 🔐 Privacy & Security

Parquetly is designed with privacy in mind:

- ✅ Zero server uploads - all processing is client-side
- ✅ No data storage - files are only held in browser memory
- ✅ No tracking of file contents
- ✅ Open source - audit the code yourself

## 📦 Building for Production

```bash
npm run build
```

The build first copies the `parquet-wasm` files into `public/wasm/` so they are
served from this origin rather than a CDN, then runs `next build`. Every page is
prerendered to static HTML, which is what makes the content readable by crawlers
that do not execute JavaScript.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
