import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production builds ship prerendered markup inside #root, so hydrate it rather
// than discarding it. Dev serves an empty shell, so mount fresh there.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
