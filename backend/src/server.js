import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`[api] Server running on http://localhost:${port}`);
  });
}

startServer();
