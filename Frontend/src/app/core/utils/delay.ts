export const delay = (ms: number) => {
    return new Promise<void>(resolve => {
        const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            resolve();
        }, ms);
    });
};
