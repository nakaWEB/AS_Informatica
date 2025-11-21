// ====== SISTEMA DE CADASTRO DE PRODUTOS (APENAS ADM) ======
function openProductRegistration() {
    if (!isAdmin()) {
        alert('Acesso negado!');
        return;
    }
    
    const page = prompt('Digite o nome da página (ex: cortelaser.html, adesivos.html, toldos.html):');
    if (!page) return;
    
    const image = prompt('URL da imagem do produto:');
    if (!image) return;
    
    const name = prompt('Nome do produto:');
    if (!name) return;
    
    const desc = prompt('Descrição do produto:');
    if (!desc) return;
    
    // Salva o produto
    const products = JSON.parse(localStorage.getItem(`products_${page}`) || '[]');
    const newProduct = {
        id: 'prod_' + Date.now(),
        image: image,
        name: name,
        description: desc,
        page: page,
        likes: 0,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem(`products_${page}`, JSON.stringify(products));
    
    alert('Produto cadastrado com sucesso!');
    
    // Atualiza página atual se for a mesma
    if (window.location.pathname.includes(page)) {
        location.reload();
    }
}

function registerProduct() {
    const page = document.getElementById('product-page').value;
    const image = document.getElementById('product-image').value;
    const name = document.getElementById('product-name').value.trim();
    const desc = document.getElementById('product-desc').value.trim();
    
    if (!image || !name || !desc) {
        alert('Preencha todos os campos!');
        return;
    }
    
    // Carrega produtos existentes
    const products = JSON.parse(localStorage.getItem(`products_${page}`) || '[]');
    const newProduct = {
        id: 'prod_' + Date.now(),
        image: image,
        name: name,
        description: desc,
        page: page,
        likes: 0,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem(`products_${page}`, JSON.stringify(products));
    
    alert('Produto cadastrado com sucesso!');
    document.getElementById('product-modal').remove();
    
    // Atualiza a página se estiver na mesma página do produto
    if (window.location.pathname.includes(page)) {
        location.reload();
    }
}