import http from "http";
import prometheus from "prom-client";

const classMethodCounter = new prometheus.Counter({
  name: "method_calls_total",
  help: "Total number of method calls",
  labelNames: ["class", "method"],
});

const timeTakenMethodDuration = new prometheus.Histogram({
  name: "method_calls_time_taken",
  help: "Shows how long a method is being called on a class function",
  labelNames: ["class", "method"],
  buckets: [100, 250, 500, 1000],
});

const register = new prometheus.Registry();

register.setDefaultLabels({
  app: "suara",
});

prometheus.collectDefaultMetrics({ register });

register.registerMetric(classMethodCounter);
register.registerMetric(timeTakenMethodDuration);

export function countMethodCall(originalMethod: any, _context: any) {
  function replacementMethod(this: any, ...args: any[]) {
    const className = this.constructor.name;
    const methodName = originalMethod.name;
    classMethodCounter.labels(className, methodName).inc();
    const result = originalMethod.call(this, ...args);
    return result;
  }

  return replacementMethod;
}

export function calculateTimeTakenOnMethod(originalMethod: any, _context: any) {
  function replacementMethod(this: any, ...args: any[]) {
    const className = this.constructor.name;
    const methodName = originalMethod.name;

    let totalTimeTaken = Date.now();
    const result = originalMethod.call(this, ...args);

    if (result instanceof Promise) {
      result.finally(() => {
        totalTimeTaken -= Date.now();
      });
    } else {
      totalTimeTaken -= Date.now();
    }

    timeTakenMethodDuration
      .labels(className, methodName)
      .observe(totalTimeTaken);
    return result;
  }

  return replacementMethod;
}
// the purpose of this server is to create a scrape endpoint
export const monitoringServer = http.createServer((req, res) => {
  const { url } = req;

  if (url === "/metrics") {
    res.setHeader("Content-Type", prometheus.register.contentType);
    register.metrics().then((data) => {
      res.end(data);
    });
  } else {
    res.writeHead(404, {
      "Content-Type": "text/plain",
    });
    res.end("Not Found");
  }
});
