export interface CommandItem {
  id: string
  title: string
  description: string
  iconName: string
  execute: (editor: any) => void
}

export class SlashCommandService {
  static getRange(editor: any) {
    const { selection } = editor.state
    const { $from } = selection
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\uFFFC')
    const slashIndex = textBefore.lastIndexOf('/')
    if (slashIndex === -1) return { from: $from.pos, to: $from.pos }
    const fromPos = $from.start() + slashIndex
    return { from: fromPos, to: $from.pos }
  }

  static applyCommand(editor: any, type: string) {
    const range = this.getRange(editor)
    const chain = editor.chain().focus().deleteRange(range)

    switch (type) {
      case 'h1':
        return chain.toggleHeading({ level: 1 }).run()
      case 'h2':
        return chain.toggleHeading({ level: 2 }).run()
      case 'h3':
        return chain.toggleHeading({ level: 3 }).run()
      case 'todo':
        return chain.toggleTaskList().run()
      case 'bullet':
        return chain.toggleBulletList().run()
      case 'number':
        return chain.toggleOrderedList().run()
      case 'quote':
        return chain.toggleBlockquote().run()
      case 'code':
        return chain.toggleCodeBlock().run()
      case 'highlight':
        return chain.toggleHighlight().run()
      default:
        return chain.setParagraph().run()
    }
  }
}
