import type CspDev from 'csp-dev';

import { KEY_WORDS } from '../utils';

export function monaco(): CspDev.DirectiveDescriptor {
  return {
    'script-src': [
      '\'unsafe-eval\'',
      KEY_WORDS.BLOB,
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/loader.js',
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/editor/editor.main.js',
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/editor/editor.main.nls.js',
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/basic-languages/solidity/solidity.js',
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/basic-languages/elixir/elixir.js',
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/base/worker/workerMain.js',
    ],
    'style-src': [
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/editor/editor.main.css',
    ],
    'font-src': [
      'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs/base/browser/ui/codicons/codicon/codicon.ttf',
    ],
  };
}
