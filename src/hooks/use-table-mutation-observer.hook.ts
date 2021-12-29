export const useTableMutationObserverHook = (
  target: HTMLElement,
  mutationObserverCallback: (mutationList: MutationRecord[], observer: MutationObserver) => void
) => {
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
  };

  const observer = new MutationObserver(mutationObserverCallback);

  observer.observe(target, config);

  return observer;
};
