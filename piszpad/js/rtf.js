// Konwersja HTML <-> RTF
const RTFConverter = {
    // Konwertuj HTML na RTF
    toRTF: function(html) {
        const font = AppState.fontFamily === 'Times New Roman' ? 'Times New Roman' : 'Libre Baskerville';
        let rtf = '{\\rtf1\\ansi\\ansicpg1250\\deff0 {\\fonttbl {\\f0 ' + font + ';}}\\f0\\fs' + (AppState.fontSize * 2) + ' ';
        
        let cleanText = html
            .replace(/<br\s*\/?>/gi, '\\line ')
            .replace(/<\/p>/gi, '\\par ')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '{\\b $1}')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '{\\b $1}')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '{\\i $1}')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '{\\i $1}')
            .replace(/<u[^>]*>(.*?)<\/u>/gi, '{\\ul $1}')
            .replace(/<[^>]+>/g, '');
        
        // Zamień polskie znaki na kody RTF
        cleanText = cleanText
            .replace(/ą/g, "\\'b1").replace(/Ą/g, "\\'a1")
            .replace(/ć/g, "\\'e6").replace(/Ć/g, "\\'c6")
            .replace(/ę/g, "\\'ea").replace(/Ę/g, "\\'ca")
            .replace(/ł/g, "\\'b3").replace(/Ł/g, "\\'a3")
            .replace(/ń/g, "\\'f1").replace(/Ń/g, "\\'d1")
            .replace(/ó/g, "\\'f3").replace(/Ó/g, "\\'d3")
            .replace(/ś/g, "\\'9c").replace(/Ś/g, "\\'8c")
            .replace(/ź/g, "\\'9f").replace(/Ź/g, "\\'8f")
            .replace(/ż/g, "\\'bf").replace(/Ż/g, "\\'af");
        
        rtf += cleanText + '}';
        return rtf;
    },
    
    // Parsuj formatowanie RTF (bold, italic, underline)
    parseFormatting: function(text) {
        let result = '';
        let i = 0;
        
        while (i < text.length) {
            if (text[i] === '{' && text[i+1] === '\\') {
                let formatType = '';
                if (text.substr(i, 3) === '{\\b' && text[i+3] !== '0') {
                    formatType = 'BOLD';
                } else if (text.substr(i, 3) === '{\\i' && text[i+3] !== '0') {
                    formatType = 'ITALIC';
                } else if (text.substr(i, 4) === '{\\ul' && text[i+4] !== '0') {
                    formatType = 'UNDERLINE';
                }
                
                if (formatType) {
                    let depth = 1;
                    let start = i + (formatType === 'UNDERLINE' ? 4 : 3);
                    while (start < text.length && text[start] === ' ') start++;
                    
                    let j = start;
                    let content = '';
                    
                    while (j < text.length && depth > 0) {
                        if (text[j] === '{') {
                            depth++;
                        } else if (text[j] === '}') {
                            depth--;
                            if (depth === 0) break;
                        }
                        content += text[j];
                        j++;
                    }
                    
                    const parsedContent = this.parseFormatting(content);
                    
                    if (formatType === 'BOLD') {
                        result += '|||BOLD_START|||' + parsedContent + '|||BOLD_END|||';
                    } else if (formatType === 'ITALIC') {
                        result += '|||ITALIC_START|||' + parsedContent + '|||ITALIC_END|||';
                    } else if (formatType === 'UNDERLINE') {
                        result += '|||UNDERLINE_START|||' + parsedContent + '|||UNDERLINE_END|||';
                    }
                    
                    i = j + 1;
                    continue;
                }
            }
            
            result += text[i];
            i++;
        }
        
        return result;
    },
    
    // Konwertuj RTF na HTML
    fromRTF: function(rtf) {
        // Jeśli to nie jest RTF, potraktuj jako zwykły tekst
        if (rtf.indexOf('\\rtf') === -1) {
            return '<p>' + rtf.replace(/\n/g, '</p><p>') + '</p>';
        }
        
        let text = rtf;
        
        // Oznacz paragrafy i łamanie linii
        text = text.replace(/\\par\s*/g, '|||PARAGRAPH|||');
        text = text.replace(/\\line\s*/g, '|||LINEBREAK|||');
        
        // Zamień kody polskich znaków na znaki
        text = text
            .replace(/\\'b1/g, 'ą').replace(/'b1/g, 'ą').replace(/\\u185\?/g, 'ą')
            .replace(/\\'a1/g, 'Ą').replace(/'a1/g, 'Ą').replace(/\\u260\?/g, 'Ą')
            .replace(/\\'e6/g, 'ć').replace(/'e6/g, 'ć').replace(/\\u263\?/g, 'ć')
            .replace(/\\'c6/g, 'Ć').replace(/'c6/g, 'Ć').replace(/\\u262\?/g, 'Ć')
            .replace(/\\'ea/g, 'ę').replace(/'ea/g, 'ę').replace(/\\u281\?/g, 'ę')
            .replace(/\\'ca/g, 'Ę').replace(/'ca/g, 'Ę').replace(/\\u280\?/g, 'Ę')
            .replace(/\\'b3/g, 'ł').replace(/'b3/g, 'ł').replace(/\\u322\?/g, 'ł')
            .replace(/\\'a3/g, 'Ł').replace(/'a3/g, 'Ł').replace(/\\u321\?/g, 'Ł')
            .replace(/\\'f1/g, 'ń').replace(/'f1/g, 'ń').replace(/\\u324\?/g, 'ń')
            .replace(/\\'d1/g, 'Ń').replace(/'d1/g, 'Ń').replace(/\\u323\?/g, 'Ń')
            .replace(/\\'f3/g, 'ó').replace(/'f3/g, 'ó').replace(/\\u243\?/g, 'ó')
            .replace(/\\'d3/g, 'Ó').replace(/'d3/g, 'Ó').replace(/\\u211\?/g, 'Ó')
            .replace(/\\'9c/g, 'ś').replace(/'9c/g, 'ś').replace(/\\u347\?/g, 'ś')
            .replace(/\\'8c/g, 'Ś').replace(/'8c/g, 'Ś').replace(/\\u346\?/g, 'Ś')
            .replace(/\\'9f/g, 'ź').replace(/'9f/g, 'ź').replace(/\\u378\?/g, 'ź')
            .replace(/\\'8f/g, 'Ź').replace(/'8f/g, 'Ź').replace(/\\u377\?/g, 'Ź')
            .replace(/\\'bf/g, 'ż').replace(/'bf/g, 'ż').replace(/\\u380\?/g, 'ż')
            .replace(/\\'af/g, 'Ż').replace(/'af/g, 'Ż').replace(/\\u379\?/g, 'Ż')
            .replace(/\\'84/g, '"').replace(/'84/g, '"')
            .replace(/\\'94/g, '"').replace(/'94/g, '"')
            .replace(/\\'96/g, '–').replace(/'96/g, '–')
            .replace(/\\'97/g, '—').replace(/'97/g, '—');
        
        // Usuń nagłówek RTF
        text = text.replace(/^\{\\rtf[^{}]*/, '');
        text = text.replace(/\}$/, '');
        
        // Parsuj formatowanie
        text = this.parseFormatting(text);
        
        // Usuń pozostałe komendy RTF
        text = text.replace(/\\[a-z]+\d*\s*/gi, ' ');
        text = text.replace(/\{[^}]*\}/g, '');
        text = text.replace(/\\/g, '');
        
        // Wyczyść białe znaki
        text = text.replace(/\s+/g, ' ').trim();
        text = text.replace(/^\{+/, '').replace(/\}+$/, '');
        
        // Zamień markery formatowania na HTML
        text = text.replace(/\|\|\|BOLD_START\|\|\|/g, '<strong>');
        text = text.replace(/\|\|\|BOLD_END\|\|\|/g, '</strong>');
        text = text.replace(/\|\|\|ITALIC_START\|\|\|/g, '<em>');
        text = text.replace(/\|\|\|ITALIC_END\|\|\|/g, '</em>');
        text = text.replace(/\|\|\|UNDERLINE_START\|\|\|/g, '<u>');
        text = text.replace(/\|\|\|UNDERLINE_END\|\|\|/g, '</u>');
        
        // Podziel na paragrafy
        const paragraphs = text.split('|||PARAGRAPH|||');
        let html = '';
        
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i].trim();
            if (para && para.length > 3) {
                const paraWithBreaks = para.replace(/\|\|\|LINEBREAK\|\|\|/g, '<br>');
                html += '<p>' + paraWithBreaks + '</p>';
            }
        }
        
        // Jeśli nie ma paragrafów, spróbuj inaczej
        if (!html || paragraphs.length < 2) {
            text = text.replace(/\|\|\|PARAGRAPH\|\|\|/g, ' ').replace(/\|\|\|LINEBREAK\|\|\|/g, ' ');
            
            const sections = text.split(/\n\s*\n/);
            if (sections.length > 1) {
                for (let j = 0; j < sections.length; j++) {
                    const section = sections[j].trim();
                    if (section) {
                        html += '<p>' + section + '</p>';
                    }
                }
            } else {
                // Podziel na zdania
                const sentences = text.split(/\.\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ])/);
                let currentPara = '';
                
                for (let k = 0; k < sentences.length; k++) {
                    const sentence = sentences[k].trim();
                    if (sentence) {
                        currentPara += sentence + (k < sentences.length - 1 ? '. ' : '');
                        
                        if (currentPara.length > 300) {
                            html += '<p>' + currentPara + '</p>';
                            currentPara = '';
                        }
                    }
                }
                
                if (currentPara.trim()) {
                    html += '<p>' + currentPara + '</p>';
                }
            }
        }
        
        if (!html) {
            html = '<p>' + text + '</p>';
        }
        
        return html;
    }
};
