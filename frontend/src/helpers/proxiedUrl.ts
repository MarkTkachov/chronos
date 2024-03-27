export function proxiedUrl( url: string): string {
    return `${import.meta.env.VITE_CORS_PROXY_URL}${encodeURIComponent(url)}`;
}
