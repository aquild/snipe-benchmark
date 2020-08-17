import express from "express";
import NodeCache from "node-cache";

const app = express();
const cache = new NodeCache({
  useClones: false,
  stdTTL: 10 * 60,
  checkperiod: 5 * 60,
});

// Routes
app.use(express.json());

app.get("/:id", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();
  res.send(client);
});

app.post("/:id", async (req, res) => {
  cache.set(req.params.id, { time: req.body.time, delay: -1 });
  res.send();
});

app.get("/:id/snipe", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();

  if (client.delay == -1 && Date.now() > client.time) {
    client.delay = Date.now() - client.time;
    console.log(`Server completed benchmark: ${req.params.id}`);
  }
  res.send();
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
