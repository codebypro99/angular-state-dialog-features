# Angular Loading State and Dialog Feature Samples

Two Angular and TypeScript feature excerpts showing reusable asynchronous loading state and an extensible dialog cancellation workflow.

## Purpose

These samples demonstrate how I extract recurring interface behavior into small abstractions: a signal-based loading handle and a base class for dialogs with optional cancellation confirmation.

## Loading State with Cache Fallback

**Source:** [loadable.ts](./features/loadable.ts)

Creates a loading handle with a read-only state signal and a `reload()` operation. Data fetching and cache access are supplied through a source interface.

### Implementation Highlights

- Starts in an idle state and transitions through loading, ready, or error states.
- Retains previously available data as `stale` while loading or reporting an error.
- Attempts a network fetch unless the optional connectivity function explicitly returns false.
- Falls back to cached data when the network fetch fails or is skipped.
- Labels successful data as originating from the network or cache.
- Uses a generation counter to prevent an older reload from overwriting state after a newer reload starts.
- Preserves the network error when both the network and cache fail; otherwise reports the cache error or a fallback `Offline` error.
- Provides `getLoadableData()` to retrieve current or stale data from the state.

**What this demonstrates:** representing asynchronous data state explicitly, preserving useful data during refresh, and protecting state updates from out-of-order completion.

**Behavior boundary:** the generation guard does not cancel underlying requests. Cache storage, cache freshness, and network-to-cache writes belong to the supplied source implementation. The referenced model interfaces are outside this excerpt.

## Dialog Cancellation Base

**Source:** [dialog-base.ts](./features/dialog-base.ts)

An abstract base component for Angular Material dialogs that optionally asks for confirmation before closing through `onCancel()`.

### Implementation Highlights

- Injects Angular Material's dialog service and the current dialog reference.
- Closes directly when confirmation is not required.
- Opens a separate confirmation dialog when `requireConfirmation()` returns true.
- Observes one confirmation result and closes the original dialog only when the result is truthy.
- Allows derived classes to override `requireConfirmation()`.
- Requires derived classes to implement their own `onSave()` operation.

**What this demonstrates:** defining a reusable interaction workflow while leaving confirmation criteria and save behavior to individual dialogs.

**Behavior boundary:** dirty-form detection is not implemented in the base class. The workflow applies to explicit calls to `onCancel()`; Escape and backdrop behavior depend on the surrounding dialog configuration. The shared base component and confirmation-dialog implementation are outside this collection.

## Technologies

Angular Signals, TypeScript generics, asynchronous source interfaces, Angular dependency injection, Angular Material dialogs, and RxJS.

## About This Collection

These files are feature excerpts for portfolio presentation and code review. Original source code and imports are preserved without application scaffolding or additional dependencies.

Descriptions are based on source inspection. The excerpts have not been compiled or executed in isolation.

## Portfolio Message

I can extract recurring Angular interface behavior into focused abstractions for loading state, cache fallback, and configurable dialog interactions.
