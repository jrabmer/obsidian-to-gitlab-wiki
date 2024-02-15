import LinkConverterPlugin from 'main';
import { App, TFile, Notice, normalizePath, TFolder, MarkdownView } from 'obsidian';
import { getFilesUnderPath } from './utils';

/* -------------------- LINK DETECTOR -------------------- */

interface LinkMatch {
    match: string;
    linkText: string;
    altOrBlockRef: string;
    sourceFilePath: string;
}

const getAllLinkMatchesInFile = async (mdFile: TFile, plugin: LinkConverterPlugin): Promise<LinkMatch[]> => {
    const linkMatches: LinkMatch[] = [];
    let fileText = await plugin.app.vault.read(mdFile);

    // --> Get All WikiLinks
    let wikiRegex = /\[\[.*?\]\]/g;
    let wikiMatches = fileText.match(wikiRegex);

    if (wikiMatches) {
        let fileRegex = /(?<=\[\[).*?(?=(\]|\|))/;
        let altRegex = /(?<=\|).*(?=]])/;

        for (let wikiMatch of wikiMatches) {
            // --> Normal Internal Link
            let fileMatch = wikiMatch.match(fileRegex);
            if (fileMatch) {
                // Web links are to be skipped
                if (fileMatch[0].startsWith('http')) continue;
                let altMatch = wikiMatch.match(altRegex);
                let linkMatch: LinkMatch = {
                    match: wikiMatch,
                    linkText: fileMatch[0],
                    altOrBlockRef: altMatch ? altMatch[0] : '',
                    sourceFilePath: mdFile.path,
                };
                linkMatches.push(linkMatch);
            }
        }
    }

    return linkMatches;
};

/* -------------------- CONVERTERS -------------------- */

// --> Converts single file to provided final format and save back in the file
export const convertLinksAndSaveInSingleFile = async (mdFile: TFile, plugin: LinkConverterPlugin) => {
    let fileText = await plugin.app.vault.read(mdFile);
    let newFileText = await convertWikiLinksToMarkdown(fileText, mdFile, plugin);
    await plugin.app.vault.modify(mdFile, newFileText);
};

// --> Convert Links under Files under a Certain Folder
export const convertLinksInVault = async (folder: TFolder, plugin: LinkConverterPlugin) => {
    let mdFiles: TFile[] = plugin.app.vault.getMarkdownFiles();
    let notice = new Notice('Starting link conversion', 0);
    try {
        let totalCount = mdFiles.length;
        let counter = 0;
        for (let mdFile of mdFiles) {
            counter++;
            notice.setMessage(`Converting the links in notes ${counter}/${totalCount}.`);
            await convertLinksAndSaveInSingleFile(mdFile, plugin);
        }
    } catch (err) {
        console.log(err);
    } finally {
        notice.hide();
    }
};

/* -------------------- LINKS TO MARKDOWN CONVERTER -------------------- */

// --> Converts links within given string from Wiki to MD
export const convertWikiLinksToMarkdown = async (md: string, sourceFile: TFile, plugin: LinkConverterPlugin): Promise<string> => {
    let newMdText = md;
    let linkMatches: LinkMatch[] = await getAllLinkMatchesInFile(sourceFile, plugin);
    // --> Convert Wiki Internal Links to Markdown Link
    for (let wikiMatch of linkMatches) {
        let mdLink = createLink('markdown', wikiMatch.linkText, wikiMatch.altOrBlockRef, sourceFile, plugin);
        newMdText = newMdText.replace(wikiMatch.match, mdLink);
    }
    return newMdText;
};

/* -------------------- LINKS TO RELATIVE/ABSOLUTE/SHORTEST -------------------- */

export const convertLinksInFileToPreferredFormat = async (mdFile: TFile, plugin: LinkConverterPlugin, finalFormat: FinalFormat) => {
    let fileText = await plugin.app.vault.read(mdFile);
    let linkMatches: LinkMatch[] = await getAllLinkMatchesInFile(mdFile, plugin);
    for (let linkMatch of linkMatches) {
        let fileLink = decodeURI(linkMatch.linkText);
        let file = plugin.app.metadataCache.getFirstLinkpathDest(fileLink, linkMatch.sourceFilePath);
        if (file) {
            fileLink = getFileLinkInFormat(file, mdFile, plugin, finalFormat);
            fileText = fileText.replace(linkMatch.match, createLink(linkMatch.type, fileLink, linkMatch.altOrBlockRef, mdFile, plugin));
        }
    }
    let fileStat = plugin.settings.keepMtime ? await plugin.app.vault.adapter.stat(normalizePath(mdFile.path)) : {};
    await plugin.app.vault.modify(mdFile, fileText, fileStat);
};

const getFileLinkInFormat = (file: TFile, sourceFile: TFile, plugin: LinkConverterPlugin, finalFormat: FinalFormat): string => {
    let fileLink: string;
    if (finalFormat === 'absolute-path') {
        fileLink = file.path;
    } else if (finalFormat === 'relative-path') {
        fileLink = getRelativeLink(sourceFile.path, file.path);
    } else if (finalFormat === 'shortest-path') {
        let allFilesInVault = plugin.app.vault.getFiles();
        let filesWithSameName = allFilesInVault.filter((f) => f.name === file.name);
        if (filesWithSameName.length > 1) {
            fileLink = file.path;
        } else {
            fileLink = file.name;
        }
    }
    if (fileLink.endsWith('.md')) fileLink = fileLink.replace('.md', '');
    return fileLink;
};

/* -------------------- HELPERS -------------------- */

const createLink = (dest: LinkType, originalLink: string, altOrBlockRef: string, sourceFile: TFile, plugin: LinkConverterPlugin): string => {
    let finalLink = originalLink;
    let altText: string;

    let fileLink = decodeURI(finalLink);
    let file = plugin.app.metadataCache.getFirstLinkpathDest(fileLink, sourceFile.path);
    if (file && plugin.settings.finalLinkFormat !== 'not-change') finalLink = getFileLinkInFormat(file, sourceFile, plugin, plugin.settings.finalLinkFormat);

    // If final link is in markdown format and the file is md, the extension should be included
    const fileExtension = '';

    if (dest === 'wiki') {
        // If alt text is same as the final link or same as file base name, it needs to be empty
        if (altOrBlockRef !== '' && altOrBlockRef !== decodeURI(finalLink)) {
            if (file && decodeURI(altOrBlockRef) === file.basename) {
                altText = '';
            } else {
                altText = '|' + altOrBlockRef;
            }
        } else {
            altText = '';
        }
        return `[[${decodeURI(finalLink)}${altText}]]`;
    } else if (dest === 'markdown') {
        // If there is no alt text specifiec and file exists, the alt text needs to be always the file base name
        if (altOrBlockRef !== '') {
            altText = altOrBlockRef;
        } else {
            altText = file ? file.basename : finalLink;
        }
        return `[${altText}](${customEncodeURI(finalLink)}${fileExtension})`;
    } else if (dest === 'wikiTransclusion') {
        return `[[${decodeURI(finalLink)}#${decodeURI(altOrBlockRef)}]]`;
    }

    return '';
};

/**
 * Encode URI the same way Obsidian is doing it internally
 * 
 * @param uri 
 * @returns 
 */
function customEncodeURI(uri: string): string {
    return uri.replace(/[\\\x00\x08\x0B\x0C\x0E-\x1F ]/g, urlPart => encodeURIComponent(urlPart));
}