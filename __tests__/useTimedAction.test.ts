import { renderHook } from '@testing-library/react-hooks';
// import { FnAction, useTimedActionV1, useTimedActionV2 } from '../src/useTimedAction';
import { act } from 'react-dom/test-utils';
import { FnAction, useTimedActionV1, useTimedActionV2 } from '../src/useTimedAction';

function makeHook1(fnAction: FnAction, delay: number, skipIfEnqueued: boolean, id: string) {
  return renderHook(() => useTimedActionV1(fnAction, delay, skipIfEnqueued, id));
}
function makeHook2(id: string) {
  return renderHook(() => useTimedActionV2(id));
}

async function waitFor(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}

describe('useTimedAction | V1 (skip)', () => {
  it('initialization', () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, true, '1a');

    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).not.toHaveBeenCalled();
    expect(result.current.cancel()).toBeFalsy();
  });

  it('enqueue once', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, true, '1b');

    const promise = act(() => result.current.enqueue());
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(fnAction).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, true, '1c');

    const promise = act(() => {
      const promise = result.current.enqueue();
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, true, '1d');

    await act(async () => {
      const promise1 = result.current.enqueue();
      const promise2 = result.current.enqueue();
      const promise3 = result.current.enqueue();
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, true, '1e');

    await act(async () => {
      result.current.enqueue();
      await waitFor(30);
      result.current.enqueue();
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useTimedAction | V1 (no skip)', () => {
  it('initialization', () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, false, '2a');
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).not.toHaveBeenCalled();
    expect(result.current.cancel()).toBeFalsy();
  });

  it('enqueue once', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, false, '2b');

    const promise = act(() => result.current.enqueue());
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(fnAction).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, false, '2c');

    const promise = act(() => {
      const promise = result.current.enqueue();
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, false, '2d');

    await act(async () => {
      const promise1 = result.current.enqueue();
      const promise2 = result.current.enqueue();
      const promise3 = result.current.enqueue();
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook1(fnAction, 50, false, '2e');

    await act(async () => {
      result.current.enqueue();
      await waitFor(30);
      result.current.enqueue();
      await waitFor(30);
      result.current.enqueue();
      await waitFor(30);
      result.current.enqueue();
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
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
    const fnAction = jest.fn();
    const { result } = makeHook2('3b');

    const promise = act(() => result.current.enqueue(fnAction, 50, true));
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(fnAction).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook2('3c');

    const promise = act(() => {
      const promise = result.current.enqueue(fnAction, 50, true);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const fnAction1 = jest.fn();
    const fnAction2 = jest.fn();
    const fnAction3 = jest.fn();
    const { result } = makeHook2('3d');

    await act(async () => {
      const promise1 = result.current.enqueue(fnAction1, 50, true);
      const promise2 = result.current.enqueue(fnAction2, 50, true);
      const promise3 = result.current.enqueue(fnAction3, 50, true);
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction1).toHaveBeenCalledTimes(0);
      expect(fnAction2).toHaveBeenCalledTimes(0);
      expect(fnAction3).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction1).toHaveBeenCalledTimes(1);
      expect(fnAction2).toHaveBeenCalledTimes(0);
      expect(fnAction3).toHaveBeenCalledTimes(0);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook2('3e');

    await act(async () => {
      result.current.enqueue(fnAction, 50, true);
      await waitFor(30);
      result.current.enqueue(fnAction, 50, true);
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction).toHaveBeenCalledTimes(1);
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
    const fnAction = jest.fn();
    const { result } = makeHook2('4b');

    const promise = act(() => result.current.enqueue(fnAction, 50, false));
    expect(result.current.isEnqueued()).toBeTruthy();
    expect(fnAction).toHaveBeenCalledTimes(0);

    await promise;
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(1);
  });

  it('cancel', async () => {
    const fnAction = jest.fn();
    const { result } = makeHook2('4c');

    const promise = act(() => {
      const promise = result.current.enqueue(fnAction, 50, false);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction).toHaveBeenCalledTimes(0);
      result.current.cancel();
      return promise;
    });

    await expect(promise).rejects.toEqual(undefined);
    expect(result.current.isEnqueued()).toBeFalsy();
    expect(fnAction).toHaveBeenCalledTimes(0);
  });

  it('enqueue repeatedly', async () => {
    const fnAction1 = jest.fn();
    const fnAction2 = jest.fn();
    const fnAction3 = jest.fn();
    const { result } = makeHook2('4d');

    await act(async () => {
      const promise1 = result.current.enqueue(fnAction1, 50, false);
      const promise2 = result.current.enqueue(fnAction2, 50, false);
      const promise3 = result.current.enqueue(fnAction3, 50, false);
      expect(promise1).toBe(promise2);
      expect(promise1).toBe(promise3);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction1).toHaveBeenCalledTimes(0);
      expect(fnAction2).toHaveBeenCalledTimes(0);
      expect(fnAction3).toHaveBeenCalledTimes(0);

      await Promise.all([promise1, promise2, promise3]);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction1).toHaveBeenCalledTimes(0);
      expect(fnAction2).toHaveBeenCalledTimes(0);
      expect(fnAction3).toHaveBeenCalledTimes(1);
    });
  });

  it('enqueue repeatedly timing', async () => {
    const fnAction1 = jest.fn();
    const fnAction2 = jest.fn();
    const fnAction3 = jest.fn();
    const fnAction4 = jest.fn();
    const { result } = makeHook2('4e');

    await act(async () => {
      result.current.enqueue(fnAction1, 50, false);
      await waitFor(30);
      result.current.enqueue(fnAction2, 50, false);
      await waitFor(30);
      result.current.enqueue(fnAction3, 50, false);
      await waitFor(30);
      result.current.enqueue(fnAction4, 50, false);
      await waitFor(30);
      expect(result.current.isEnqueued()).toBeTruthy();
      expect(fnAction1).toHaveBeenCalledTimes(0);
      expect(fnAction2).toHaveBeenCalledTimes(0);
      expect(fnAction3).toHaveBeenCalledTimes(0);
      expect(fnAction4).toHaveBeenCalledTimes(0);
      await waitFor(50);
      expect(result.current.isEnqueued()).toBeFalsy();
      expect(fnAction1).toHaveBeenCalledTimes(0);
      expect(fnAction2).toHaveBeenCalledTimes(0);
      expect(fnAction3).toHaveBeenCalledTimes(0);
      expect(fnAction4).toHaveBeenCalledTimes(1);
    });
  });
});
