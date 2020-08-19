import fastify from "fastify";
import NodeCache from "node-cache";

const app = fastify({ logger: { level: "info" } });
const cache = new NodeCache({
  useClones: false,
  stdTTL: 10 * 60,
  checkperiod: 5 * 60,
});

// Temporary Homepage
app.get("/", async (_req, res) => {
  res.redirect("https://github.com/aquild/snipe-benchmark");
});

// Status
app.get("/status", async (_req, res) => {
  const cpu = process.cpuUsage();

  setTimeout(
    () =>
      res.send({
        status: "OK",
        cpu: process.cpuUsage(cpu).user / (1000 * 1000),
        mem: process.memoryUsage().heapUsed / (1000 * 1000),
      }),
    1000
  );
});

process.cpuUsage;

// Benchmark
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
  app.log.info(`Server registered benchmark: ${req.params.id}`);
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
      app.log.info(`Server completed benchmark: ${req.params.id}`);
    }
  }
  res.status(204).send();
});

const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await app.listen(port, "0.0.0.0");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
