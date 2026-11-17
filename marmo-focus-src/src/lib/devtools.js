// Developer tools (coin injector, era switcher, timer speed-up) exist only in development builds.
// `npm run dev` has them; release builds (`npm run build`) do not, unless built with VITE_DEV_TOOLS=true.
export const DEV_TOOLS = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === 'true';
