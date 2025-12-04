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




// ====== COMANDO MANUAL: ATUALIZAR TOP 10 ======
function updateTop10Manually() {
    const currentPage = window.location.pathname.split('/').pop();
    if (!currentPage || currentPage === 'index.html' || currentPage === 'login.html') {
        alert('Este comando só funciona em páginas de produtos (ex: adesivos.html, cortelaser.html, etc.)');
        return;
    }

    const products = JSON.parse(localStorage.getItem(`products_${currentPage}`) || '[]');

    // Produtos padrão (caso existam)
    const defaultProducts = Array.from(document.querySelectorAll('.prod1')).map((prod, index) => ({
        id: `default_${currentPage}_${index}`,
        image: prod.querySelector('img')?.src || '',
        name: prod.querySelector('h3')?.textContent || 'Produto',
        description: prod.querySelector('h4')?.textContent || 'Descrição',
        page: currentPage,
        likes: getProductLikes(`default_${currentPage}_${index}`),
        isDefault: true
    }));

    const allProducts = [...products, ...defaultProducts];
    allProducts.sort((a, b) => b.likes - a.likes);
    const top10 = allProducts.slice(0, 10);

    const carousel = document.getElementById('carousel');
    if (!carousel) {
        alert('Carrossel não encontrado nesta página.');
        return;
    }

    carousel.innerHTML = '';
    top10.forEach((product, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="slide-text">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p style="color: #ff00ff; margin-top: 10px;">❤️ ${product.likes} curtidas</p>
            </div>
        `;
        carousel.appendChild(slide);
    });

    initCarousel();
    localStorage.setItem(`carousel_update_${currentPage}`, new Date().toDateString());
    alert('✅ Top 10 atualizado com sucesso!');
}