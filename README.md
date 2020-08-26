# Snipe Benchmark

**A standard benchmark for Minecraft name snipers/blockers.**

## Quick-Start

_`<API_BASE>` is the base URL of the benchmark server. Currently you can use the public deployment at `https://snipe-benchmark.herokuapp.com`_

_`<YOUR_ID>` is a unique identifier used to identify your sniper. This can be anything, but "arceus-v1.0.0" or "ares-vIDFK" are good examples._

1. Setup the benchmark for a given time. Timestamp should be in milliseconds since the UNIX epoch:

   `POST /<YOUR_ID>`

   ```json
   {
       "time": <TIMESTAMP>
   }
   ```

2. Copy your snipers code, changing the snipe request to `GET <API_BASE>/<YOUR_ID>/snipe`. The server will send back no response to minimize resource usage under heavy load, but it will log your request.

3. Get your results from the server by requesting `GET <API_BASE>/<YOUR_ID>`. The server will send back a response like this:

   ```json
   {
       "time": <TIMESTAMP>,
       "request": <TOTAL_REQUESTS>,
       "result": {
           "delay": <DELAY_MS>,
           "requests": {
               "start": <START_TIMESTAMP>,
                "early": <EARLY_REQS>,
                "late": <LATE_REQS>,
                "end": <END_TIMESTAMP>,
                "rate": <REQUEST_PER_SECOND>
           }

       }
   }
   ```

   Your results are in the `result` property. The most important property of the result object is the `delay`, which tells you how long after the benchmark time the server recieved a snipe packet. More result statistics will be added later.

Example:

Here's an example in Python:

```python
import requests
from datetime import datetime, timedelta
import time

def benchmark():
    bench_time = datetime.now() + timedelta(seconds=20) # Benchmark in 20 seconds

    # Set up benchmark
    requests.post("https://snipe-benchmark.herokuapp.com/python-example-v1.0.0", json={
        "time": bench_time.timestamp() * 1000 # Get the timestamp and convert from seconds to milliseconds
    })

    # Wait for benchmark
    while datetime.now() < bench_time:
        time.sleep(0.1)

    # Send snipe request
    requests.get("https://snipe-benchmark.herokuapp.com/python-example-v1.0.0/snipe")

    # Get results object
    res = requests.get("https://snipe-benchmark.herokuapp.com/python-example-v1.0.0")

    print(res.json())

benchmark()
```

Running should return something like this:

```json
{
  "time": 1597768684767.3691,
  "requests": 1,
  "result": {
    "delay": 374.630859375,
    "requests": {
      "start": 1597768685683.4823,
      "early": 0,
      "late": 1,
      "end": 1597768685683.4823,
      "rate": null // This would normally be the average requests / second, but we only sent one request
    }
  }
}
```

So we got a delay around 375 milliseconds, not too bad for 10 lines of Python (minified).

## Contributing

Please feel free to fork and make a pull request. The code is quite simple and for now is contained in just one file, [src/app.js](./src/app.js).

## Planned Features

- [x] Quick-start guide
- [x] More granular result data
- [x] Request / second result
- [ ] Deploy on AWS behind Cloudfront to better simulate the Mojang API
- [ ] Sniper leaderboards + auth system to prevent sabotage
