/**
 * Homepage content that has to exist in two places: as visible HTML for
 * readers, and as JSON-LD for machines. Defining it once keeps Google from
 * seeing FAQ structured data that does not match the page, which it treats
 * as spam.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Does Parquetly upload my Parquet file?",
    answer:
      "No. Parquetly reads your file locally using WebAssembly. The file never leaves your computer, and Parquetly has no server that could receive it. You can confirm this yourself: open your browser's network tab while loading a file, or read the source, which is open on GitHub.",
  },
  {
    question: "How do I open a .parquet file without Python?",
    answer:
      "Open parquetly.com and drag your .parquet file onto the page. The data appears in a table within seconds. You do not need Python, pandas, PySpark, DuckDB, or any install - a browser is enough.",
  },
  {
    question: "Can I run SQL on a Parquet file in my browser?",
    answer:
      "Yes. Parquetly loads your file into DuckDB compiled to WebAssembly and gives you a SQL tab. Your data is available as a table named data, so you can write standard SQL such as SELECT * FROM data WHERE score > 10 without setting up a database.",
  },
  {
    question: "What is a Parquet file?",
    answer:
      "Apache Parquet is a columnar storage format for analytics data. It stores values column by column rather than row by row, which makes it far smaller and faster to query than CSV. Because it is a binary format, a text editor shows only unreadable bytes, which is why it needs a dedicated viewer.",
  },
  {
    question: "Is Parquetly free?",
    answer:
      "Yes. Parquetly is free, needs no account, and has no paid tier. It is open source under the repository linked at the top of this page.",
  },
  {
    question: "Is it safe to use with confidential data?",
    answer:
      "Parquetly processes files entirely in your browser, so confidential data is not transmitted anywhere. The page does load its WebAssembly engine and this site's own assets over the network, but your file itself is only ever read locally.",
  },
  {
    question: "How large a Parquet file can it open?",
    answer:
      "Parquetly is limited by your browser's available memory rather than by any upload cap. Files in the tens or low hundreds of megabytes open comfortably on a typical machine. Very large files may be slow, because the whole file is read in the browser.",
  },
];

export interface Feature {
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Schema and column types",
    body: "See every column with its Parquet type and whether it is nullable, plus a summary of how many columns of each type the file contains. Nested columns are shown with their full dotted path.",
  },
  {
    title: "Row group and column chunk statistics",
    body: "Inspect each row group's row count, total size, compressed size and compression ratio, then expand it to see per-column chunk detail: compression codec, encodings, value count, and compressed versus uncompressed size. This is the detail that explains why a file is the size it is.",
  },
  {
    title: "Data preview",
    body: "Page through the rows in a plain table, with nested structs and lists rendered as readable JSON rather than as [object Object].",
  },
  {
    title: "SQL with DuckDB",
    body: "Query the file with full DuckDB SQL - aggregates, joins against itself, window functions, filters - all running in the browser tab, with resizable result columns.",
  },
];
