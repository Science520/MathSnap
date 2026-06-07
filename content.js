// ==========================================
// 方案 A：鼠标点击公式自动复制
// ==========================================
document.addEventListener('click', async function(event) {
    // 寻找点击的元素是不是属于公式块 (这里以常见的 katex 为例)
    const mathElement = event.target.closest('.katex'); 
    
    if (mathElement) {
        event.preventDefault();
        event.stopPropagation();

        const annotation = mathElement.querySelector('annotation[encoding="application/x-tex"]');
        if (annotation) {
            let rawLatex = annotation.textContent;

            // 判断是否是独立成行的块级公式
            if (mathElement.classList.contains('katex-display')) {
                rawLatex = `\n$$\n${rawLatex}\n$$\n`;
            } else {
                rawLatex = `$${rawLatex}$`;
            }

            try {
                await navigator.clipboard.writeText(rawLatex);
                showToast('✅ Markdown copied!');
            } catch (err) {
                console.error('Copy failed!', err);
                showToast('❌ Copy failed. Please try again.');
            }
        }
    }
});

// ==========================================
// 方案 B：拦截浏览器的 Ctrl+C (划选复制) 事件
// ==========================================
document.addEventListener('copy', function(event) {
    const selection = window.getSelection();
    // 如果没有选中文本，不处理
    if (!selection.rangeCount || selection.isCollapsed) return;

    // 创建一个临时容器来分析选中的 HTML
    const container = document.createElement('div');
    container.appendChild(selection.getRangeAt(0).cloneContents());

    // 检查选中的内容里有没有公式
    const mathElements = container.querySelectorAll('.katex');
    if (mathElements.length > 0) {
        event.preventDefault(); // 拦截默认的错乱复制

        // 遍历所有选中的公式，替换为纯文本的 LaTeX
        mathElements.forEach(el => {
            const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
            if (annotation) {
                const isDisplay = el.classList.contains('katex-display');
                const latexText = isDisplay ? `\n$$\n${annotation.textContent}\n$$\n` : ` $${annotation.textContent}$ `;
                const textNode = document.createTextNode(latexText);
                el.parentNode.replaceChild(textNode, el);
            }
        });

        // 将处理好的纯文本写入剪贴板
        event.clipboardData.setData('text/plain', container.innerText);
        showToast('✅ Content & formulas copied!');
    }
});

// ==========================================
// 辅助功能：屏幕右下角提示框
// ==========================================
function showToast(message) {
    // 如果已经有提示框，先移除
    const existingToast = document.getElementById('formula-copier-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'formula-copier-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        z-index: 2147483647; /* top */
        font-size: 14px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        pointer-events: none;
        transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
    
    // 2s disappear
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}