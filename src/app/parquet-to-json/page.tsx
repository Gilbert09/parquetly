import type { Metadata } from "next";
import ConverterPage from "@/components/ConverterPage";

const INTRO =
  "Convert a Parquet file to JSON for free, entirely in your browser. Drop in a .parquet file and download it as a JSON array in seconds - the file is never uploaded to a server, and no install or account is needed.";

export const metadata: Metadata = {
  title: "Convert Parquet to JSON Online - Free, No Upload",
  description: INTRO,
  alternates: { canonical: "/parquet-to-json" },
  openGraph: {
    title: "Convert Parquet to JSON Online - Free, No Upload",
    description: INTRO,
    url: "/parquet-to-json",
  },
};

export default function ParquetToJson() {
  return (
    <ConverterPage
      format="JSON"
      path="/parquet-to-json"
      heading="Convert Parquet to JSON Online - Free, No Upload"
      intro={INTRO}
      rationale="JSON is what most APIs, scripting languages and web tools expect. Unlike CSV it keeps nested structure intact, so structs, lists and maps survive the conversion instead of being flattened into text. That makes it the better target when the data has any shape to it, or when you are feeding it into code rather than a spreadsheet."
      faqs={[
        {
          question: "Is my file uploaded when I convert it?",
          answer:
            "No. The conversion runs in your browser using DuckDB compiled to WebAssembly. Your Parquet file and the JSON it produces both stay on your computer.",
        },
        {
          question: "What shape is the JSON output?",
          answer:
            "A single JSON array of objects, with one object per row and the column names as keys. That is the shape most tools and APIs expect, and it can be parsed in one step.",
        },
        {
          question: "Are nested columns preserved?",
          answer:
            "Yes. Structs become nested objects and lists become arrays, so the structure of the original Parquet file survives the conversion. This is the main advantage of JSON over CSV as a target.",
        },
        {
          question: "Can I convert only part of the file?",
          answer:
            "Yes. Use the Query tab to write SQL against the table named data, then download the result. This is useful when the full file would produce more JSON than you want.",
        },
        {
          question: "How do Parquet types map to JSON?",
          answer:
            "Integers and floats become JSON numbers, booleans become true or false, and strings become strings. Structs become objects, lists become arrays, and null stays null. Note that INT64 values beyond about 9 quadrillion are written as JSON numbers, which some JSON parsers read as floating point and may round - if you have identifiers that large, convert to CSV instead, or cast the column to a string in the Query tab first.",
        },
      ]}
    />
  );
}
