import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PostHogProvider } from "posthog-js/react";

const App = () => (
  <PostHogProvider
    apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
    options={{
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      defaults: "2025-05-24",
      capture_exceptions: true,
      debug: import.meta.env.DEV,
    }}
  >
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </PostHogProvider>
);

export default App;
