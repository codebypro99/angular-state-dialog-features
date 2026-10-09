import { signal } from '@angular/core';
import {
  ELoadSource,
  ELoadStatus,
  type ILoadableHandle,
  type ILoadableSource,
  type TLoadable,
} from './loadable.model';

export function getLoadableData<T>(state: TLoadable<T>): T | undefined {
  switch (state.status) {
    case ELoadStatus.Ready:
      return state.data;
    case ELoadStatus.Loading:
    case ELoadStatus.Error:
      return state.stale;
    default:
      return undefined;
  }
}

export function createLoadable<T>(source: ILoadableSource<T>): ILoadableHandle<T> {
  const state = signal<TLoadable<T>>({ status: ELoadStatus.Idle });
  let generation = 0;

  function settle(gen: number, next: TLoadable<T>): TLoadable<T> {
    if (gen !== generation) return state();
    state.set(next);
    return next;
  }

  async function reload(): Promise<TLoadable<T>> {
    const gen = ++generation;
    const stale = getLoadableData(state());
    state.set(
      stale === undefined
        ? { status: ELoadStatus.Loading }
        : { status: ELoadStatus.Loading, stale },
    );

    let failure: unknown = null;
    if (source.online?.() !== false) {
      try {
        const data = await source.fetch();
        return settle(gen, { status: ELoadStatus.Ready, data, source: ELoadSource.Network });
      } catch (err) {
        failure = err;
      }
    }
    try {
      const hit = await source.cached();
      if (hit)
        return settle(gen, {
          status: ELoadStatus.Ready,
          data: hit.data,
          source: ELoadSource.Cache,
        });
    } catch (err) {
      failure ??= err;
    }
    const error = failure ?? new Error('Offline');
    return settle(
      gen,
      stale === undefined
        ? { status: ELoadStatus.Error, error }
        : { status: ELoadStatus.Error, error, stale },
    );
  }

  return { state: state.asReadonly(), reload };
}
