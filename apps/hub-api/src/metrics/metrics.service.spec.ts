import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registry has default metrics registered', async () => {
    const text = await service.registry.metrics();
    expect(text).toContain('process_cpu_user_seconds_total');
  });

  it('lookupLatency is a histogram with correct name', async () => {
    const end = service.lookupLatency.startTimer();
    end({ source: 'cache' });
    const text = await service.registry.metrics();
    expect(text).toContain('risk_lookup_duration_seconds');
  });

  it('cacheHits increments counter', async () => {
    service.cacheHits.inc();
    service.cacheHits.inc();
    const text = await service.registry.metrics();
    expect(text).toContain('risk_cache_hits_total 2');
  });

  it('cacheMisses increments counter', async () => {
    service.cacheMisses.inc();
    const text = await service.registry.metrics();
    expect(text).toContain('risk_cache_misses_total 1');
  });

  it('falsePositives increments counter', async () => {
    service.falsePositives.inc();
    const text = await service.registry.metrics();
    expect(text).toContain('risk_false_positives_total 1');
  });

  it('callTimeouts increments counter', async () => {
    service.callTimeouts.inc();
    const text = await service.registry.metrics();
    expect(text).toContain('call_lookup_timeouts_total 1');
  });

  it('reportsTotal tracks by scenario_type label', async () => {
    service.reportsTotal.inc({ scenario_type: 'government_impersonation' });
    const text = await service.registry.metrics();
    expect(text).toContain('scam_reports_total');
    expect(text).toContain('government_impersonation');
  });
});
