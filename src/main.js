import { createRoot } from 'react-dom/client';
import '@fontsource/vazirmatn/200.css';
import '@fontsource/vazirmatn/300.css';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/600.css';
import '@fontsource/vazirmatn/800.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import './styles.css';
import { React } from './lib/html.js';
import { App } from './App.js';

createRoot(document.getElementById('root')).render(React.createElement(App));
