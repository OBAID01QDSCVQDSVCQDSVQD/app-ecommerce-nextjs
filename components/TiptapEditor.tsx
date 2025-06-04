'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Button } from '@/components/ui/button'
import { FiBold, FiItalic, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi'
import React from 'react'

// @ts-ignore
const FontSize: any = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['\"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },
  // @ts-ignore
  addCommands() {
    // @ts-ignore
    return {
      setFontSize: (size: any) => ({ chain }: any) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontSize,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  // @ts-ignore
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => editor.chain().focus().setFontSize(e.target.value).run();

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 items-center flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <FiBold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <FiItalic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <FiList className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <FiAlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <FiAlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <FiAlignRight className="h-4 w-4" />
        </Button>
        {/* Color Picker */}
        <input
          type="color"
          title="Couleur du texte"
          className="ml-2 w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
        />
        {/* Font Size Selector */}
        <select
          title="Taille de police"
          className="ml-2 rounded border-gray-300 dark:bg-gray-800 dark:text-gray-100"
          onChange={handleFontSizeChange}
          defaultValue=""
        >
          <option value="">Taille</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
} 