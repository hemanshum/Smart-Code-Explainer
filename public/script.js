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
                    cm.replaceSelection(cm.getOption("indentWithTabs")? "\t":
                        Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
                }
            }
        }
    });
    
    // Set initial content if needed
    editor.setValue("// Enter your code here");
    editor.focus();
});

function showLoading() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="loading">Analyzing your code...</div>';
    document.getElementById('copyBtn').style.display = 'none';
}

function showResult(content) {
    const resultDiv = document.getElementById('result');
    // Convert the content to Markdown using marked
    const formattedContent = marked.parse(content);
    resultDiv.innerHTML = formattedContent;
    document.getElementById('copyBtn').style.display = 'block';
}

function showError(error) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div style="color: #dc3545;">❌ Error: ${error}</div>`;
    document.getElementById('copyBtn').style.display = 'none';
}

function copyResult() {
    const resultDiv = document.getElementById('result');
    const text = resultDiv.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => {
            copyBtn.innerText = originalText;
        }, 2000);
    });
}

async function analyzeCode() {
    const codeInput = editor.getValue();
    const analysisType = document.getElementById('analysisType').value;

    if (!codeInput.trim()) {
        alert('Please enter some code to analyze');
        return;
    }

    showLoading();

    try {
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: codeInput,
                analysisType: analysisType
            })
        });

        const data = await response.json();
        if (data.error) {
            showError(data.error);
        } else {
            showResult(data.analysis);
        }
    } catch (error) {
        showError(error.message);
    }
}