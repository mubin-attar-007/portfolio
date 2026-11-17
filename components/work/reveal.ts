/**
 * The reveal contract: before a control scrolls to an element, it sends
 * `REVEAL_EVENT` from that element (bubbling). A container that can hide its
 * content, such as a set of tab panels, shows the part that holds the element,
 * synchronously, so the scroll that follows lands on something visible.
 * Nobody listening is fine: the event is a request, not a requirement.
 */
export const REVEAL_EVENT = "ui:reveal";

/** Ask whatever hides `element` to show it. Call it right before scrolling to it. */
export function reveal(element: Element): void {
  element.dispatchEvent(new CustomEvent(REVEAL_EVENT, { bubbles: true }));
}
