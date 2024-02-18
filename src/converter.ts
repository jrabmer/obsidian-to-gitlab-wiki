import GitLabWikiConverterPlugin from 'main';
import { FileSystemAdapter, TAbstractFile, TFile, TFolder, Vault } from 'obsidian';
import * as fs from 'fs/promises'
import * as path from 'path';
import { tmpdir } from 'os';
import { dir } from 'console';

/* -------------------- LINK DETECTOR -------------------- */

const removeFileExtensionsForMdFiles = (fileText: string, plugin: GitLabWikiConverterPlugin): string => {
    // --> Get All Markdown Links
    let markdownRegex = /\[(^$|.*?)\]\((.*?)\)/g;
    let markdownMatches = fileText.match(markdownRegex);

    if (markdownMatches) {
        let fileRegex = /(?<=\().*(?=\))/;
        for (let markdownMatch of markdownMatches) {

            let fileMatch = markdownMatch.match(fileRegex);
            // Remove .md file extension
            if (fileMatch && fileMatch[0].endsWith(".md")) {
                fileText = fileText.replace(fileMatch[0], fileMatch[0].slice(0,-3))
            }
        }
    }

    return fileText;
};

/* -------------------- CONVERTERS -------------------- */

export const convertVault = async (plugin: GitLabWikiConverterPlugin) => {
    const files = plugin.app.vault.getFiles();
	
    exportVaultToSpecifiedLocation(plugin);
    /*for (let file of files) {
        await plugin.app.fileManager.renameFile(file, file.path.replace(/\s+/g, "-"));
    }
    
    const markdownFiles = plugin.app.vault.getMarkdownFiles();
    
    for(let file of markdownFiles) {
        plugin.app.vault.process(file, (data: string) => {
            return removeFileExtensionsForMdFiles(data, plugin);
          })
    }*/
};

const exportVaultToSpecifiedLocation = async (plugin: GitLabWikiConverterPlugin) => {
    // TODO: Use universal path structure
    let adapter = plugin.app.vault.adapter;
    if (adapter instanceof FileSystemAdapter) {
        const vaultAbsolutePath = adapter.getBasePath();

        Vault.recurseChildren(plugin.app.vault.getRoot(), async (file: TAbstractFile) => {
            if(file instanceof TFolder && file.isRoot()){
                await fs.mkdir(plugin.settings.exportPath);
            } else {
                if(file instanceof TFolder) {
                    await fs.mkdir(plugin.settings.exportPath + file.path);
                } else {
                    await fs.copyFile(vaultAbsolutePath + "/" + file.path, plugin.settings.exportPath + file.path);
                }
            }
        })

        return;
    }
    
    console.error("Could not get base path of Vault");
    
}