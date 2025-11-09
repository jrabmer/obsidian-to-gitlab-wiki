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

// Source - https://stackoverflow.com/a
// Posted by Shamasis Bhattacharya, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-09, License - CC BY-SA 3.0

/**
 * Checks whether a path starts with or contains a hidden file or a folder.
 * @param {string} source - The path of the file that needs to be validated.
 * returns {boolean} - `true` if the source is blacklisted and otherwise `false`.
 */
export function isUnixHiddenPath (path: string): boolean {
    return (/(^|\/)\.[^\/\.]/g).test(path);
};
