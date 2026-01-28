// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let tasks = []; // Array que armazena todas as tarefas
let filtroAtual = 'todas'; // Filtro ativo (todas, ativas, concluidas)
let editandoId = null; // ID da tarefa sendo editada

// ========================================
// ELEMENTOS DO DOM
// ========================================
const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const themeToggle = document.getElementById('themeToggle');

// Badges (contadores)
const badgeTodas = document.getElementById('badgeTodas');
const badgeAtivas = document.getElementById('badgeAtivas');
const badgeConcluidas = document.getElementById('badgeConcluidas');

// Estatísticas
const statTotal = document.getElementById('statTotal');
const statPendentes = document.getElementById('statPendentes');
const statConcluidas = document.getElementById('statConcluidas');
const statProgresso = document.getElementById('statProgresso');

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Carrega tarefas do localStorage
    carregarTarefas();
    
    // Carrega preferência de tema
    carregarTema();
    
    // Renderiza as tarefas na tela
    renderizarTarefas();
    
    // Configura event listeners
    configurarEventListeners();
});

// ========================================
// CONFIGURAR EVENT LISTENERS
// ========================================
function configurarEventListeners() {
    // Adicionar tarefa ao clicar no botão
    addTaskBtn.addEventListener('click', adicionarOuEditarTarefa);
    
    // Adicionar tarefa ao pressionar Enter
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            adicionarOuEditarTarefa();
        }
    });
    
    // Buscar tarefas
    searchInput.addEventListener('input', renderizarTarefas);
    
    // Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove classe active de todos
            filterButtons.forEach(b => b.classList.remove('active'));
            // Adiciona classe active no clicado
            btn.classList.add('active');
            // Atualiza filtro atual
            filtroAtual = btn.dataset.filter;
            // Renderiza com novo filtro
            renderizarTarefas();
        });
    });
    
    // Limpar tarefas concluídas
    clearCompletedBtn.addEventListener('click', limparConcluidas);
    
    // Toggle dark mode
    themeToggle.addEventListener('click', alternarTema);
}

// ========================================
// FUNÇÕES PRINCIPAIS
// ========================================

/**
 * Adiciona uma nova tarefa ou edita uma existente
 */
function adicionarOuEditarTarefa() {
    const texto = taskInput.value.trim();
    
    // Valida se o campo não está vazio
    if (texto === '') {
        alert('Por favor, digite uma tarefa!');
        taskInput.focus();
        return;
    }
    
    if (editandoId !== null) {
        // EDITAR tarefa existente
        const tarefa = tasks.find(t => t.id === editandoId);
        if (tarefa) {
            tarefa.texto = texto;
            tarefa.categoria = taskCategory.value;
            tarefa.prioridade = taskPriority.value;
        }
        editandoId = null;
        addTaskBtn.innerHTML = '<span class="btn-icon">+</span> Adicionar';
    } else {
        // ADICIONAR nova tarefa
        const novaTarefa = {
            id: Date.now(), // ID único baseado no timestamp
            texto: texto,
            categoria: taskCategory.value,
            prioridade: taskPriority.value,
            concluida: false,
            dataCriacao: new Date().toLocaleString('pt-BR')
        };
        
        tasks.push(novaTarefa);
    }
    
    // Limpa o formulário
    taskInput.value = '';
    taskInput.focus();
    
    // Salva no localStorage
    salvarTarefas();
    
    // Atualiza a interface
    renderizarTarefas();
}

/**
 * Renderiza as tarefas na tela
 */
