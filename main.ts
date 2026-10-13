import { App, ItemView, Plugin, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_WIKIPEDIA = "wikipedia-view";

export class WikipediaView extends ItemView {
    history: string[] = [];
    historyIndex: number = -1;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_WIKIPEDIA;
    }

    getDisplayText() {
        return "Wikipedia Viewer";
    }

    getIcon() {
        return "globe";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        
        const headerContainer = container.createDiv({ cls: "wiki-header" });
        
        const historyNav = headerContainer.createDiv({ cls: "wiki-history-nav" });
        const backBtn = historyNav.createEl("button", { text: "◀", cls: "wiki-nav-btn" });
        const fwdBtn = historyNav.createEl("button", { text: "▶", cls: "wiki-nav-btn" });
        
        const updateHistoryButtons = () => {
            backBtn.disabled = this.historyIndex <= 0;
            fwdBtn.disabled = this.historyIndex >= this.history.length - 1;
        };

        const toggleOutlineBtn = headerContainer.createEl("button", { text: "📑 Outline", cls: "wiki-toggle-btn" });
        const input = headerContainer.createEl("input", { type: "text", placeholder: "Search Wikipedia..." });
        input.style.flexGrow = "1";
        const button = headerContainer.createEl("button", { text: "Search" });

        const bodyContainer = container.createDiv({ cls: "wiki-body" });

        const outlineContainer = bodyContainer.createDiv({ cls: "wiki-sidebar" });
        let outlineVisible = false;
        outlineContainer.style.display = outlineVisible ? "block" : "none";

        const contentContainer = bodyContainer.createDiv({ cls: "wiki-content" });
        contentContainer.style.userSelect = "text"; 

        toggleOutlineBtn.addEventListener("click", () => {
            outlineVisible = !outlineVisible;
            outlineContainer.style.display = outlineVisible ? "block" : "none";
        });

        backBtn.addEventListener("click", () => {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                loadArticle(this.history[this.historyIndex], true);
            }
        });

        fwdBtn.addEventListener("click", () => {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                loadArticle(this.history[this.historyIndex], true);
            }
        });

        const loadArticle = async (title: string, isHistoryNav = false) => {
            contentContainer.empty();
            outlineContainer.empty(); 
            contentContainer.createEl("p", { text: `Fetching: ${title}...` });
            
            try {
                if (!isHistoryNav) {
                    if (this.history[this.historyIndex] !== title) {
                        this.history = this.history.slice(0, this.historyIndex + 1);
                        this.history.push(title);
                        this.historyIndex++;
                    }
                }
                updateHistoryButtons();
                
                input.value = decodeURIComponent(title).replace(/_/g, " ");

                const formattedTitle = encodeURIComponent(title.trim().replace(/ /g, '_')).replace(/'/g, '%27').replace(/\(/g, '\%28').replace(/\)/g, '%29');
                const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/html/${formattedTitle}`);
                if (!response.ok) throw new Error("Article not found");
                
                const html = await response.text();
                contentContainer.empty();
                
                const articleDiv = contentContainer.createDiv();
                articleDiv.innerHTML = html;

                articleDiv.querySelectorAll('img').forEach(img => {
                    const src = img.getAttribute('src');
                    if (src && src.startsWith('//')) {
                        img.setAttribute('src', 'https:' + src);
                    }
                    const srcset = img.getAttribute('srcset');
                    if (srcset) {
                        img.setAttribute('srcset', srcset.replace(/\/\//g, 'https://'));
                    }
                });

                const headings = articleDiv.querySelectorAll('h2, h3, h4');
                if (headings.length > 0) {
                    outlineContainer.createEl('div', { text: 'Outline', cls: 'wiki-outline-title' });
                    const list = outlineContainer.createEl('div', { cls: 'wiki-outline-list' });

                    headings.forEach(heading => {
                        const level = parseInt(heading.tagName.substring(1));
                        
                        const item = list.createEl('div', { cls: 'wiki-outline-item' });
                        item.style.paddingLeft = `${(level - 2) * 15}px`; 
                        item.innerText = heading.textContent || "";
                        
                        item.addEventListener('click', () => {
                            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                    });
                }

                articleDiv.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const href = link.getAttribute('href');
                        
                        if (href && href.startsWith('./')) {
                            const nextArticle = href.replace('./', '');
                            loadArticle(decodeURIComponent(nextArticle));
                        } else if (href && href.startsWith('http')) {
                            window.open(href);
                        }
                    });
                });
            } catch (error) {
                contentContainer.empty();
                outlineContainer.empty();
                contentContainer.createEl("p", { text: "Failed to load article. Check your spelling or internet connection." });
                
                if (!isHistoryNav) {
                    this.history.pop();
                    this.historyIndex--;
                    updateHistoryButtons();
                }
            }
        };

        button.addEventListener("click", () => {
            if (input.value) loadArticle(input.value);
        });

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && input.value) loadArticle(input.value);
        });

        loadArticle("Obsidian_(software)");
    }

    async onClose() {}
}

export default class NativeWikipediaPlugin extends Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_WIKIPEDIA, (leaf) => new WikipediaView(leaf));
        this.addCommand({
            id: 'open-native-wikipedia',
            name: 'Open Wikipedia Viewer',
            callback: () => this.activateView()
        });
    }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_WIKIPEDIA)[0];

        if (!leaf) {
            leaf = workspace.getLeaf('tab');
            if (leaf) await leaf.setViewState({ type: VIEW_TYPE_WIKIPEDIA, active: true });
        }
        if (leaf) workspace.revealLeaf(leaf);
    }
}
