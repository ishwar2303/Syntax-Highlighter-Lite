import { Injectable } from '@angular/core';

interface Match {
    label: string;
    start: number;
    end: number;
    value: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class SyntaxHighlighterService {

    private LANGUAGE_PATTERNS: any = {
        python: {

            multiline_string: {
                pattern: /('{3}[\s\S]*?'{3}|"{3}[\s\S]*?"{3})/gm,
                color: 'CE9178'
            },

            string: {
                pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/gm,
                color: 'CE9178'
            },

            comment: {
                pattern: /#.*$/gm,
                color: '6A9955'
            },

            decorator: {
                pattern: /@\w+/gm,
                color: 'C586C0'
            },

            function_call: {
                pattern: /(?<!\w)([a-zA-Z_]\w*)\s*(?=\()/gm,
                color: 'DCDCAA'
            },

            boolean: {
                pattern: /\b(True|False)\b/gm,
                color: 'D19A66'
            },

            keywords: {
                pattern: /\b(None|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|match|case)\b/gm,
                color: '569CD6'
            },

            builtins: {
                pattern: /\b(abs|all|any|ascii|bin|bool|breakpoint|bytearray|bytes|callable|chr|classmethod|compile|complex|delattr|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip)\b/gm,
                color: '4EC9B0'
            },

            number: {
                pattern: /\b(0b[01]+|0x[\da-fA-F]+|\d+\.\d+|\d+)\b/gm,
                color: 'B5CEA8'
            },

            function_name: {
                pattern: /(?<=\bdef\s)[a-zA-Z_]\w*/gm,
                color: 'DCDCAA'
            },

            class_name: {
                pattern: /(?<=\bclass\s)[a-zA-Z_]\w*/gm,
                color: '4EC9B0'
            },

            operator: {
                pattern: /(\+|\-|\*|\/|\/\/|%|\*\*|==|!=|<=|>=|=|<|>|\||&|\^|~|>>|<<)/gm,
                color: 'D4D4D4'
            },

            punctuation: {
                pattern: /[\(\)\[\]\{\}\:\,\.\;]/gm,
                color: 'D4D4D4'
            },

            identifier: {
                pattern: /\b[a-zA-Z_]\w*\b/gm,
                color: 'D4D4D4'
            }

        }
    };

    constructor() { }

    private escapeHTML(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    private findPositionOfAllPatterns(text: string, patterns: any): Match[] {
        const allMatches: Match[] = [];

        Object.keys(patterns).forEach(label => {
            const config = patterns[label];
            const regex: RegExp = config.pattern;
            const color = config.color;

            let match: RegExpExecArray | null;
            while ((match = regex.exec(text)) !== null) {
                allMatches.push({
                    label,
                    start: match.index,
                    end: match.index + match[0].length,
                    value: match[0],
                    color
                });
            }
        });

        allMatches.sort((a, b) =>
            a.start === b.start ? b.end - a.end : a.start - b.start
        );

        return allMatches;
    }

    private removeOverlaps(allMatches: Match[]): Match[] {
        const filtered: Match[] = [];
        let processed: [number, number] = [-1, -1];

        for (const match of allMatches) {
            const { start, end } = match;
            if (start >= processed[0] && start < processed[1]) {
                continue;
            }
            processed = [start, end];
            filtered.push(match);
        }

        return filtered;
    }

    private prepareHighlightedCode(text: string, filtered: Match[]): string {
        let result = '';
        let start = 0;

        for (const m of filtered) {
            result += text.slice(start, m.start);
            result += `<span class="${m.label}" style="color: #${m.color};">${m.value}</span>`;
            start = m.end;
        }

        result += text.slice(start);

        return `<pre style="background: black;"><code>${result}</code></pre>`;
    }

    highlight(text: string, lang: string = 'python'): string {
        text = text.trim();
        text = this.escapeHTML(text);

        const patterns = this.LANGUAGE_PATTERNS[lang];
        const allMatches = this.findPositionOfAllPatterns(text, patterns);
        const filtered = this.removeOverlaps(allMatches);

        return this.prepareHighlightedCode(text, filtered);
    }
}