// Nowa funkcja otwierająca Paint w osobnym oknie
function openPaint() {
    const paintWindow = window.open(
        'paint.html', 
        'MSPaint',
        'width=850,height=650,resizable=yes,menubar=no,toolbar=no,location=no,scrollbars=no'
    );
    
    if (paintWindow) {
        paintWindow.focus();
    }
}
