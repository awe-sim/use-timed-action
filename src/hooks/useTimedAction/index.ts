import { useCallback, useRef } from 'react';

const DEBUG = true;
function log(message: string, id?: string) {
  // eslint-disable-next-line no-console
  if (DEBUG && id) console.log(message, id);
}

export type FnAction = () => void;

// eslint-disable-next-line no-unused-vars
type FnResolve = (value: void | PromiseLike<void>) => void;

// eslint-disable-next-line no-unused-vars
type FnReject = (reason?: any) => void;

type PromiseCallbacks = {
  promise: Promise<void>;
  fnResolve: FnResolve;
  fnReject: FnReject;
};

function promisify(id?: string): PromiseCallbacks {
  log('useTimedAction :: Creating new promise...', id);
  let fnResolve: FnResolve = () => {};
  let fnReject: FnReject = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    fnResolve = resolve;
    fnReject = reject;
  });
  return { promise, fnResolve, fnReject };
}

export function useTimedActionV1(fnAction: FnAction, delay: number, skipIfEnqueued: boolean, id?: string) {
  //
  const refTimer = useRef<NodeJS.Timeout>();
  const refData = useRef(promisify(id));
  const isEnqueued = useCallback(() => !!refTimer.current, []);

  const enqueue = useCallback(() => {
    if (refTimer.current) {
      if (skipIfEnqueued) {
        log('useTimedAction :: Already enqueued. Returning same promise...', id);
        return refData.current.promise;
      }
      log('useTimedAction :: Cancelling...', id);
      clearTimeout(refTimer.current);
      refTimer.current = undefined;
    }
    refTimer.current = setTimeout(() => {
      log('useTimedAction :: Executing and resolving promise...', id);
      fnAction();
      refTimer.current = undefined;
      refData.current.fnResolve();
      refData.current = promisify(id);
    }, delay);
    log('useTimedAction :: Enqueuing...', id);
    return refData.current.promise;
  }, [delay, fnAction, id, skipIfEnqueued]);

  const cancel = useCallback(() => {
    if (!refTimer.current) return false;
    log('useTimedAction :: Cancelling and rejecting promise...', id);
    clearTimeout(refTimer.current);
    refData.current.fnReject();
    refTimer.current = undefined;
    refData.current = promisify(id);
    return true;
  }, [id]);

  return { enqueue, cancel, isEnqueued };
}

export function useTimedActionV2(id?: string) {
  //
  const refTimer = useRef<NodeJS.Timeout>();
  const refData = useRef(promisify(id));
  const isEnqueued = useCallback(() => !!refTimer.current, []);

  const enqueue = useCallback(
    (fnAction: FnAction, delay: number, skipIfEnqueued: boolean) => {
      if (refTimer.current) {
        if (skipIfEnqueued) {
          log('useTimedAction :: Already enqueued. Returning same promise...', id);
          return refData.current.promise;
        }
        log('useTimedAction :: Cancelling...', id);
        clearTimeout(refTimer.current);
        refTimer.current = undefined;
      }
      refTimer.current = setTimeout(() => {
        log('useTimedAction :: Executing and resolving promise...', id);
        fnAction();
        refTimer.current = undefined;
        refData.current.fnResolve();
        refData.current = promisify(id);
      }, delay);
      log('useTimedAction :: Enqueuing...', id);
      return refData.current.promise;
    },
    [id]
  );

  const cancel = useCallback(() => {
    if (!refTimer.current) return false;
    log('useTimedAction :: Cancelling and rejecting promise...', id);
    clearTimeout(refTimer.current);
    refData.current.fnReject();
    refTimer.current = undefined;
    refData.current = promisify(id);
    return true;
  }, [id]);

  return { enqueue, cancel, isEnqueued };
}
