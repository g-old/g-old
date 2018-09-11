import sanitize from 'sanitize-html';

const options = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'p',
    'a',
    'ul',
    'ol',
    'nl',
    'li',
    'b',
    'i',
    'strong',
    'em',
    'strike',
    'code',
    'hr',
    'br',
    'div',
    'table',
    'thead',
    'caption',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'iframe',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'style'],
  },
  selfClosing: [
    'img',
    'br',
    'hr',
    'area',
    'base',
    'basefont',
    'input',
    'link',
    'meta',
  ],
  // URL schemes we permit
  allowedSchemes: ['http', 'https', 'ftp', 'mailto'],
  allowedSchemesByTag: { img: ['data'] },
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true,
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
  transformTags: {
    img(tagName, attribs) {
      return {
        tagName: 'img',
        attribs: {
          ...attribs,
          style: 'max-width: 100%',
        },
      };
    },
  },
};

export default function(text) {
  return sanitize(text, options);
}
