import GitLabWikiConverterPlugin from 'main';
import { FileSystemAdapter, TAbstractFile, TFolder, Vault } from 'obsidian';
import * as fs from 'fs/promises'
import * as path from 'path';
import { removeFileExtensionsForMdFiles } from 'fileExtensionStripper'

/* -------------------- CONVERTERS -------------------- */

export const convertVault = async (plugin: GitLabWikiConverterPlugin) => {
    const files = plugin.app.vault.getFiles();

    for (let file of files) {
        await plugin.app.fileManager.renameFile(file, file.path.replace(/\s+/g, "-"));
    }

    const markdownFiles = plugin.app.vault.getMarkdownFiles();

    for (let file of markdownFiles) {
        await plugin.app.vault.process(file, (data: string) => {
            return removeFileExtensionsForMdFiles(data);
        })
    }

    exportVaultToSpecifiedLocation(plugin);

    for (let file of files) {
        await plugin.app.fileManager.renameFile(file, file.path.replace(/-/g, " "));
    }
};

const exportVaultToSpecifiedLocation = async (plugin: GitLabWikiConverterPlugin) => {
    let adapter = plugin.app.vault.adapter;
    if (adapter instanceof FileSystemAdapter) {
        const vaultAbsolutePath = adapter.getBasePath();
        const exportPath = plugin.settings.exportPath.split(path.sep).join(path.posix.sep);

        Vault.recurseChildren(plugin.app.vault.getRoot(), async (file: TAbstractFile) => {
            if (file instanceof TFolder && file.isRoot()) {
                await fs.mkdir(exportPath);
            } else {
                if (file instanceof TFolder) {
                    await fs.mkdir(path.posix.join(exportPath, file.path));
                } else {
                    await fs.copyFile(path.posix.join(vaultAbsolutePath, file.path), path.posix.join(exportPath, file.path));
                }
            }
        })

        return;
    }

    console.error("Could not get base path of Vault");

}