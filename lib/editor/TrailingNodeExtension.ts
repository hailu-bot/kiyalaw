import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export const TrailingNode = Extension.create({
  name: 'trailingNode',

  addOptions() {
    return {
      node: 'paragraph',
      notAfter: ['paragraph'],
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('trailingNode'),
        appendTransaction: (_transactions, _oldState, newState) => {
          const { doc, tr, schema } = newState;
          const shouldInsert = !this.options.notAfter.includes(doc.lastChild?.type.name);
          const endPosition = doc.content.size;

          if (shouldInsert) {
            const nodeType = schema.nodes[this.options.node];
            if (nodeType) {
              tr.insert(endPosition, nodeType.create());
            }
          }

          return tr;
        },
      }),
    ];
  },
});
