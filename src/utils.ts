import GitLabWikiConverterPlugin from "main";
import { TFile } from "obsidian";

export function trimFile(file: TFile): string {
	if (!file) return "";
	return file.extension == "md" ? file.path.slice(0, -3) : file.path;
}

export function isHomePageSelectedAndValid(plugin: GitLabWikiConverterPlugin): boolean {
	if (plugin.settings.homeFilePath != '' && plugin.app.vault.getAbstractFileByPath(plugin.settings.homeFilePath + ".md") != null) {
		return true;
	} else {
		return false;
	}
}