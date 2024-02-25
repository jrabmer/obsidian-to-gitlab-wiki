export const removeFileExtensionsForMdFiles = (fileText: string): string => {
    // --> Get All Markdown Links
    let markdownRegex = /\[(^$|.*?)\]\((.*?)\)/g;
    let markdownMatches = fileText.match(markdownRegex);

    if (markdownMatches) {
        let fileRegex = /(?<=\().*(?=\))/;
        for (let markdownMatch of markdownMatches) {

            let fileMatch = markdownMatch.match(fileRegex);
            // Remove .md file extension
            if (fileMatch && fileMatch[0].endsWith(".md")) {
                fileText = fileText.replace(fileMatch[0], fileMatch[0].slice(0, -3))
            }
        }
    }

    return fileText;
};