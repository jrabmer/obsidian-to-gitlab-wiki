import GitLabWikiConverterPlugin from 'main';
import { FileSystemAdapter, Notice, TAbstractFile, TFolder, Vault } from 'obsidian';
import * as fs from 'fs/promises';
import * as path from 'path';
import { removeFileExtensionsForMdFiles } from 'fileExtensionStripper';

/* -------------------- CONVERTERS -------------------- */

export const convertAndExportVault = async (plugin: GitLabWikiConverterPlugin) => {
    new Notice("Starting Vault conversion and export ...", 4000);

    const files = plugin.app.vault.getFiles();

    for (const file of files) {

        if (file.path.slice(0, -3).match(plugin.settings.homeFilePath)) {
            const path: string[] = file.path.split("/");
            path[path.length - 1] = "home.md";
            await plugin.app.fileManager.renameFile(file, path.join("/"));
            continue;
        }

        await plugin.app.fileManager.renameFile(file, file.path.replace(/\s+/g, "-"));
    }

    const markdownFiles = plugin.app.vault.getMarkdownFiles();

    for (const file of markdownFiles) {
        await plugin.app.vault.process(file, (data: string) => {
            return removeFileExtensionsForMdFiles(data);
        })
    }

    exportVaultToSpecifiedLocation(plugin);

    for (const file of files) {

        if (file.path.match("home.md")) {
            const path: string[] = file.path.split("/");
            path[path.length - 1] = plugin.settings.homeFilePath + ".md";
            await plugin.app.fileManager.renameFile(file, path.join("/"));
            continue;
        }

        await plugin.app.fileManager.renameFile(file, file.path.replace(/-/g, " "));
    }

    new Notice("Vault conversion and export finished successfully!", 5000);
};

const exportVaultToSpecifiedLocation = async (plugin: GitLabWikiConverterPlugin) => {
    const adapter = plugin.app.vault.adapter;
    if (adapter instanceof FileSystemAdapter) {
        const vaultAbsolutePath = adapter.getBasePath();
        const exportPath = plugin.settings.exportPath.split(path.sep).join(path.posix.sep);

        Vault.recurseChildren(plugin.app.vault.getRoot(), async (file: TAbstractFile) => {
            if (file instanceof TFolder && file.isRoot()) {
                try {
                    await fs.mkdir(exportPath);
                } catch (error) {
                    if (error.code != "EEXIST") {
                        console.log("Export failed: Could not find or create export folder! Check path specified in settings.");
                        new Notice("Export failed: Could not find or create export folder! Check path specified in settings.", 0);
                        return;
                    }
                }
            } else {
                if (file instanceof TFolder) {
                    try {
                        await fs.mkdir(path.posix.join(exportPath, file.path));
                    } catch (error) {
                        if (error.code != "EEXIST") {
                            console.log("Export failed: Could not create subfolder in export folder! Check that you have the corresponding permissions.");
                            new Notice("Export failed: Could not create subfolder in export folder! Check that you have the corresponding permissions.", 0);
                            return;
                        }
                    }
                } else {
                    try {
                        await fs.copyFile(path.posix.join(vaultAbsolutePath, file.path), path.posix.join(exportPath, file.path));
                    } catch (error) {
                        console.log("Export failed: Could not write to export folder! Check that path is correct and you have the corresponding permissions.");
                        new Notice("Export failed: Could not write to export folder! Check that path is correct and you have the corresponding permissions.", 0);
                        return;
                    }

                }

            }
        })

        return;
    }

    console.error("Could not get base path of Vault");

}