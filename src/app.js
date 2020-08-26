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
    requests: 0,
    result: {
      requests: {
        start: -1,
        early: 0,
        late: 0,
        end: -1,
      },
      delay: -1,
    },
  });
  app.log.info(`Server registered benchmark: ${req.params.id}`);
  res.send();
});

app.get("/:id/snipe", async (req, res) => {
  let client = cache.get(req.params.id);
  if (client == undefined) return res.status(404).send();

  const now = Date.now();

  
  if (client.requests == 0) client.result.requests.start = now;
  client.result.requests.end = now;
  client.requests++;
  client.result.requests.rate = client.requests / (client.result.requests.end - client.result.requests.start) * 1000 // Requests / ms * 1000

  if (now < client.time) {
    client.result.requests.early++;
  } else {
    client.result.requests.late++;
    if (client.result.delay == -1) {
      client.result.delay = now - client.time;
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
