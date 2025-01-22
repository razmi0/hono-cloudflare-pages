export const withViewTransition = (call: () => void) => {
    if (document.startViewTransition) {
        document.startViewTransition(call);
        return;
    }
    call();
};
