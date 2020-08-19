import fastify from "fastify";
import NodeCache from "node-cache";

const app = fastify();
const cache = new NodeCache({
  useClones: false,
  stdTTL: 10 * 60,
  checkperiod: 5 * 60,
});

// Temporary Homepage
app.get("/", async (_req, res) => {
  res.redirect("https://github.com/aquild/snipe-benchmark");
});

// Routes
app.get("/:id", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();
  res.send(client);
});

app.post("/:id", async (req, res) => {
  cache.set(req.params.id, {
    time: req.body.time,
    result: { early: 0, late: 0, delay: -1 },
  });
  console.log(`Server registered benchmark: ${req.params.id}`);
  res.send();
});

app.get("/:id/snipe", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();

  if (Date.now() < client.time) {
    client.result.early++;
  } else {
    client.result.late++;
    if (client.result.delay == -1) {
      client.result.delay = Date.now() - client.time;
      console.log(`Server completed benchmark: ${req.params.id}`);
    }
  }
  res.status(204).send();
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
