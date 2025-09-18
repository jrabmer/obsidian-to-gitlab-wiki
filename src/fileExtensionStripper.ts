export const removeFileExtensionForMdFilesInLinks = (fileText: string): string => {
    // --> Get All Markdown Links
    const markdownRegex = /\[(^$|.*?)\]\((.*?)\)/g;
    const markdownMatches = fileText.match(markdownRegex);

    if (markdownMatches) {
        const fileRegex = /(?<=\().*(?=\))/;
        for (const markdownMatch of markdownMatches) {

            const fileMatch = markdownMatch.match(fileRegex);
            // Remove .md file extension
            if (fileMatch && fileMatch[0].endsWith(".md")) {
                fileText = fileText.replace(fileMatch[0], fileMatch[0].slice(0, -3))
            }
        }
    }

    return fileText;
};