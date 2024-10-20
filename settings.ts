import { App, Notice, PluginSettingTab, Setting, TextAreaComponent } from 'obsidian';
import FourDPocketPlugin from './main';

export interface FourDPocketSettings {
  configuredLocations: string[];
}

export const DEFAULT_SETTINGS: FourDPocketSettings = {
  configuredLocations: []
}

export class FourDPocketSettingTab extends PluginSettingTab {
  plugin: FourDPocketPlugin;

  constructor(app: App, plugin: FourDPocketPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('配置的路径')
      .setDesc('输入您想要快速访问的文件或文件夹路径。每行一个路径。')
      .addTextArea(text => text
        .setPlaceholder('例如:\n文件夹1/笔记1.md\n文件夹2/子文件夹')
        .setValue(this.plugin.settings.configuredLocations.join('\n'))
        .onChange(async (value: string) => { // 添加类型注解
          this.plugin.settings.configuredLocations = value.split('\n').filter((line: string) => line.trim() !== '');
          await this.plugin.saveSettings();
          new Notice('配置已更新，请重新加载插件以应用更改。');
        })
        .then((textArea: TextAreaComponent) => {
          textArea.inputEl.style.width = "100%";
          textArea.inputEl.style.height = "200px"; // 设置高度为200px
          textArea.inputEl.style.resize = "vertical"; // 允许垂直调整大小
        }));
  }
}
