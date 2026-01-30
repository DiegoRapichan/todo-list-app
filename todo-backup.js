// ========================================
// FUNÇÕES DE EXPORTAR/IMPORTAR DADOS
// ========================================

/**
 * Exporta todos os dados para um arquivo JSON
 */
function exportarDados() {
    const dados = {
        tasks: tasks,
        exportadoEm: new Date().toISOString(),
        versao: '1.0'
    };
    
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Dados exportados com sucesso! Salve o arquivo em local seguro.');
}

/**
 * Abre o seletor de arquivo para importar
 */
function importarDados() {
    document.getElementById('fileInput').click();
}

/**
 * Processa o arquivo importado
 */
function processarImportacao(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (!dados.tasks || !Array.isArray(dados.tasks)) {
                alert('❌ Arquivo inválido! Formato incorreto.');
                return;
            }
            
            if (tasks.length > 0) {
                if (!confirm('⚠️ Isso vai SUBSTITUIR todos os dados atuais. Deseja continuar?')) {
                    return;
                }
            }
            
            tasks = dados.tasks;
            salvarTarefas();
            renderizarTarefas();
            
            alert(`✅ Dados importados com sucesso! ${tasks.length} tarefa(s) carregada(s).`);
        } catch (error) {
            alert('❌ Erro ao importar arquivo! Verifique se é um arquivo válido.');
            console.error(error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Limpa o input
}

// Adiciona input file hidden ao HTML
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('fileInput')) {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'fileInput';
        input.accept = '.json';
        input.style.display = 'none';
        input.onchange = processarImportacao;
        document.body.appendChild(input);
    }
});

// Adiciona botões de backup ao footer
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');
    if (footer && !document.getElementById('backupButtons')) {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.id = 'backupButtons';
        buttonsDiv.style.cssText = 'margin-top: 20px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';
        buttonsDiv.innerHTML = `
            <button onclick="exportarDados()" style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                💾 Exportar Backup
            </button>
            <button onclick="importarDados()" style="padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                📂 Importar Backup
            </button>
        `;
        footer.appendChild(buttonsDiv);
    }
});
