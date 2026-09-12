import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="container py-6 max-w-7xl">
      <SiteHeader />
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Page not found</h1>
      <p className="text-muted-foreground">
        That page does not exist.{" "}
        <Link href="/" className="text-primary underline underline-offset-4">
          Open the Parquet viewer
        </Link>
        .
      </p>
    </div>
  );
}
