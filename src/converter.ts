import { FileManager, FileSystemAdapter, Notice, TFile, TFolder, Vault } from 'obsidian';
import * as fs from 'fs/promises';
import { removeFileExtensionForMdFilesInLinks } from 'fileExtensionStripper';
import * as path from 'path';
import { isUnixHiddenPath } from 'utils';


/* -------------------- CONVERTERS -------------------- */

export const convertAndExportVault = async (
    vault: Vault,
    fileManager: FileManager,
    homeFilePath: string,
    exportPath: string
) => {
    new Notice("Starting Vault conversion and export ...", 4000);

    // Rename home file first
    const homeFile = vault.getAbstractFileByPath(homeFilePath + ".md");

    if (!(homeFile instanceof TFile)) {
        new Notice("Export failed! Could not find home file in vault. Make sure the specified home file path is correct.", 0);
        return;
    }

    await fileManager.renameFile(homeFile, "home.md");

    // Rename all folders to replace spaces with dashes
    const folders: TFolder[] = vault.getAllFolders(false);

    for (const folder of folders) {
        await fileManager.renameFile(folder, folder.path.replace(/\s+/g, "-"));
    }

    // Rename all files to replace spaces with dashes, except for the home file which is already renamed
    const files = vault.getFiles();

    await Promise.all(
        files.map(file =>
            fileManager.renameFile(file, file.path.replace(/\s+/g, "-"))
        )
    );

    // Remove .md file extensions from all markdown files
    const markdownFiles = vault.getMarkdownFiles();

    await Promise.all(
        markdownFiles.map(file =>
            vault.process(file, (data: string) => {
                return removeFileExtensionForMdFilesInLinks(data);
            })
        )
    );

    await exportVaultToSpecifiedLocation(vault, exportPath);

    // Revert folder and file names to replace dashes back to spaces
    for (const folder of folders) {
        await fileManager.renameFile(folder, folder.path.replace(/-/g, " "));
    }

    await Promise.all(
        files.map(file =>
            fileManager.renameFile(file, file.path.replace(/-/g, " "))
        )
    );

    // Finally, rename home file back to original name
    await fileManager.renameFile(homeFile, homeFilePath + ".md");

    new Notice("Vault conversion and export finished successfully!", 5000);
};

const exportVaultToSpecifiedLocation = async (vault: Vault, rawExportPath: string) => {
    const adapter = vault.adapter;
    if (adapter instanceof FileSystemAdapter) {
        const vaultAbsolutePath = adapter.getBasePath();
        const exportPath = rawExportPath.split(path.sep).join(path.posix.sep);

        await fs.cp(vaultAbsolutePath, exportPath, {
            recursive: true,
            errorOnExist: false, // overwrite by default
            force: true,         // overwrite read-only files if needed
            filter: (srcPath) => {
                // Skip . files like .obsidian or .git
                return !isUnixHiddenPath(path.basename(srcPath));
            },
        });

        return;
    }

    console.error("Could not get file system adapter from vault adapter:", adapter);

}