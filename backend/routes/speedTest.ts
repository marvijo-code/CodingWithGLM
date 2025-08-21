import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { SpeedTestService } from "../services/speedTestService.ts";

const router = new Router();

// Run speed test
router.post("/run", async (ctx) => {
  try {
    const { prompt, models, temperature = 0.7, max_tokens = 1000 } = await ctx.request.body.json();
    
    if (!prompt || !models || !Array.isArray(models) || models.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "Prompt and at least one model are required" 
      };
      return;
    }

    const result = await SpeedTestService.runSpeedTest({
      prompt,
      models,
      temperature,
      max_tokens,
    });
    
    ctx.response.body = {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error running speed test:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Get test history
router.get("/history", async (ctx) => {
  try {
    const limit = parseInt(ctx.request.url.searchParams.get("limit") || "20");
    const history = await SpeedTestService.getTestHistory(limit);
    
    ctx.response.body = {
      success: true,
      data: history,
    };
  } catch (error) {
    console.error("Error fetching test history:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Get available models
router.get("/models", async (ctx) => {
  try {
    const models = await SpeedTestService.getAvailableModels();
    
    ctx.response.body = {
      success: true,
      data: models,
    };
  } catch (error) {
    console.error("Error fetching models:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Get popular models
router.get("/popular-models", async (ctx) => {
  try {
    const models = await SpeedTestService.getPopularModels();
    
    ctx.response.body = {
      success: true,
      data: models,
    };
  } catch (error) {
    console.error("Error fetching popular models:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

export default router;