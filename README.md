# React Hook - useTimedAction

# 1. Installation

```sh
npm i --save @awesim/use-timed-action
```
```sh
yarn add @awesim/use-timed-action
```

# 2. Introduction

The `setTimeout` method is a great way to schedule a callback for delayed execution. The following are three main use cases for it:
1. Delaying a processor intensive callback until after UI animations have completed.
2. Showing a busy spinner only if the an API takes longer than `x` seconds.
3. Debouncing or throttling API calls to the server.

The `useTimedAction` react hook encapsulates `setTimeout` is a React-friendly way, while exposing a host of configuration and invocation options to allow the caller to customize behavior as needed.

# 3. `useTimedAction(options)`

The hook accepts an object with 3 optional properties:
1. `callback`: The callback to be executed.
2. `delay`: Delay in milliseconds after which the callback should be executed.
3. `skipIfAlreadyEnqueued`: Configures whether repeated `enqueue()` calls are ignored if the callback has already been scheduled, but not executed yet.

And returns an object with the following methods:

## 3.1. `enqueue()`

This method schedules or re-schedules a callback for delayed execution, and returns a `Promise` that is resolved when the callback executes, or rejects when `cancel()` is invoked.

It accepts a configuration override object with the same properties as for hook initialization. This allows customizing the callback, delay and skip config on a per-invocation basis.

Multiple `enqueue` calls return the same `Promise` instance as long as the callback is still enqueued. This means that if the caller is waiting on multiple `enqueue` promises, all of them will be resolved once the callback executes.

The `skipIfAlreadyEnqueued` property (initial or overridden) allows further customization of this method's behavior:
- If `skipIfAlreadyEnqueued = true`, multiple invocations of `enqueue` will be ignored until the callback has been executed.
- If `skipIfAlreadyEnqueued = false`, multiple invocations of `enqueue` will cancel and re-schedule the callback.

## 3.2. `cancel()`

This method cancels a previously scheduled callback and return `true`. Additionally, it causes the promises returned by `enqueue` method to be rejected. If no callback has been scheduled, the method returns `false`.

## 3.3. `isEnqueued()`

This method returns a boolean value that indicates whether a callback has been scheduled (`true`) or not (`false`).

# 4. Usage

## 4.1. Option 1
```Typescript
const callback = useCallback(() => console.log('My Callback'), []);

const { enqueue, cancel, isEnqueued } = useTimedAction({});

const onClickEnqueue = useCallback(() => {
  enqueue({ callback, delay: 1000 })
    .then(() => console.log('Done!'))
    .catch((ex) => console.warn('Cancelled!'));
}, [enqueue]);

const onClickCancel = useCallback(() => {
  cancel();
}, [cancel]);

return (
  <div>
    <button onClick={onClickEnqueue}>Enqueue</button>
    <button onClick={onClickCancel}>Cancel</button>
    <div>Is Enqueued: {isEnqueued() ? 'YES' : 'NO'}</div>
  </div>
)
```

## 4.2. Option 2
```Typescript
const callback = useCallback(() => console.log('My Callback'), []);

const { enqueue, cancel, isEnqueued } = useTimedAction({ callback, delay: 1000, skipIfAlreadyEnqueued: true });

const onClickEnqueue = useCallback(() => {
  enqueue()
    .then(() => console.log('Done!'))
    .catch((ex) => console.warn('Cancelled!'));
}, [enqueue]);

const onClickCancel = useCallback(() => {
  cancel();
}, [cancel]);

return (
  <div>
    <button onClick={onClickEnqueue}>Enqueue</button>
    <button onClick={onClickCancel}>Cancel</button>
    <div>Is Enqueued: {isEnqueued() ? 'YES' : 'NO'}</div>
  </div>
)
```
