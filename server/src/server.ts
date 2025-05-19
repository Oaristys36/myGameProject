import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get(/^\/(?!api).*/, (_, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});