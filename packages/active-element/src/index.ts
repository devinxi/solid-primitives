import { access, Fn, isClient, MaybeAccessor } from "solid-fns";
import { Accessor, createMemo, createSignal, on, onCleanup } from "solid-js";

/**
 * A reactive `document.activeElement`. Check which element is currently focused.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/active-element#createActiveElement
 * @example
 * const [activeEl, { stop, start }] = createActiveElement()
 */
export function createActiveElement(): [
  getter: Accessor<null | Element>,
  actions: { stop: Fn; start: Fn }
] {
  const [active, setActive] = createSignal<Element | null>(null);
  const handleChange = isClient ? () => setActive(window.document.activeElement) : () => {};

  let stop: Fn = () => {};
  const start = () => {
    stop();
    if (isClient) {
      addEventListener("blur", handleChange, true);
      addEventListener("focus", handleChange, true);
      stop = () => {
        removeEventListener("blur", handleChange, true);
        removeEventListener("focus", handleChange, true);
      };
    }
  };
  start();
  onCleanup(stop);

  return [
    active,
    {
      stop,
      start
    }
  ];
}

/**
 * Pass in an element, and see if it's focused.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/active-element#createIsElementActive
 * @example
 * const [isFocused, { stop, start }] = createIsElementActive(() => el)
 */
export function createIsElementActive(
  target: MaybeAccessor<Element>
): [getter: Accessor<boolean>, actions: { stop: Fn; start: Fn }] {
  const [active, actions] = createActiveElement();
  return [
    createMemo(
      on(
        () => access(target),
        el => el && active() === el
      )
    ),
    actions
  ];
}
