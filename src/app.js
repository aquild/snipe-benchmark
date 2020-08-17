import express from "express";
import NodeCache from "node-cache";

const app = express();
const cache = new NodeCache({
  useClones: false,
  stdTTL: 10 * 60,
  checkperiod: 5 * 60,
});

// Routes
app.get("/:id", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();
  res.send(client);
});

app.post("/:id/setup", async (req, res) => {
  cache.set(req.params.id, { time: req.body.time, earliest: -1 });
  res.send();
});

app.get("/:id/snipe", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();

  if (client.time == -1 && Date.now() > client.time) {
    client.time = Date.now();
    res.send();
  }
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
