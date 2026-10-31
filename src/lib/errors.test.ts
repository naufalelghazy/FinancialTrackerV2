import { beforeEach, describe, expect, it } from 'vitest';
import {
  PermanentWriteError,
  classifyWriteError,
  isBrowserOffline,
  isPermanentWriteError,
  toPermanentWriteError,
} from './errors';
import { setOnline } from '../test/setup';

beforeEach(() => {
  setOnline(true);
});

describe('isBrowserOffline', () => {
  it('is true when navigator.onLine is false', () => {
    setOnline(false);
    expect(isBrowserOffline()).toBe(true);
  });

  it('is false when online', () => {
    expect(isBrowserOffline()).toBe(false);
  });
});

describe('classifyWriteError - retryable failures', () => {
  it.each(['08000', '08001', '08003', '08004', '08006', '08007', '57P01', '57P02', '57P03', '53300', '40001', '40P01'])(
    'treats connection SQLSTATE %s as retryable',
    (code) => {
      const result = classifyWriteError({ code, message: 'connection problem' });
      expect(result.retryable).toBe(true);
      expect(result.reason).toBe('network');
    }
  );

  it.each([408, 425, 500, 502, 503, 504])('treats HTTP %i as retryable', (status) => {
    const result = classifyWriteError({ status, message: 'server trouble' });
    expect(result.retryable).toBe(true);
    expect(result.reason).toBe('server');
  });

  it('flags 429 as rate_limited', () => {
    const result = classifyWriteError({ status: 429, message: 'too many requests' });
    expect(result.retryable).toBe(true);
    expect(result.reason).toBe('rate_limited');
  });

  it('treats a bare TypeError as a network failure', () => {
    const err = new TypeError('Failed to fetch');
    const result = classifyWriteError(err);
    expect(result.retryable).toBe(true);
    expect(result.reason).toBe('network');
  });

  it('treats an AbortError as a network failure', () => {
    const err = Object.assign(new Error('aborted'), { name: 'AbortError' });
    expect(classifyWriteError(err).retryable).toBe(true);
  });

  it.each([
    'Failed to fetch',
    'NetworkError when attempting to fetch resource',
    'Load failed',
    'connection reset',
    'request timeout',
  ])('recognises the transport message %s', (message) => {
    expect(classifyWriteError({ message }).retryable).toBe(true);
  });
});

describe('classifyWriteError - permanent failures', () => {
  it('rejects an invalid uuid without retrying', () => {
    const result = classifyWriteError({
      code: '22P02',
      message: 'invalid input syntax for type uuid: "makan"',
    });
    expect(result.retryable).toBe(false);
    expect(result.reason).toBe('invalid');
    expect(result.userMessage).toContain('invalid input syntax');
  });

  it('rejects an RLS violation without retrying', () => {
    const result = classifyWriteError({
      code: '42501',
      status: 403,
      message: 'new row violates row-level security policy',
    });
    expect(result.retryable).toBe(false);
    expect(result.reason).toBe('unauthorized');
  });

  it.each([401, 403])('rejects HTTP %i without retrying', (status) => {
    expect(classifyWriteError({ status }).retryable).toBe(false);
  });

  it.each([400, 409, 422])('rejects HTTP %i without retrying', (status) => {
    expect(classifyWriteError({ status }).retryable).toBe(false);
  });

  it.each(['22001', '23502', '23503', '23505', '23P01'])(
    'rejects integrity SQLSTATE %s',
    (code) => {
      expect(classifyWriteError({ code }).retryable).toBe(false);
    }
  );

  it('treats an unknown error as permanent rather than promising a sync', () => {
    const result = classifyWriteError({ message: 'sesuatu yang aneh' });
    expect(result.retryable).toBe(false);
    expect(result.reason).toBe('unknown');
  });

  it('handles a string error', () => {
    expect(classifyWriteError('gagal total').retryable).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(classifyWriteError(null).retryable).toBe(false);
    expect(classifyWriteError(undefined).retryable).toBe(false);
  });
});

describe('classifyWriteError - offline precedence', () => {
  it('marks even a permanent error as retryable while offline', () => {
    setOnline(false);
    const result = classifyWriteError({ code: '22P02', message: 'invalid uuid' });
    expect(result.retryable).toBe(true);
    expect(result.reason).toBe('offline');
  });
});

describe('PermanentWriteError', () => {
  it('carries the reason and detail', () => {
    const err = new PermanentWriteError('gagal', 'invalid', '22P02 | bad uuid');
    expect(err.name).toBe('PermanentWriteError');
    expect(err.reason).toBe('invalid');
    expect(err.detail).toBe('22P02 | bad uuid');
    expect(err.message).toBe('gagal');
  });

  it('is recognised by the type guard', () => {
    expect(isPermanentWriteError(new PermanentWriteError('x', 'invalid', 'y'))).toBe(true);
    expect(isPermanentWriteError(new Error('x'))).toBe(false);
  });

  it('wraps a raw Supabase error', () => {
    const wrapped = toPermanentWriteError({ code: '42501', message: 'rls' });
    expect(isPermanentWriteError(wrapped)).toBe(true);
    expect(wrapped.reason).toBe('unauthorized');
  });

  it('does not double-wrap', () => {
    const original = new PermanentWriteError('sama', 'invalid', 'detail');
    expect(toPermanentWriteError(original)).toBe(original);
  });
});
