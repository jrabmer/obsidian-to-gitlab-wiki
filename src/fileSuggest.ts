import { App, AbstractInputSuggest, Command, FuzzySuggestModal, Notice, TAbstractFile, TFile } from "obsidian";


export class FileSuggest extends AbstractInputSuggest<TFile> {
	textInputEl: HTMLInputElement;

	getSuggestions(inputStr: string): TFile[] {
		const mdFiles: TFile[] = this.app.vault.getMarkdownFiles();
		const files: TFile[] = [];
		const inputLower = inputStr.toLowerCase();

		mdFiles.forEach((file: TFile) => {
			if (file.path.toLowerCase().contains(inputLower)) {
				files.push(file);
				file.
			}
		});

		return files;
	}

	renderSuggestion(file: TFile, el: HTMLElement) {
		if (file.extension == "md") {
			el.setText(trimFile(file));
		}
		else {
			//we don't use trimFile here as the extension isn't displayed here
			el.setText(file.path.slice(0, -7))
			el.insertAdjacentHTML(
				"beforeend",
				`<div class="nav-file-tag" style="display:inline-block;vertical-align:middle">canvas</div>`
			);
		}
	}

	selectSuggestion(file: TFile) {
		this.textInputEl.value = trimFile(file);
		this.textInputEl.trigger("input");
		this.close();
	}
}