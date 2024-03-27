export default function trimAllProperties<T>(obj: T) {
    // silences TS errors, the same as const copy = {...obj}
    const copy: {[index: string]: unknown} = {...obj as {[index: string]: unknown}};

    for (const key in copy) {
        if (Object.hasOwnProperty.call(copy, key)) {
            const element = copy[key];
            if (typeof element === 'string' ) copy[key] = element.trim();
        }
    }
    // return object of the same type as input
    return copy as typeof obj;
}
