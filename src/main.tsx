import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initParquet } from "./lib/parquetReader.ts";

async function bootstrap() {
  await initParquet();
}

bootstrap();
createRoot(document.getElementById("root")!).render(<App />);
