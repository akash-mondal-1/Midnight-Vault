// Shim for isomorphic-ws in Next.js/Webpack ESM environment
const ws = typeof WebSocket !== 'undefined' ? WebSocket : undefined;
export default ws;
export { ws as WebSocket };
