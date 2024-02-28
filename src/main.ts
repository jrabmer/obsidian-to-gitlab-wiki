import { Notice, Plugin } from 'obsidian';
import { convertAndExportVault } from './converter';
import { GitLabWikiConverterSettings, GitLabWikiConverterSettingTab, DEFAULT_SETTINGS } from 'settings';
import { isHomePageSelectedAndValid } from 'utils';

export default class GitLabWikiConverterPlugin extends Plugin {
	settings: GitLabWikiConverterSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'export-vault',
			name: 'Export Vault as Gitlab Wiki',
			callback: () => {
				if (isHomePageSelectedAndValid(this)) {
					convertAndExportVault(this);
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