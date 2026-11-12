import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import App from './App';

// Server rendering does not run the compatibility fetch. Exercise this brand's
// composition with the real released viewer hooks and components here; browser
// qualification separately verifies the actual engine compatibility gate.
vi.mock('@subcult/archive-viewer', async importOriginal => ({
  ...await importOriginal<typeof import('@subcult/archive-viewer')>(),
  Compatibility: ({ children }: { children: ReactNode }) => children,
}));

test('released viewer composes with Democracy Now navigation, assets and source credit', () => {
  const html = renderToStaticMarkup(<App />);
  expect(html).toContain('aria-label="Democracy Now! archive home"');
  expect(html).toContain('/brand/democracy-now-tv/mark.svg');
  expect(html).toContain('NOT AFFILIATED WITH DEMOCRACY NOW!');
  expect(html).toContain('/assets/amy-goodman.png');
  expect(html).toContain('Broadcast archive');
  expect(html).toContain('Video streamed from Internet Archive');
  expect(html).toContain('href="#library"');
  expect(html).toContain('Loading episodes');
});
