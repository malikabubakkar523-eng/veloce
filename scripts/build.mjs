import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Function to safely load env file into process.env if present
function loadEnvFile(fileName) {
  try {
    const envPath = path.resolve(process.cwd(), fileName);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (e) {
    console.warn(`⚠️ Could not load ${fileName}:`, e);
  }
}

// Load local environment files if present
loadEnvFile(".env.local");
loadEnvFile(".env");

// Fallback DATABASE_URL if undefined in CI build container to allow prisma generate to compile types
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "postgresql://neondb_owner:npg_hlbH1TQoXZ9V@ep-floral-thunder-ay31tg7t-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
}

try {
  console.log("⚡ [Build Step 1/2] Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  console.log("⚡ [Build Step 2/2] Running Next.js production build...");
  execSync("npx next build", { stdio: "inherit", env: process.env });
} catch (error) {
  console.error("❌ [Build Failed]", error.message || error);
  process.exit(error.status || 1);
}
