import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '../../lib/cn'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-[15px] transition-colors',
        active ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-100',
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange, placeholder = 'Type here' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose-editor min-h-[120px] px-4 py-3 text-sm text-gray-700 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  // Sync external value changes (e.g. loading a question for editing / reset).
  useEffect(() => {
    if (!editor) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  function setLink() {
    const prev = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor!.chain().focus().unsetLink().run()
      return
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-lg border-[0.5px] border-gray-400 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 px-3 py-1.5">
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
          🔗
        </ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          •
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <span className="text-xs">✕</span>
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
