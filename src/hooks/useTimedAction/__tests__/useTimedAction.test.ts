import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { FnAction, useTimedAction } from '..';

function makeHook1(callback: FnAction, delay: number, skipIfAlreadyEnqueued: boolean, id: string) {
  return renderHook(() => useTimedAction({ callback, delay, skipIfAlreadyEnqueued }, id));
}
function makeHook2(id: string) {
  return renderHook(() => useTimedAction({}, id));
}

async function waitFor(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}

describe('useTimedAction | V1 (skip)', () => {
  it('initialization', () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, true, '1a');

    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.cancel()).toBeFalsy();
  });

  it('enqueue once', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, true, '1b');

    const promise = act(() => result.current.enqueue({}));
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, true, '1c');

    const promise = act(() => {
      const _promise = result.current.enqueue({});
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return _promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, true, '1d');

    await act(async () => {
      const promise1 = result.current.enqueue({});
      const promise2 = result.current.enqueue({});
      const promise3 = result.current.enqueue({});
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, true, '1e');

    await act(async () => {
      result.current.enqueue({});
      await waitFor(30);
      result.current.enqueue({});
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useTimedAction | V1 (no skip)', () => {
  it('initialization', () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, false, '2a');
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.cancel()).toBeFalsy();
  });

  it('enqueue once', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, false, '2b');

    const promise = act(() => result.current.enqueue({}));
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, false, '2c');

    const promise = act(() => {
      const _promise = result.current.enqueue({});
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return _promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, false, '2d');

    await act(async () => {
      const promise1 = result.current.enqueue({});
      const promise2 = result.current.enqueue({});
      const promise3 = result.current.enqueue({});
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const callback = jest.fn();
    const { result } = makeHook1(callback, 50, false, '2e');

    await act(async () => {
      result.current.enqueue({});
      await waitFor(30);
      result.current.enqueue({});
      await waitFor(30);
      result.current.enqueue({});
      await waitFor(30);
      result.current.enqueue({});
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useTimedAction | V2 (skip)', () => {
  it('initialization', () => {
    const { result } = makeHook2('3a');

    expect(result.current.isEnqueued()).toBeFalsy();
    expect(result.current.cancel()).toBeFalsy();
  });

  it('enqueue once', async () => {
    const callback = jest.fn();
    const { result } = makeHook2('3b');

    const promise = act(() => result.current.enqueue({ callback, delay: 50, skipIfAlreadyEnqueued: true }));
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const callback = jest.fn();
    const { result } = makeHook2('3c');

    const promise = act(() => {
      const _promise = result.current.enqueue({ callback, delay: 50, skipIfAlreadyEnqueued: true });
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return _promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const { result } = makeHook2('3d');

    await act(async () => {
      const promise1 = result.current.enqueue({ callback: callback1, delay: 50, skipIfAlreadyEnqueued: true });
      const promise2 = result.current.enqueue({ callback: callback2, delay: 50, skipIfAlreadyEnqueued: true });
      const promise3 = result.current.enqueue({ callback: callback3, delay: 50, skipIfAlreadyEnqueued: true });
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback1).toHaveBeenCalledTimes(0);
      expect(callback2).toHaveBeenCalledTimes(0);
      expect(callback3).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(0);
      expect(callback3).toHaveBeenCalledTimes(0);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const callback = jest.fn();
    const { result } = makeHook2('3e');

    await act(async () => {
      result.current.enqueue({ callback, delay: 50, skipIfAlreadyEnqueued: true });
      await waitFor(30);
      result.current.enqueue({ callback, delay: 50, skipIfAlreadyEnqueued: true });
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useTimedAction | V2 (no skip)', () => {
  it('initialization', () => {
    const { result } = makeHook2('4a');

    expect(result.current.isEnqueued()).toBeFalsy();
    expect(result.current.cancel()).toBeFalsy();
  });

  it('enqueue once', async () => {
    const callback = jest.fn();
    const { result } = makeHook2('4b');

    const promise = act(() => result.current.enqueue({ callback, delay: 50, skipIfAlreadyEnqueued: false }));
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const callback = jest.fn();
    const { result } = makeHook2('4c');

    const promise = act(() => {
      const _promise = result.current.enqueue({ callback, delay: 50, skipIfAlreadyEnqueued: false });
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return _promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const { result } = makeHook2('4d');

    await act(async () => {
      const promise1 = result.current.enqueue({ callback: callback1, delay: 50, skipIfAlreadyEnqueued: false });
      const promise2 = result.current.enqueue({ callback: callback2, delay: 50, skipIfAlreadyEnqueued: false });
      const promise3 = result.current.enqueue({ callback: callback3, delay: 50, skipIfAlreadyEnqueued: false });
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback1).toHaveBeenCalledTimes(0);
      expect(callback2).toHaveBeenCalledTimes(0);
      expect(callback3).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback1).toHaveBeenCalledTimes(0);
      expect(callback2).toHaveBeenCalledTimes(0);
      expect(callback3).toHaveBeenCalledTimes(1);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const { result } = makeHook2('4e');

    await act(async () => {
      result.current.enqueue({ callback: callback1, delay: 50, skipIfAlreadyEnqueued: false });
      await waitFor(30);
      result.current.enqueue({ callback: callback2, delay: 50, skipIfAlreadyEnqueued: false });
      await waitFor(30);
      result.current.enqueue({ callback: callback3, delay: 50, skipIfAlreadyEnqueued: false });
      await waitFor(30);
      result.current.enqueue({ callback: callback4, delay: 50, skipIfAlreadyEnqueued: false });
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(callback1).toHaveBeenCalledTimes(0);
      expect(callback2).toHaveBeenCalledTimes(0);
      expect(callback3).toHaveBeenCalledTimes(0);
      expect(callback4).toHaveBeenCalledTimes(0);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(callback1).toHaveBeenCalledTimes(0);
      expect(callback2).toHaveBeenCalledTimes(0);
      expect(callback3).toHaveBeenCalledTimes(0);
      expect(callback4).toHaveBeenCalledTimes(1);
    });
  });
});
