export const safe = <T>(label: string, call: () => T, onCatch?: () => void, onFinal?: () => void): T | undefined => {
    try {
        return call();
    } catch (e: unknown) {
        onCatch?.();
        console.error(label);
    } finally {
        onFinal?.();
    }
};
