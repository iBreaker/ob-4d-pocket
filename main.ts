import { Plugin, Editor, MarkdownView, moment } from 'obsidian';

export default class FourDPocketPlugin extends Plugin {
  async onload() {
    console.log('4D Pocket is loading...');

    this.addCommand({
      id: 'create-idea',
      name: 'CreateIdea',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const today = new Date().toISOString().split('T')[0];
        const ideaTemplate = `- [ ] #todo #idea  ➕ ${today} ✅ ${today}`;
        
        const currentLine = editor.getCursor().line;
        const currentLineContent = editor.getLine(currentLine);
        
        if (currentLineContent.trim() !== '') {
          // 如果当前行不为空，在下一行插入
          editor.replaceRange('\n' + ideaTemplate, { line: currentLine + 1, ch: 0 });
          editor.setCursor({ line: currentLine + 1, ch: 18 }); // 将光标移动到 "#idea " 之后
        } else {
          // 如果当前行为空，直接在当前行插入
          editor.replaceRange(ideaTemplate, { line: currentLine, ch: 0 });
          editor.setCursor({ line: currentLine, ch: 18 }); // 将光标移动到 "#idea " 之后
        }
      }
    });

    this.addCommand({
      id: 'create-work',
      name: 'CreateWork',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const selection = editor.getSelection();
        const today = moment().format('YYYY-MM-DD');
        const taskTemplate = `- [ ] #todo #work ${selection} ➕ ${today} ✅ ${today}`;
        editor.replaceSelection(taskTemplate);
      }
    });

    console.log('4D Pocket loaded successfully');
  }

  onunload() {
    console.log('卸载 4D Pocket');
  }
}