import http from "http";
import app from "./app";
import checkEnvVars from "./utils/checkEnvVars";
import databaseConnect from "./utils/dbConnect";

const { NODE_ENV, PORT = 3000, MONGODB_URI, MONGODB_LOCAL_URI } = process.env;

checkEnvVars(["NODE_ENV", "PORT", "MONGODB_URI", "MONGODB_LOCAL_URI"]);

let DB_URI = NODE_ENV === "production" ? MONGODB_URI : MONGODB_LOCAL_URI;

const server: http.Server = http.createServer(app);

const serverStart = async () => {
  try {
    await databaseConnect(DB_URI);
    server.listen(PORT, () => {
      console.log(`[system] server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[system] error starting the server:", error);
    process.exit(1);
  }
};

serverStart().catch((error) => {
  console.error("[system] error starting the server:", error);
  process.exit(1);
});
