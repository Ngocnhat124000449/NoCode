import { Injectable } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  readonly registry = new Registry();

  readonly lookupLatency = new Histogram({
    name: 'risk_lookup_duration_seconds',
    help: 'Duration of /risk/lookup endpoint in seconds',
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1.0],
    labelNames: ['source'] as const,
    registers: [this.registry],
  });

  readonly cacheHits = new Counter({
    name: 'risk_cache_hits_total',
    help: 'Total cache hits on risk lookup',
    registers: [this.registry],
  });

  readonly cacheMisses = new Counter({
    name: 'risk_cache_misses_total',
    help: 'Total cache misses on risk lookup',
    registers: [this.registry],
  });

  readonly callTimeouts = new Counter({
    name: 'call_lookup_timeouts_total',
    help: 'Times risk lookup timed out during active call',
    registers: [this.registry],
  });

  readonly reportsTotal = new Counter({
    name: 'scam_reports_total',
    help: 'Total scam reports submitted',
    labelNames: ['scenario_type'] as const,
    registers: [this.registry],
  });

  readonly falsePositives = new Counter({
    name: 'risk_false_positives_total',
    help: 'Times user marked a warned call as safe',
    registers: [this.registry],
  });

  constructor() {
    collectDefaultMetrics({ register: this.registry });
  }
}
