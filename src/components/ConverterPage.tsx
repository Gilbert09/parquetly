import ParquetTool from "@/components/ParquetTool";
import SiteHeader from "@/components/SiteHeader";
import type { Faq } from "@/lib/content";
import { SITE_URL } from "@/app/layout";

export interface ConverterPageProps {
  /** Upper-case target format, e.g. "CSV". */
  format: string;
  /** Route path, e.g. "/parquet-to-csv". */
  path: string;
  heading: string;
  /** Opening paragraph. Front-loaded, because answer engines quote it. */
  intro: string;
  /** Why someone would want this format. */
  rationale: string;
  faqs: Faq[];
}

export default function ConverterPage({
  format,
  path,
  heading,
  intro,
  rationale,
  faqs,
}: ConverterPageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: `Parquet to ${format} converter`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a browser with WebAssembly support",
        url: `${SITE_URL}${path}`,
        description: intro,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isAccessibleForFree: true,
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
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

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {heading}
        </h1>

        <p className="text-lg text-muted-foreground max-w-3xl mb-8">{intro}</p>

        <ParquetTool />

        <div className="mt-16 space-y-14 max-w-3xl">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              How to convert Parquet to {format}
            </h2>
            <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
              <li>
                Drop your <code className="font-mono">.parquet</code> file onto
                the box above.
              </li>
              <li>
                Check the data looks right in the preview, and narrow it down
                with SQL in the Query tab if you only want part of it.
              </li>
              <li>
                Press the <strong>{format}</strong> button next to the file name
                to download the converted file.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Why convert Parquet to {format}?
            </h2>
            <p className="text-muted-foreground">{rationale}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              The conversion happens on your computer
            </h2>
            <p className="text-muted-foreground">
              Most online converters upload your file, convert it on their
              server, and email or serve you the result. Parquetly does the
              conversion in your browser with DuckDB compiled to WebAssembly,
              so the file is never transmitted. There is no upload, no queue,
              no size limit imposed by a server, and no copy of your data left
              behind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
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
            <a
              href="/"
              className="text-primary underline underline-offset-4"
            >
              Back to the Parquet viewer
            </a>{" "}
            &middot;{" "}
            <a
              href="https://github.com/Gilbert09/parquetly"
              className="text-primary underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Source on GitHub
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
