// ====== SEGURANÇA: EM PRODUÇÃO USE BACKEND REAL! ======
// Este código usa localStorage apenas para demonstração
// NUNCA armazene senhas no frontend em produção!

// Usuário ADMIN pré-cadastrado (executa apenas uma vez)
if (!localStorage.getItem('users_db')) {
    const adminUser = {
        id: 'admin_001',
        phone: '28 99979-7386',
        name: 'ADMnaka',
        password: btoa('jumamjee25A@'), // Simulação de hash (use bcrypt em produção!)
        isAdmin: true,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('users_db', JSON.stringify([adminUser]));
}

// ====== FUNÇÕES DE AUTENTICAÇÃO ======
function getUsers() {
    return JSON.parse(localStorage.getItem('users_db') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('users_db', JSON.stringify(users));
}

function getCurrentUser() {
    const userId = sessionStorage.getItem('current_user_id');
    if (!userId) return null;
    
    const users = getUsers();
    return users.find(u => u.id === userId);
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.isAdmin;
}

function hashPassword(password) {
    // EM PRODUÇÃO: Use bcrypt ou similar
    return btoa(password);
}

function validatePassword(password) {
    // Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);
}

// ====== FORMULÁRIO DE AUTH ======
document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('auth-form');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const toggleAuth = document.getElementById('toggle-auth');
    const toggleText = document.querySelector('.login-toggle p');
    
    let isLoginMode = false;
    
    if (toggleAuth) {
        toggleAuth.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            formTitle.textContent = isLoginMode ? 'FAÇA LOGIN' : 'CRIAR CONTA';
            submitBtn.textContent = isLoginMode ? 'ENTRAR' : 'CRIAR CONTA';
            toggleText.innerHTML = isLoginMode 
                ? 'Não tem conta? <a id="toggle-auth">Crie uma conta</a>'
                : 'Já tem conta? <a id="toggle-auth">Faça login</a>';
            document.getElementById('toggle-auth').addEventListener('click', arguments.callee);
        });
    }
    
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('phone').value.trim();
            const name = document.getElementById('name').value.trim();
            const password = document.getElementById('password').value;
            
            if (!isLoginMode) {
                // CADASTRO
                if (!validatePassword(password)) {
                    alert('Senha inválida! Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 caractere especial!');
                    return;
                }
                
                const users = getUsers();
                if (users.find(u => u.phone === phone)) {
                    alert('Este celular já está cadastrado!');
                    return;
                }
                
                const newUser = {
                    id: 'user_' + Date.now(),
                    phone: phone,
                    name: name,
                    password: hashPassword(password),
                    isAdmin: false,
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                saveUsers(users);
                
                alert('Conta criada com sucesso! Faça login.');
                window.location.href = './login.html';
                
            } else {
                // LOGIN
                const users = getUsers();
                const user = users.find(u => u.phone === phone);
                
                if (!user || user.password !== hashPassword(password)) {
                    alert('Celular ou senha incorretos!');
                    return;
                }
                
                sessionStorage.setItem('current_user_id', user.id);
                window.location.href = './index.html';
            }
        });
    }
    
    // LOGOUT
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('current_user_id');
            window.location.href = './login.html';
        });
    }
    
    // Verifica acesso às páginas protegidas
    if (window.location.pathname.includes('favoritos.html') && !isLoggedIn()) {
        window.location.href = './login.html';
    }
});

// ====== ACESSO ADMIN ======
function checkAdminAccess() {
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn && isAdmin()) {
        adminBtn.style.display = 'inline-block';
        adminBtn.addEventListener('click', openAdminPanel);
    }
}

// Painel Admin (Prompt de Comando)
function openAdminPanel() {
    if (!isAdmin()) {
        alert('Acesso negado! Apenas ADMs podem executar comandos.');
        return;
    }
    
    const command = prompt('=== PAINEL ADMIN ===\nComandos disponíveis:\n1. make-admin [id_usuario] - Tornar usuário ADM\n2. add-product - Cadastrar novo produto\n3. list-users - Listar usuários\n\nDigite o comando:');
    
    if (!command) return;
    
    const parts = command.split(' ');
    const cmd = parts[0];
    
    switch(cmd) {
        case 'make-admin':
            const userId = parts[1];
            if (!userId) {
                alert('Uso: make-admin [id_usuario]');
                return;
            }
            makeUserAdmin(userId);
            break;
            
        case 'add-product':
            openProductRegistration();
            break;
            
        case 'list-users':
            listAllUsers();
            break;
            
        default:
            alert('Comando inválido!');
    }
}

function makeUserAdmin(userId) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        alert('Usuário não encontrado!');
        return;
    }
    
    user.isAdmin = true;
    saveUsers(users);
    alert(`Usuário ${user.name} agora é ADM!`);
}

function listAllUsers() {
    const users = getUsers();
    let list = '=== USUÁRIOS CADASTRADOS ===\n\n';
    users.forEach(u => {
        list += `ID: ${u.id}\nNome: ${u.name}\nCelular: ${u.phone}\nADM: ${u.isAdmin ? 'SIM' : 'NÃO'}\n\n`;
    });
    alert(list);
}

// Cadastro de produtos (ADM)
function openProductRegistration() {
    if (!isAdmin()) {
        alert('Acesso negado!');
        return;
    }
    const page = prompt('Página do produto:\n(ex: adesivos.html, cortelaser.html, toldos.html)');
    if (!page) return;
    const image = prompt('URL da imagem do produto:');
    if (!image) return;
    const name = prompt('Nome do produto:');
    if (!name) return;
    const desc = prompt('Descrição do produto:');
    if (!desc) return;

    const products = JSON.parse(localStorage.getItem(`products_${page}`) || '[]');
    products.push({
        id: 'prod_' + Date.now(),
        image,
        name,
        description: desc,
        page,
        likes: 0,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem(`products_${page}`, JSON.stringify(products));
    alert('Produto cadastrado com sucesso!');
    if (window.location.pathname.includes(page)) location.reload();
}

// ====== GARANTIR LOGOUT EM TODAS AS PÁGINAS ======
document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('current_user_id');
            window.location.href = './login.html';
        });
    }
});

// ====== GARANTIR QUE O BOTÃO ADMIN APAREÇA PARA QUEM É ADMIN ======
document.addEventListener('DOMContentLoaded', function () {
    const user = getCurrentUser();
    const adminBtn = document.getElementById('admin-btn');

    if (user && user.isAdmin && adminBtn) {
        adminBtn.style.display = 'inline-block';
        adminBtn.addEventListener('click', function (e) {
            e.preventDefault();
            openAdminPanel();
        });
    }
});