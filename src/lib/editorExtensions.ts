import { EditorOptions } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import { Document as DocExt } from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Highlight from '@tiptap/extension-highlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import ArticleNode from '~/components/Editor/extensions/Article'
import { CustomBlockquote } from '~/components/Editor/extensions/CustomBlockquote'
import { Figcaption } from '~/components/Editor/extensions/Figcaption'
import { Figure } from '~/components/Editor/extensions/Figure'
import { Footnote } from '~/components/Editor/extensions/Footnote'
import { Iframe } from '~/components/Editor/extensions/Iframe'
import { Span } from '~/components/Editor/extensions/Span'
import { ToggleTextWrap } from '~/components/Editor/extensions/ToggleTextWrap'
import { TrailingNode } from '~/components/Editor/extensions/TrailingNode'

export const base: EditorOptions['extensions'] = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4]
    },
    horizontalRule: {
      HTMLAttributes: {
        class: 'horizontalRule'
      }
    },
    blockquote: undefined
  }),
  Underline, // не входит в StarterKit
  Link.configure({ autolink: true, openOnClick: false }),
  Image,
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: 'highlight'
    }
  })
]

export const minimal: EditorOptions['extensions'] = [
  DocExt,
  Text,
  Paragraph,
  Bold,
  Italic,
  Link.configure({ autolink: true, openOnClick: false })
]

// Extend the Figure extension to include Figcaption
export const ImageFigure = Figure.extend({
  name: 'capturedImage',
  content: 'figcaption image'
})

export const custom: EditorOptions['extensions'] = [
  ImageFigure,
  Figure,
  Figcaption,
  Iframe,
  ToggleTextWrap,
  Span,
  TrailingNode
]

export const extended: EditorOptions['extensions'] = [
  HorizontalRule.configure({ HTMLAttributes: { class: 'horizontalRule' } }),
  Highlight.configure({ multicolor: true, HTMLAttributes: { class: 'highlight' } }),
  Dropcursor,
  CustomBlockquote,
  Span,
  ToggleTextWrap,
  Footnote,
  Focus,
  Gapcursor,
  HardBreak,
  ArticleNode
]
