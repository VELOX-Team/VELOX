import { html } from '../lib/html.js';

const IC={heart:'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z',search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',arrow:'M5 12h14M13 6l6 6-6 6',left:'M19 12H5M11 6l-6 6 6 6',menu:'M4 7h16M4 12h16M4 17h16',bolt:'M13 2L4 14h7l-1 8 10-13h-7z',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',speed:'M4 17a9 9 0 1 1 16 0M12 15l4-5',gear:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3'};
Object.assign(IC,{plus:'M12 5v14M5 12h14',cam:'M4 8h3l2-3h6l2 3h3v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'});
export const Ic=({n,f})=>html`<svg viewBox="0 0 24 24" fill=${f?'currentColor':'none'} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d=${IC[n]}/></svg>`;
