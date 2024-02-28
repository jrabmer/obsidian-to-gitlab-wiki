import { FileSuggest } from "fileSuggest";
import GitLabWikiConverterPlugin from "main";
import { PluginSettingTab, App, Setting, normalizePath } from "obsidian";

export interface GitLabWikiConverterSettings {
	exportPath: string;
	homeFilePath: string; // Without .md extension for nicer display in settings
}

export const DEFAULT_SETTINGS: GitLabWikiConverterSettings = {
	exportPath: '',
	homeFilePath: '',
}

export class GitLabWikiConverterSettingTab extends PluginSettingTab {
	plugin: GitLabWikiConverterPlugin;

	constructor(app: App, plugin: GitLabWikiConverterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Location')
			.setDesc('Specify the path to where you want to export converted vault.')
			.addText(text => text
				.setPlaceholder('Path')
				.setValue(this.plugin.settings.exportPath)
				.onChange(async (value) => {
					this.plugin.settings.exportPath = normalizePath(value);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Home page')
			.setDesc('Specify the file, which will be your Gitlab homepage.')
			.addText(text => {
				new FileSuggest(this.app, text.inputEl);
				text.setPlaceholder('Home')
					.setValue(this.plugin.settings.homeFilePath)
					.onChange(async (value) => {
						this.plugin.settings.homeFilePath = normalizePath(value);
						await this.plugin.saveSettings();
					})
			});
	}
}