function renderizarTarefas() {
    // Filtra tarefas baseado no filtro ativo e busca
    const tarefasFiltradas = filtrarTarefas();
    
    // Limpa a lista
    tasksList.innerHTML = '';
    
    // Se não houver tarefas, mostra estado vazio
    if (tarefasFiltradas.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Cria elemento HTML para cada tarefa
    tarefasFiltradas.forEach(tarefa => {
        const taskElement = criarElementoTarefa(tarefa);
        tasksList.appendChild(taskElement);
    });
    
    // Atualiza estatísticas e badges
    atualizarEstatisticas();
}

/**
 * Cria o elemento HTML de uma tarefa
 */
function criarElementoTarefa(tarefa) {
    const div = document.createElement('div');
    div.className = `task-item priority-${tarefa.prioridade} ${tarefa.concluida ? 'completed' : ''}`;
    
    // Emojis por categoria
    const emojisCategoria = {
        'pessoal': '🏠',
        'trabalho': '💼',
        'estudos': '📚',
        'saude': '💪',
        'outros': '📌'
    };
    
    // Emojis por prioridade
    const emojisPrioridade = {
        'baixa': '🟢',
        'media': '🟡',
        'alta': '🔴'
    };
    
    div.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${tarefa.concluida ? 'checked' : ''}
            onchange="toggleConcluida(${tarefa.id})"
        >
        
        <div class="task-content">
            <div class="task-text">${tarefa.texto}</div>
            <div class="task-meta">
                <span class="task-category">
                    ${emojisCategoria[tarefa.categoria]} ${capitalize(tarefa.categoria)}
                </span>
                <span class="task-priority">
                    ${emojisPrioridade[tarefa.prioridade]} ${capitalize(tarefa.prioridade)}
                </span>
                <span class="task-date">📅 ${tarefa.dataCriacao}</span>
            </div>
        </div>
        
        <div class="task-actions">
            <button class="btn-edit" onclick="editarTarefa(${tarefa.id})">
                ✏️ Editar
            </button>
            <button class="btn-delete" onclick="deletarTarefa(${tarefa.id})">
                🗑️ Deletar
            </button>
        </div>
    `;
    
    return div;
}

/**
 * Filtra tarefas baseado no filtro ativo e busca
 */
function filtrarTarefas() {
    let tarefasFiltradas = tasks;
    
    // Filtro por status (todas, ativas, concluidas)
    if (filtroAtual === 'ativas') {
        tarefasFiltradas = tasks.filter(t => !t.concluida);
    } else if (filtroAtual === 'concluidas') {
        tarefasFiltradas = tasks.filter(t => t.concluida);
    }
    
    // Filtro por busca
    const termoBusca = searchInput.value.toLowerCase().trim();
    if (termoBusca !== '') {
        tarefasFiltradas = tarefasFiltradas.filter(t => 
            t.texto.toLowerCase().includes(termoBusca) ||
            t.categoria.toLowerCase().includes(termoBusca)
        );
    }
    
    return tarefasFiltradas;
}

/**
 * Marca/desmarca tarefa como concluída
 */
function toggleConcluida(id) {
    const tarefa = tasks.find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefas();
    }
}

/**
 * Prepara tarefa para edição
 */
function editarTarefa(id) {
    const tarefa = tasks.find(t => t.id === id);
    if (tarefa) {
        taskInput.value = tarefa.texto;
        taskCategory.value = tarefa.categoria;
        taskPriority.value = tarefa.prioridade;
        editandoId = id;
        addTaskBtn.innerHTML = '✏️ Salvar Edição';
        taskInput.focus();
    }
}

/**
 * Deleta uma tarefa
 */
function deletarTarefa(id) {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
        tasks = tasks.filter(t => t.id !== id);
        salvarTarefas();
        renderizarTarefas();
    }
}

/**
 * Limpa todas as tarefas concluídas
 */
function limparConcluidas() {
    const qtdConcluidas = tasks.filter(t => t.concluida).length;
    
    if (qtdConcluidas === 0) {
        alert('Não há tarefas concluídas para limpar!');
        return;
    }
    
    if (confirm(`Deseja remover ${qtdConcluidas} tarefa(s) concluída(s)?`)) {
        tasks = tasks.filter(t => !t.concluida);
        salvarTarefas();
        renderizarTarefas();
    }
}

/**
 * Atualiza estatísticas e badges
 */
function atualizarEstatisticas() {
    const total = tasks.length;
    const concluidas = tasks.filter(t => t.concluida).length;
    const pendentes = total - concluidas;
    const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    
    // Atualiza estatísticas
    statTotal.textContent = total;
    statPendentes.textContent = pendentes;
    statConcluidas.textContent = concluidas;
    statProgresso.textContent = `${progresso}%`;
    
    // Atualiza badges dos filtros
    badgeTodas.textContent = total;
    badgeAtivas.textContent = pendentes;
    badgeConcluidas.textContent = concluidas;
}

// ========================================
// LOCAL STORAGE (salvar/carregar dados)
// ========================================

/**
 * Salva tarefas no localStorage
 */
function salvarTarefas() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

/**
 * Carrega tarefas do localStorage
 */
function carregarTarefas() {
    const tarefasSalvas = localStorage.getItem('taskflow_tasks');
    if (tarefasSalvas) {
        tasks = JSON.parse(tarefasSalvas);
    }
}

// ========================================
// DARK MODE (tema escuro)
// ========================================

/**
 * Alterna entre modo claro e escuro
 */
function alternarTema() {
    document.body.classList.toggle('dark-mode');
    
    // Salva preferência
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('taskflow_theme', isDark ? 'dark' : 'light');
}

/**
 * Carrega tema salvo
 */
function carregarTema() {
    const temaSalvo = localStorage.getItem('taskflow_theme');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Capitaliza primeira letra de uma string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// ATALHOS DE TECLADO (BONUS!)
// ========================================
document.addEventListener('keydown', (e) => {
    // ESC: limpa o campo de input
    if (e.key === 'Escape') {
        taskInput.value = '';
        editandoId = null;
        addTaskBtn.innerHTML = '<span class="btn-icon">+</span> Adicionar';
    }
    
    // Ctrl + K: foca no campo de busca
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// ========================================
// CONSOLE LOG (para debug)
// ========================================
console.log('✅ TaskFlow inicializado com sucesso!');
console.log('📝 Dica: Pressione Ctrl+K para buscar tarefas');
console.log('📝 Dica: Pressione ESC para limpar o formulário');
