# Obsidian Gitlab Wiki Converter

## 📖 Brief Explanation

This plugin is used to export your entire obsidian vault as a Gitlab Wiki. Because Gitlab Flavoured Markdown (GFM) and Gitlab Wikis have some unique aspects, the following actions need to be taken:

- Replace spaces in file names with `-`, since Gitlab uses page slugs for links
- Choose a file to act as your starting page. This will be renamed to `home`
- Remove file endings in links for markdown files, which tells Gitlab its a wiki page and not just a file
- Export files to specifed folder

The plugin only renames the files temporarily and no permanent changes will be made to your vault.

## 🔓 Prerequisites

The plugin assumes that your vault does not use WikiLinks but uses relative Paths for link formats. This may be changed in the future. Until then make sure you set `Settings -> Files and links -> New Link format` to `Relative path to file` and disable `Use [[Wikilinks]]`. 

In case you have an existing vault with WikiLinks, I personally use the following [plugin](https://github.com/ozntel/obsidian-link-converter) by Ozan Tellioglu (with relative paths setting!).

## 💻 How to use

Once the plugin is loaded, the command `Export Vault as Gitlab Wiki` can be used to export the vault. Make sure to specify the export location and home page in the settings first!

## 📩 Contact

If you have any issue or you have any suggestions, please feel free to reach out to me directly at <jrabmer@outlook.com>.

## 🌄 Road Map

- [ ] Fix line break issue on Gitlab
- [ ] Use name with spaces instead of page slugs for links in files
- [ ] Implement more GFM featues in the future
- [ ] Add WikiLink support

## ☕ Support

If you are enjoying the plugin then you can support my work and enthusiasm by buying me a coffee:

<a href='https://ko-fi.com/jrabmer' target='_blank'>
    <img height='48' style='border:0px;height:48px;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>
