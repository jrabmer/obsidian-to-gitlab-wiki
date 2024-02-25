import { AbstractInputSuggest, TFile } from "obsidian";
import { trimFile } from "utils";


export class FileSuggest extends AbstractInputSuggest<TFile> {
	textInputEl: HTMLInputElement;

	getSuggestions(inputStr: string): TFile[] {
		const mdFiles: TFile[] = this.app.vault.getMarkdownFiles();
		const files: TFile[] = [];
		const inputLower = inputStr.toLowerCase();

		mdFiles.forEach((file: TFile) => {
			if (file.path.toLowerCase().contains(inputLower)) {
				files.push(file);
			}
		});

		return files;
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		el.setText(trimFile(file));
	}

	selectSuggestion(file: TFile) {
		this.textInputEl.value = trimFile(file);
		this.textInputEl.trigger("input");
		this.close();
	}
}