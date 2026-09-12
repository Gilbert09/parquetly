import type { Metadata } from "next";
import ConverterPage from "@/components/ConverterPage";

const INTRO =
  "Convert a Parquet file to CSV for free, entirely in your browser. Drop in a .parquet file and download it as CSV in seconds - the file is never uploaded to a server, and you do not need Python, pandas or an account.";

export const metadata: Metadata = {
  title: "Convert Parquet to CSV Online - Free, No Upload",
  description: INTRO,
  alternates: { canonical: "/parquet-to-csv" },
  openGraph: {
    title: "Convert Parquet to CSV Online - Free, No Upload",
    description: INTRO,
    url: "/parquet-to-csv",
  },
};

export default function ParquetToCsv() {
  return (
    <ConverterPage
      format="CSV"
      path="/parquet-to-csv"
      heading="Convert Parquet to CSV Online - Free, No Upload"
      intro={INTRO}
      rationale="Parquet is compact and fast to query, but almost nothing outside the data ecosystem can read it. CSV opens in Excel, Google Sheets, Numbers and every text editor, and it is the format most tools accept for import. Converting is the usual step when you need to hand a dataset to someone who does not work with Parquet daily. The trade-off is size: CSV is uncompressed text, so expect the output to be several times larger than the Parquet file."
      faqs={[
        {
          question: "Is my file uploaded when I convert it?",
          answer:
            "No. The conversion runs in your browser using DuckDB compiled to WebAssembly. Your Parquet file and the CSV it produces both stay on your computer.",
        },
        {
          question: "Why is the CSV so much bigger than the Parquet file?",
          answer:
            "Parquet stores data column by column and compresses it, typically to a third or less of its raw size. CSV is plain uncompressed text with the values repeated in full, so a 50 MB Parquet file can easily produce a CSV several times that size.",
        },
        {
          question: "Can I convert only some of the rows or columns?",
          answer:
            "Yes. Open the Query tab and write SQL against the table named data, for example SELECT id, name FROM data WHERE score > 10. Then download the result as CSV.",
        },
        {
          question: "How are nested columns handled?",
          answer:
            "CSV has no concept of nesting, so structs, lists and maps are written as their JSON text representation inside a single column. If you need to keep the structure intact, convert to JSON instead.",
        },
        {
          question: "Is there a file size limit?",
          answer:
            "There is no server-imposed limit, because no server is involved. The practical limit is your browser's memory, since the whole file is read and converted locally.",
        },
      ]}
    />
  );
}
