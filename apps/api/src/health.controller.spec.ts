import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns ok status', () => {
    const controller = new HealthController();

    expect(controller.status()).toEqual({ status: 'ok' });
  });
});
