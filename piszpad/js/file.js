// Obsługa plików
const FileHandler = {
    // Otwórz dokument
    openDocument: function() {
        document.getElementById('fileInput').click();
        document.getElementById('optionsMenu').classList.remove('show');
    },
    
    // Wczytaj plik RTF
    loadFile: function(e) {
        const file = e.target.files[0];
        if (file) {
            AppState.fileName = file.name;
            document.getElementById('fileName').textContent = AppState.fileName;
            const reader = new FileReader();
            reader.onload = function(e) {
                const rtf = e.target.result;
                const html = RTFConverter.fromRTF(rtf);
                AppState.editor.innerHTML = html;
                
                AppState.undoHistory = [];
                AppState.historyIndex = -1;
                AppState.saveState();
                AppState.updateWordCount();
            };
            reader.readAsText(file);
        }
    },
    
    // Zapisz dokument jako RTF
    saveDocument: function() {
        const html = AppState.editor.innerHTML;
        const rtf = RTFConverter.toRTF(html);
        const blob = new Blob([rtf], { type: 'application/rtf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = AppState.fileName;
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('optionsMenu').classList.remove('show');
    },
    
    // Eksportuj do TXT
    exportToTxt: function() {
        const text = AppState.editor.innerText || AppState.editor.textContent || '';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = AppState.fileName.replace(/\.rtf$/, '.txt');
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('optionsMenu').classList.remove('show');
    },
    
    // Otwórz jako tekst
    openAsText: function() {
        AppState.openAsTextMode = true;
        document.getElementById('textFileInput').click();
        document.getElementById('optionsMenu').classList.remove('show');
    },
    
    // Wczytaj plik jako tekst
    loadFileAsText: function(e) {
        const file = e.target.files[0];
        if (file) {
            AppState.fileName = file.name;
            document.getElementById('fileName').textContent = AppState.fileName;
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                const htmlContent = '<p>' + text.replace(/\n\s*\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
                AppState.editor.innerHTML = htmlContent;
                
                AppState.undoHistory = [];
                AppState.historyIndex = -1;
                AppState.saveState();
                AppState.updateWordCount();
            };
            reader.readAsText(file);
        }
        AppState.openAsTextMode = false;
    },
    
    // Eksportuj do PDF
    exportToPdf: function() {
        const jsPDF = window.jspdf.jsPDF;
        const doc = new jsPDF();
        
        const text = AppState.editor.innerText || AppState.editor.textContent || '';
        
        const pageHeight = doc.internal.pageSize.height;
        const lineHeight = 7;
        const margin = 20;
        const maxWidth = 170;
        let yPosition = margin;
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
            if (yPosition + lineHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            doc.text(lines[i], margin, yPosition);
            yPosition += lineHeight;
        }
        
        doc.save(AppState.fileName.replace(/\.rtf$/, '.pdf'));
        document.getElementById('optionsMenu').classList.remove('show');
    }
};
