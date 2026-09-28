import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useHinge } from '../useHinge';
import { fakeHingeModule } from './expoStub';
import { bookState, closedState, flatState } from './fixtures';

afterEach(() => {
  cleanup();
  fakeHingeModule.reset();
});

describe('useHinge', () => {
  it('returns undefined on devices without a hinge', () => {
    const { result } = renderHook(() => useHinge());
    expect(result.current).toBeUndefined();
  });

  it('returns the current state on first render', () => {
    fakeHingeModule.state = bookState;
    const { result } = renderHook(() => useHinge());
    expect(result.current).toEqual(bookState);
  });

  it('re-renders on state changes', () => {
    fakeHingeModule.state = bookState;
    const { result } = renderHook(() => useHinge());

    act(() => fakeHingeModule.emit('onStateChange', { state: flatState }));
    expect(result.current).toEqual(flatState);

    act(() => fakeHingeModule.emit('onStateChange', { state: closedState }));
    expect(result.current).toEqual(closedState);
    expect(result.current?.fold).toBeUndefined();

    act(() => fakeHingeModule.emit('onStateChange', { state: null }));
    expect(result.current).toBeUndefined();
  });

  it('keeps the same reference when native reports an equal state', () => {
    fakeHingeModule.state = bookState;
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useHinge();
    });
    const first = result.current;
    const rendersBefore = renders;

    act(() => fakeHingeModule.emit('onStateChange', { state: structuredClone(bookState) }));

    expect(result.current).toBe(first);
    expect(renders).toBe(rendersBefore);
  });

  it('shares one native subscription and releases it after the last unmount', () => {
    fakeHingeModule.state = bookState;
    const a = renderHook(() => useHinge());
    const b = renderHook(() => useHinge());
    expect(fakeHingeModule.listenerCount('onStateChange')).toBe(1);

    a.unmount();
    expect(fakeHingeModule.listenerCount('onStateChange')).toBe(1);
    b.unmount();
    expect(fakeHingeModule.listenerCount('onStateChange')).toBe(0);
  });

  it('picks up changes that happened while nothing was subscribed', () => {
    fakeHingeModule.state = bookState;
    renderHook(() => useHinge()).unmount();

    fakeHingeModule.state = flatState;
    const { result } = renderHook(() => useHinge());
    expect(result.current).toEqual(flatState);
  });
});

describe('useHinge with native fold: null', () => {
  it('does not crash when the fold disappears', () => {
    fakeHingeModule.state = bookState;
    const { result } = renderHook(() => useHinge());
    const closed = { posture: 'closed', fold: null };
    act(() => fakeHingeModule.emit('onStateChange', { state: closed }));
    expect(result.current).toEqual({ posture: 'closed' });
    act(() => fakeHingeModule.emit('onStateChange', { state: closed }));
    expect(result.current).toEqual({ posture: 'closed' });
  });
});
