import { Plugin, Editor, MarkdownView, moment } from 'obsidian';

export default class FourDPocketPlugin extends Plugin {
  async onload() {
    console.log('4D Pocket is loading...');

    this.addCommand({
      id: 'create-idea',
      name: 'CreateIdea',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const today = new Date().toISOString().split('T')[0];
        const ideaTemplate = `- [ ] #todo #idea  ➕ ${today}`;
        
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
        let selection = editor.getSelection();
        const today = moment().format('YYYY-MM-DD');
        
        const cursor = editor.getCursor();
        const currentLine = cursor.line;
        const currentLineContent = editor.getLine(currentLine);
        
        // 获取当前行的缩进，添加空值检查
        const indentationMatch = currentLineContent.match(/^[\s\t]*/);
        const indentation = indentationMatch ? indentationMatch[0] : '';
        
        if (!selection) {
          // 如果没有选择任何内容，获取当前行的内容（去除缩进）
          selection = currentLineContent.trim();
        }
        
        // 去除序号
        selection = selection.replace(/^\d+\.\s*/, '');
        
        const taskTemplate = `${indentation}- [ ] #todo #work ${selection.trim()} ➕ ${today}`;
        
        // 替换整行内容
        editor.replaceRange(taskTemplate, 
          { line: currentLine, ch: 0 }, 
          { line: currentLine, ch: currentLineContent.length }
        );

        // 将光标移动到 ➕ ${today} 之前
        const cursorPosition = taskTemplate.indexOf(' ➕ ');
        editor.setCursor({ line: currentLine, ch: cursorPosition });
      }
    });

    console.log('4D Pocket loaded successfully');
  }

  onunload() {
    console.log('卸载 4D Pocket');
  }
}