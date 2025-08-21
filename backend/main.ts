import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import openRouterRoutes from "./routes/openRouter.ts";
import speedTestRoutes from "./routes/speedTest.ts";
import { DbService } from "./services/dbService.ts";

const app = new Application();

// Enable CORS for all routes
app.use(oakCors());

// Logger middleware
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Root route
app.use((ctx) => {
  ctx.response.body = {
    message: "Welcome to LLM Speed Test API",
    version: "1.0.0",
  };
});

// Health check route
app.use("/health", (ctx) => {
  ctx.response.body = {
    status: "healthy",
    timestamp: new Date().toISOString(),
  };
});

// API routes
app.use("/api/openrouter", openRouterRoutes.routes());
app.use("/api/openrouter", openRouterRoutes.allowedMethods());

app.use("/api/speed-test", speedTestRoutes.routes());
app.use("/api/speed-test", speedTestRoutes.allowedMethods());

// Test results route
app.use("/api/test-results", (ctx) => {
  if (ctx.request.method === "GET") {
    try {
      const limit = parseInt(ctx.request.url.searchParams.get("limit") || "50");
      const results = DbService.getTestResults(limit);
      ctx.response.body = {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error("Error fetching test results:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
});

// Start the server
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port });