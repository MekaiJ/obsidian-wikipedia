# obsidian-wikipedia
An Obsidian plugin that allows you to search for and view Wikipedia articles directly in your vault. This plugin uses the Wikipedia REST API instead of an Iframe.
<img width="1830" height="1361" alt="image" src="https://github.com/user-attachments/assets/b0230c52-afed-4f4f-b2df-5a581bcd868e" />

## Features
- Native Styling: Articles perfectly match your Obsidian theme (Dark/Light mode, custom fonts).
- Interactive Outline: A toggle-able sidebar that generates a Table of Contents from the article's headers. Click any header to scroll directly to that section.
- History Navigation: Built-in Back (◀) and Forward (▶) buttons to easily navigate your rabbit holes without losing your place.
- Clean UI: Strips out annoying Wikipedia web elements (like edit buttons and navigation footer boxes).
## Manual Installation
Since this plugin is not yet in the Community Plugins directory, you can install it manually:
1. Navigate to your vault's plugins folder: `.obsidian/plugins/`
2. Clone this repository:
   `git clone https://github.com/MekaiJ/obsidian-wikipedia.git obsidian-wikipedia`
3. Navigate into the folder and install dependencies:
   `cd obsidian-wikipedia`
   `npm install`
4. Build the plugin:
   `node esbuild.config.mjs production`
5. Open Obsidian, go to Settings > Community Plugins, reload your plugins list, and toggle on Obsidian Wikipedia Viewer.

## Contribute!
Have any issues or feature requests? Please use GitHub's issues page.

Want to solve any of these issues or implement requested features? Open a PR for your implementation and it will be reviewed!

## LLM Disclosure
LLMs were used in the initial production of this plugin to push out an MVP as soon as possible.
