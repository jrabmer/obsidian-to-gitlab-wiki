import GitLabWikiConverterPlugin from 'main';

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
				
    for (let file of files) {
        await plugin.app.fileManager.renameFile(file, file.path.replace(/\s+/g, "-"));
    }
    
    const markdownFiles = plugin.app.vault.getMarkdownFiles();
    
    for(let file of markdownFiles) {
        plugin.app.vault.process(file, (data: string) => {
            return removeFileExtensionsForMdFiles(data, plugin);
          })
    }
};