# React Hook | useTimedAction

# 1. Introduction

A useful hook that allows using `setTimeout` in a React way, while exposing a host of configuration and invocation options to allow the caller to customize behavior as needed.

The hook accepts an object with 3 optional properties:
1. `callback`: The callback to be executed.
1. `delay`: Delay in milliseconds after which the callback should be executed.
1. `skipIfEnqueued`: Configures whether repeated `enqueue` calls are ignored if the callback has already been scheduled, but not executed yet.

The hook returns an object with 4 methods:
1. `enqueue`: Schedules, or re-schedules, a callback for delayed execution.
1. `cancel`: Cancels execution of a scheduled callback.
1. `inEnqueued`: Checks whether a callback has been scheduled for delayed execution.

### `enqueue()`

This method schedules or re-schedules a callback for delayed execution.

It optionally accepts a configuration override object with the same properties as for hook initialization. This allows customizing the callback, delay and skip config on a per-invocation basis.

The method also returns a `Promise` that is resolved or rejected when the callback executes, or is cancelled. This enables caller code to resume after the callback has executed. Multiple `enqueue` calls return the same `Promise` instance as long as the callback is still enqueued. This means that if the caller is waiting on multiple `enqueue` promises, all of them will be resolved once the callback executes.

The `skipIfEnqueued` property (initial or overridden) allows further customization of this method's behavior:
- If `skipIfEnqueued = true`, multiple invocations of `enqueue` will not re-scheduled the callback, until it has been executed.
- If `skipIfEnqueued = false`, multiple invocations of `enqueue` will cancel and re-schedule the callback.

### `cancel()`

This method cancels a previously scheduled callback and return `true`. Additionally, it causes the promises returned by `enqueue` method to be rejected. If no callback has been scheduled, the method returns `false`.

### `isEnqueued()`

This method returns a boolean value that indicates whether a callback has been scheduled (`true`) or not (`false`).

# 2. Installation

```sh
npm i --save @awesim/use-timed-action

yarn add @awesim/use-timed-action
```

# 3. Usage

```Typescript
const myCallback = useCallback(() => {
  console.log('My Callback');
}, []);

const { enqueue, cancel, isEnqueued } = useTimedAction({ 
  callback: myCallback, 
  delay: 1000, 
  skipIfEnqueued: true 
});

const promise = enqueue();

promise.then(() => {
  console.log('Done!');
}).catch(ex) => {
  console.warn('Cancelled!');
}

setTimeout(() => {
  cancel();
}, 500);

```
