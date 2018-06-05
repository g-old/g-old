import React from 'react';

const BLOCK_TAGS = {
  blockquote: 'block-quote',
  p: 'paragraph',
  pre: 'code',
  h1: 'heading-one',
  h2: 'heading-two',
  h3: 'heading-three',
  h4: 'heading-four',
  h5: 'heading-five',
  h6: 'heading-six',
  li: 'list-item',
  ul: 'bulleted-list',
};

const MARK_TAGS = {
  em: 'italic',
  strong: 'bold',
  u: 'underline',
};

const INLINE_TAGS = {
  a: 'link',
  image: 'image',
  img: 'image',
};

export default [
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'block',
          type,
          nodes: next(el.childNodes),
        };
      }
      return undefined;
    },
    serialize(obj, children) {
      if (obj.object === 'block') {
        switch (obj.type) {
          case 'code':
            return (
              <pre>
                <code>{children}</code>
              </pre>
            );
          case 'paragraph':
            return <p>{children}</p>;
          case 'block-quote':
            return <blockquote>{children}</blockquote>;
          case 'heading-one':
            return <h1>{children}</h1>;
          case 'heading-two':
            return <h2>{children}</h2>;
          case 'heading-three':
            return <h3>{children}</h3>;
          case 'heading-four':
            return <h4>{children}</h4>;
          case 'heading-five':
            return <h5>{children}</h5>;
          case 'heading-six':
            return <h6>{children}</h6>;
          case 'list-item':
            return <li>{children}</li>;
          case 'bulleted-list':
            return <ul>{children}</ul>;
          case 'image': {
            const src = obj.data.get('src');
            return <img alt="img" src={src} />;
          }
          default:
            throw new Error(`Type not recognized: ${obj.type}`);
        }
      }
      return undefined;
    },
  },

  {
    deserialize(el, next) {
      const type = MARK_TAGS[el.tagName.toLowerCase()];
      if (type) {
        return {
          object: 'mark',
          type,
          nodes: next(el.childNodes),
        };
      }
      return undefined;
    },
    serialize(obj, children) {
      if (obj.object === 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underline':
            return <u>{children}</u>;
          default:
            throw new Error(`Type not recognized: ${obj.type}`);
        }
      }
      return undefined;
    },
  },
  {
    deserialize(el, next) {
      const type = INLINE_TAGS[el.tagName.toLowerCase()];
      if (type) {
        const data = {};

        if (el.href) {
          data.href = el.href;
        }
        if (el.src) {
          data.src = el.src;
        }
        const isVoid = type === 'image';
        if (isVoid) {
          return { object: 'inline', type, data, isVoid };
        }
        return { object: 'inline', type, data, nodes: next(el.childNodes) };
      }
      return undefined;
    },
    serialize(obj, children) {
      if (obj.object === 'inline') {
        switch (obj.type) {
          case 'link': {
            const href = obj.data.get('href');
            const props = { href };
            return <a {...props}>{children} </a>;
          }
          default:
        }
      }
      if (obj.type === 'image') {
        const src = obj.data.get('src');
        return <img alt="img" src={src} />;
      }
      return undefined;
    },
  },
];
