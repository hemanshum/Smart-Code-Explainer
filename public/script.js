let editor;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror
    editor = CodeMirror.fromTextArea(document.getElementById("codeInput"), {
        mode: "javascript",  // default mode
        theme: "dracula",
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        extraKeys: {
            "Tab": function(cm) {
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection("    ", "end");
                }
            }
        }
    });

    // Set some sample code
    editor.setValue(`// Enter your code here\nfunction example() {\n    console.log("Hello World!");\n}`);
});

function showLoading() {
    const result = document.getElementById('result');
    result.innerHTML = '<div class="loading">Analyzing code...</div>';
    document.getElementById('copyBtn').style.display = 'none';
}

function showResult(content) {
    const result = document.getElementById('result');
    // Convert the content to markdown
    const htmlContent = marked.parse(content);
    result.innerHTML = htmlContent;
    document.getElementById('copyBtn').style.display = 'block';
}

function showError(error) {
    const result = document.getElementById('result');
    result.innerHTML = `<div style="color: #dc3545;">${error}</div>`;
    document.getElementById('copyBtn').style.display = 'none';
}

function copyResult() {
    const result = document.getElementById('result');
    const text = result.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text:', err);
    });
}

async function analyzeCode() {
    const code = editor.getValue();
    if (!code.trim()) {
        showError('Please enter some code to analyze');
        return;
    }

    const analysisType = document.getElementById('analysisType').value;
    showLoading();

    try {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                analysisType
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            showResult(data.result);
        } else {
            showError(data.error || 'An error occurred while analyzing the code');
        }
    } catch (error) {
        showError('Failed to connect to the server. Make sure the server is running.');
        console.error('Error:', error);
    }
}