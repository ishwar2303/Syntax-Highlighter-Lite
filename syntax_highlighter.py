import re
import html

LANGUAGE_PATTERNS = {
    'python': {

        'multiline_string': {
            'pattern': r"('{3}[\s\S]*?'{3}|\"{3}[\s\S]*?\"{3})",
            'color': 'CE9178'
        },

        'string': {
            'pattern': r"(\"([^\"\\]|\\.)*\"|'([^'\\]|\\.)*')",
            'color': 'CE9178'
        },

        'comment': {
            'pattern': r"#.*",
            'color': '6A9955'
        },

        'decorator': {
            'pattern': r"@\w+",
            'color': 'C586C0'
        },

        'function_call': {
            'pattern': r'(?<!\w)([a-zA-Z_]\w*)\s*(?=\()',
            'color': 'DCDCAA'
        },
        
        'boolean': {
            'pattern': r'\b(True|False)\b',
            'color': 'D19A66'
        },

        'keywords': {
            'pattern': r"\b(None|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|match|case)\b",
            'color': '569CD6'
        },

        'builtins': {
            'pattern': r"\b(abs|all|any|ascii|bin|bool|breakpoint|bytearray|bytes|callable|chr|classmethod|compile|complex|delattr|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip)\b",
            'color': '4EC9B0'
        },

        'number': {
            'pattern': r"\b(0b[01]+|0x[\da-fA-F]+|\d+\.\d+|\d+)\b",
            'color': 'B5CEA8'
        },

        'function_name': {
            'pattern': r'(?<=\bdef\s)[a-zA-Z_]\w*',
            'color': 'DCDCAA'
        },

        'class_name': {
            'pattern': r'(?<=\bclass\s)[a-zA-Z_]\w*',
            'color': '4EC9B0'
        },

        'operator': {
            'pattern': r"(\+|\-|\*|\/|\/\/|%|\*\*|==|!=|<=|>=|=|<|>|\||&|\^|~|>>|<<)",
            'color': 'D4D4D4'
        },

        'punctuation': {
            'pattern': r"[\(\)\[\]\{\}\:\,\.\;]",
            'color': 'D4D4D4'
        },

        'identifier': {
            'pattern': r"\b[a-zA-Z_]\w*\b",
            'color': 'D4D4D4'
        }
    }
}


class SyntaxHighlighter:
    
    
    def __init__(self, lang = 'python'):
        self.lang = lang
        self.patterns = LANGUAGE_PATTERNS[self.lang]
    
        
    def _findPositionOfAllPatterns(self, text: str):
        
        allMatches = []
        
        for label, config in self.patterns.items():
            pattern = config['pattern']
            color = config['color']
            for m in re.finditer(pattern, text, re.MULTILINE):
                allMatches.append({
                    'label': label,
                    'start': m.start(),
                    'end': m.end(),
                    'value': m.group(),
                    'color': color
                })
                
        allMatches.sort(key=lambda x: (x['start'], -x['end']))
        
        return allMatches
        

    def _escapeHTML(self, text: str) -> str:
        """
        Escape raw code so it is safe to embed inside HTML.
        Must be called BEFORE highlighting.
        """
        return html.escape(text, quote=False)
    

    def _removeOverlaps(self, allMatches: list[dict]):
        
        filtered = []
        processed = (-1, -1)
        for match in allMatches:
            start = match['start']
            end = match['end']
            if start >= processed[0] and start < processed[1]:
                continue
            
            processed = (start, end)
            filtered.append(match)

        return filtered
    
        
    def _prepareHighlightedCode(self, text, filtered):
        result = ''
        start = 0
        for m in filtered:
            matchStart = m['start']
            matchEnd = m['end']
            color = m['color']
            value = m['value']
            label = m['label']
            result += text[start:matchStart]
            result += f'<span class="{label}" style="color: #{color};">{value}</span>'
            start = matchEnd
        result += text[start:]
        return f'<pre style="background: black;"><code>{result}</code></pre>'
        

    def highlight(self, text):
        text = text.strip()
        text = self._escapeHTML(text)
        allMatches = self._findPositionOfAllPatterns(text)
        filtered = self._removeOverlaps(allMatches)
        return self._prepareHighlightedCode(text, filtered)


with open('input.txt', 'r') as f:
    content = f.read()
    highlighter = SyntaxHighlighter()
    highlightedCode = highlighter.highlight(content)

    with open('output.txt', 'w') as of:
        of.write(highlightedCode)        
