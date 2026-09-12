import ParquetTool from "@/components/ParquetTool";
import SiteHeader from "@/components/SiteHeader";
import { FAQS, FEATURES } from "@/lib/content";
import { SITE_URL } from "./layout";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Parquetly",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a browser with WebAssembly support",
        url: `${SITE_URL}/`,
        description:
          "A free Apache Parquet file viewer that runs entirely in the browser. Inspect schemas, row groups and column chunk statistics, and query data with SQL via DuckDB. Files are never uploaded.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isAccessibleForFree: true,
        featureList: FEATURES.map((f) => f.title),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      { "@type": "WebSite", name: "Parquetly", url: `${SITE_URL}/` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="container py-6 max-w-7xl">
        <SiteHeader />

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">
          Free Online Parquet Viewer &ndash; No Upload, Runs in Your Browser
        </h1>

        <p className="text-muted-foreground max-w-3xl mb-8">
          Parquetly is a free online Parquet file viewer that runs entirely in
          your browser &mdash; your file is never uploaded to a server. Open a{" "}
          <code className="font-mono text-foreground">.parquet</code> file,
          inspect its schema and row groups, and run SQL on it with DuckDB, with
          no signup and no install.
        </p>

        <ParquetTool />

        <div className="mt-16 space-y-14 max-w-3xl">
          <section>
            <h2 className="text-lg font-semibold mb-4">
              How to open a Parquet file
            </h2>
            <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
              <li>
                Drag your <code className="font-mono">.parquet</code> file onto
                the box above, or click it to browse for one.
              </li>
              <li>
                The file is read in your browser. The schema, data and row group
                statistics appear in seconds.
              </li>
              <li>
                Switch to the Query tab to run SQL against the file, or to
                Row Groups to see how it is compressed and encoded.
              </li>
            </ol>
            <p className="mt-4 text-muted-foreground">
              You do not need Python, pandas, PySpark or a Hadoop cluster to
              read a Parquet file. Parquetly also accepts the{" "}
              <code className="font-mono">.pqt</code>,{" "}
              <code className="font-mono">.parq</code> and{" "}
              <code className="font-mono">.pq</code> extensions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Why your file never leaves your machine
            </h2>
            <p className="text-muted-foreground">
              Most online Parquet viewers upload your file to their server,
              parse it there, and send back a rendered table. That means handing
              production data to a third party. Parquetly does the parsing in
              your browser instead, using Apache Parquet and DuckDB compiled to
              WebAssembly. Nothing is transmitted, so there is no server-side
              copy of your data to worry about, and no retention policy to read.
            </p>
            <p className="mt-4 text-muted-foreground">
              You do not have to take that on trust. Open your browser&rsquo;s
              network tab while you load a file and you will see no upload. The{" "}
              <a
                href="https://github.com/Gilbert09/parquetly"
                className="text-primary underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                entire source is on GitHub
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              What Parquetly shows you
            </h2>
            <dl className="space-y-5">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <dt className="font-medium">{feature.title}</dt>
                  <dd className="mt-1 text-muted-foreground">{feature.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              How Parquetly compares
            </h2>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">
                      Approach
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      No upload
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">SQL</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      No install
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">Free</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Open source
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Parquetly", "Yes", "Yes", "Yes", "Yes", "Yes"],
                    [
                      "Upload-based web viewers",
                      "No",
                      "Sometimes",
                      "Yes",
                      "Often limited",
                      "Rarely",
                    ],
                    ["Desktop apps", "Yes", "Sometimes", "No", "Varies", "Some"],
                    ["Python and pandas", "Yes", "With DuckDB", "No", "Yes", "Yes"],
                  ].map(([approach, ...cells]) => (
                    <tr key={approach} className="border-t">
                      <td className="px-3 py-2 font-medium">{approach}</td>
                      {cells.map((cell, i) => (
                        <td key={i} className="px-3 py-2 text-muted-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Convert Parquet files</h2>
            <p className="text-muted-foreground">
              Parquetly can also convert a Parquet file to another format, in
              the same way: locally, with nothing uploaded.
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="/parquet-to-csv"
                  className="text-primary underline underline-offset-4"
                >
                  Convert Parquet to CSV
                </a>{" "}
                <span className="text-muted-foreground">
                  &ndash; for spreadsheets and tools that cannot read Parquet.
                </span>
              </li>
              <li>
                <a
                  href="/parquet-to-json"
                  className="text-primary underline underline-offset-4"
                >
                  Convert Parquet to JSON
                </a>{" "}
                <span className="text-muted-foreground">
                  &ndash; keeps nested structs and lists intact.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-medium">{faq.question}</h3>
                  <p className="mt-1 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-16 pt-6 border-t text-sm text-muted-foreground">
          <p>
            Parquetly is open source.{" "}
            <a
              href="https://github.com/Gilbert09/parquetly"
              className="text-primary underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              View the source on GitHub
            </a>
            .
          </p>
        </footer>
      </div>
    </>
  );
}
