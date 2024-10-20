import { Plugin, Editor, MarkdownView, moment, TFile, TFolder, Notice, Menu } from 'obsidian';
import { FourDPocketSettings, DEFAULT_SETTINGS, FourDPocketSettingTab } from './settings';

export default class FourDPocketPlugin extends Plugin {
  settings: FourDPocketSettings;
  private addedCommandIds: Set<string> = new Set();

  async onload() {
    console.log('4D Pocket is loading...');

    await this.loadSettings();

    // 添加设置选项卡
    this.addSettingTab(new FourDPocketSettingTab(this.app, this));

    // 添加 CreateIdea 命令
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
          editor.setCursor({ line: currentLine, ch: 18 }); // 光标移动到 "#idea " 之后
        }
      }
    });

    // 添加 CreateWork 命令
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

    // 动态添加打开配置路径的命令
    this.addCommandsForConfiguredLocations();

    console.log('4D Pocket loaded successfully');
  }

  onunload() {
    console.log('卸载 4D Pocket');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // After saving settings, reload commands
    this.reloadCommands();
  }

  // Helper function to sanitize path for command IDs
  sanitizePath(path: string): string {
    return path.replace(/[\/\\:]/g, '-').replace(/\s+/g, '-').toLowerCase();
  }

  // Function to add commands for each configured path
  addCommandsForConfiguredLocations() {
    // Iterate over each configured path and add a separate command
    this.settings.configuredLocations.forEach((path) => {
      const sanitizedPath = this.sanitizePath(path);
      const commandId = `fourdpocket-open-${sanitizedPath}`;
      const commandName = `Open "${path}"`;

      if (this.addedCommandIds.has(commandId)) {
        console.log(`Command "${commandId}" already exists. Skipping.`);
        return;
      }

      // Add command
      this.addCommand({
        id: commandId,
        name: commandName,
        callback: () => {
          this.openConfiguredLocation(path);
        }
      });

      this.addedCommandIds.add(commandId);
    });
  }

  // Function to reload commands. Since Obsidian API does not support removing commands, it's recommended to reload plugin.
  reloadCommands() {
    // Inform the user to reload the plugin
    new Notice('配置已更改。请重新加载插件以应用新命令。');
  }

  // 修改 openConfiguredLocation 方法，正确调用展开目录的方法
  openConfiguredLocation(path: string) {
    if (!path) {
      new Notice('无效的路径。');
      return;
    }

    const abstractFile = this.app.vault.getAbstractFileByPath(path);
    if (!abstractFile) {
      new Notice('未找到配置的路径。');
      return;
    }

    if (abstractFile instanceof TFile) {
      // 如果是文件，打开它
      this.app.workspace.openLinkText(path, '');
    } else if (abstractFile instanceof TFolder) {
      // 如果是文件夹，在文件浏览器中展开它
      const explorerLeaves = this.app.workspace.getLeavesOfType('file-explorer');
      if (explorerLeaves.length > 0) {
        const explorerView = explorerLeaves[0].view;
        const tree = (explorerView as any).tree

        setCollapsed(tree, abstractFile as TFolder);
      } else {
        new Notice('文件浏览器未打开。请先打开文件浏览器。');
      }
    }
  }
}


// 递归展开文件夹
function setCollapsed(tree: any, folder: TFolder) {

  const parent = folder.parent;
  if (parent) {
    setCollapsed(tree, parent as TFolder);
  }

  console.log(folder.path, tree.view.fileItems[folder.path]);
  if (tree.view.fileItems[folder.path] === undefined) {
    return;
  }

  if (!tree.view.fileItems[folder.path].collapsed) {
    return;
  }

  tree.view.fileItems[folder.path].toggleCollapsed();
}


