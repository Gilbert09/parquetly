# Parquetly

A fast, privacy-focused Parquet file viewer that runs entirely in your browser. Explore schemas, query data with SQL, and navigate large datasets without uploading files to any server.

## ✨ Features

- **🔒 100% Private**: All data processing happens in your browser. Your files never leave your computer.
- **🔍 Schema Inspection**: View column names, types, and nullability at a glance
- **📊 Data Preview**: Browse through your data with pagination
- **🗂️ Row Group Analysis**: Inspect Parquet row group metadata and statistics
- **💾 SQL Querying**: Run SQL queries against your data using DuckDB-WASM
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

- **Frontend**: React + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Parquet Reading**: [parquet-wasm](https://github.com/kylebarron/parquet-wasm)
- **SQL Engine**: [DuckDB-WASM](https://github.com/duckdb/duckdb-wasm)
- **Analytics**: PostHog

## 📖 Usage

1. **Upload a File**: Drag and drop a `.parquet` file or click to browse
2. **Explore the Data**:
   - **Data Tab**: Browse rows with pagination
   - **Schema Tab**: View column definitions and types
   - **Row Groups Tab**: Inspect Parquet file metadata
   - **Query Tab**: Write SQL queries to analyze your data

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

The built files will be in the `dist` directory, ready to deploy to any static hosting service.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
