import { Notice, Plugin } from 'obsidian';
import { convertVault } from './converter';
import { GitLabWikiConverterSettings, GitLabWikiConverterSettingTab, DEFAULT_SETTINGS } from 'settings';
import { isHomePageSelectedAndValid } from 'utils';

export default class GitLabWikiConverterPlugin extends Plugin {
	settings: GitLabWikiConverterSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'convert-vault',
			name: 'Converts all files to Gitlab Wiki MD Format',
			callback: () => {
				if (isHomePageSelectedAndValid(this)) {
					convertVault(this);
				} else {
					new Notice("Export failed! Select a valid Gitlab home page in the settings before exporting vault.", 0);
				}
			}
		});

		this.addSettingTab(new GitLabWikiConverterSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}