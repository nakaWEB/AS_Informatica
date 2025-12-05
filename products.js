// ====== SISTEMA DE PRODUTOS, CURTIDAS E FAVORITOS ======

// Carrega produtos de uma página específica
function loadProductsFromPage(pageName) {
    const container = document.querySelector('.containerprodutos');
    if (!container) return;

    const defaultProducts = Array.from(container.querySelectorAll('.prod1')).map((prod, index) => ({
        id: `default_${pageName}_${index}`,
        image: prod.querySelector('img')?.src || '',
        name: prod.querySelector('h3')?.textContent || 'Produto',
        description: prod.querySelector('h4')?.textContent || 'Descrição',
        page: pageName,
        likes: 0,
        isDefault: true
    }));

    // Mescla com produtos do admin
    const adminProducts = JSON.parse(localStorage.getItem(`products_${pageName}`) || '[]');
    const allProducts = [...defaultProducts, ...adminProducts];

    // Renderiza produtos
    container.innerHTML = '';
    allProducts.forEach(product => {
        const currentUser = getCurrentUser();
        const hasLiked = currentUser ? hasUserLikedProduct(currentUser.id, product.id) : false;
        const isFavorited = currentUser ? isProductFavorited(currentUser.id, product.id) : false;

        // Cria um wrapper para card + botões
        const wrapper = document.createElement('div');
        wrapper.className = 'product-wrapper';

        // Cria o card
        const prodDiv = document.createElement('div');
        prodDiv.className = 'prod1';
        prodDiv.dataset.productId = product.id;
        prodDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <h4>${product.description}</h4>
        `;

        // Cria os botões de ação
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'product-actions-outside';
        actionsDiv.innerHTML = `
            <button class="like-btn ${hasLiked ? 'liked' : ''}" data-product-id="${product.id}" title="Curtir">
                <span class="like-icon">${hasLiked ? '❤︎' : '♡'}</span>
                <span class="like-count">${getProductLikes(product.id)}</span>
            </button>
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-product-id="${product.id}" title="Favoritar">
                <span class="favorite-icon">${isFavorited ? '⭐' : '☆'}</span>
            </button>
        `;

        // Monta estrutura
        wrapper.appendChild(prodDiv);
        wrapper.appendChild(actionsDiv);
        container.appendChild(wrapper);
    });

    // Adiciona event listeners
    addProductEventListeners();
}

// ====== SISTEMA DE CURTIDAS ======
function hasUserLikedProduct(userId, productId) {
    const likes = JSON.parse(localStorage.getItem('likes_db') || '[]');
    return likes.some(like => like.userId === userId && like.productId === productId);
}

function getProductLikes(productId) {
    const likes = JSON.parse(localStorage.getItem('likes_db') || '[]');
    return likes.filter(like => like.productId === productId).length;
}

function toggleLike(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Faça login para curtir produtos!');
        window.location.href = './login.html';
        return;
    }

    const likes = JSON.parse(localStorage.getItem('likes_db') || '[]');
    const existingLike = likes.find(like => like.userId === currentUser.id && like.productId === productId);

    if (existingLike) {
        const index = likes.indexOf(existingLike);
        likes.splice(index, 1);
    } else {
        likes.push({
            userId: currentUser.id,
            productId: productId,
            timestamp: new Date().toISOString()
        });
    }

    localStorage.setItem('likes_db', JSON.stringify(likes));
    updateCarouselWithTopProducts();
    return !existingLike;
}

// ====== SISTEMA DE FAVORITOS ======
function isProductFavorited(userId, productId) {
    const favorites = JSON.parse(localStorage.getItem(`favs_${userId}`) || '[]');
    return favorites.includes(productId);
}

function toggleFavorite(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Faça login para favoritar produtos!');
        window.location.href = './login.html';
        return;
    }

    const storageKey = `favs_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = favorites.indexOf(productId);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }

    localStorage.setItem(storageKey, JSON.stringify(favorites));
    loadUserFavorites();
}

// ====== FAVORITOS ======
function loadUserFavorites() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
        container.innerHTML = '<p style="text-align: center; color: #ff00ff;">Faça login para ver seus favoritos!</p>';
        return;
    }

    const favorites = JSON.parse(localStorage.getItem(`favs_${currentUser.id}`) || '[]');

    if (favorites.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #00d4ff;">Você ainda não tem favoritos!</p>';
        return;
    }

    const allProducts = [];
    const pages = ['cortelaser.html', 'adesivos.html', 'toldos.html', 'placasfachadas.html'];

    pages.forEach(page => {
        const pageProducts = JSON.parse(localStorage.getItem(`products_${page}`) || '[]');
        allProducts.push(...pageProducts);
    });

    pages.forEach(page => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = getDefaultProductsHTML(page);
        const defaultProds = tempDiv.querySelectorAll('.prod1');
        defaultProds.forEach((prod, index) => {
            allProducts.push({
                id: `default_${page}_${index}`,
                image: prod.querySelector('img')?.src || '',
                name: prod.querySelector('h3')?.textContent || 'Produto',
                description: prod.querySelector('h4')?.textContent || 'Descrição',
                page: page
            });
        });
    });

    const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

    container.innerHTML = '';
    favoriteProducts.forEach(product => {
       // Cria wrapper para card + botão
const wrapper = document.createElement('div');
wrapper.className = 'fav-wrapper';

// Cria o card
const prodDiv = document.createElement('div');
prodDiv.className = 'prod1';
prodDiv.innerHTML = `
    <img src="${product.image}" alt="${product.name}" onerror="this.src='./imgs-mp4s/placeholder.png'">
    <h3>${product.name}</h3>
    <h4>${product.description}</h4>
`;

// Cria o botão "Remover" abaixo do card
const removeBtn = document.createElement('button');
removeBtn.className = 'btn-remove-fav';
removeBtn.textContent = 'Remover';
removeBtn.style.background = '#ff0000';
removeBtn.style.color = '#fff';
removeBtn.style.border = 'none';
removeBtn.style.padding = '10px 20px';
removeBtn.style.borderRadius = '20px';
removeBtn.style.cursor = 'pointer';
removeBtn.style.marginTop = '10px';
removeBtn.onclick = () => removeFromFavorites(product.id);

// Monta estrutura
wrapper.appendChild(prodDiv);
wrapper.appendChild(removeBtn);
container.appendChild(wrapper);
    });
}

function getDefaultProductsHTML(page) {
    const defaults = {
        'cortelaser.html': `
<div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Vinil Branco</h3>
                <h4>Impressão UV 1440dpi</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Transparente</h3>
                <h4>Perfeito para vidros</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Fosco</h3>
                <h4>Acabamento elegante</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Refletivo</h3>
                <h4>Visibilidade noturna</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo 3M</h3>
                <h4>Alta durabilidade</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Perfurado</h3>
                <h4>One-way vision</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Metalizado</h3>
                <h4>Acabamento metálico</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Holográfico</h3>
                <h4>Efeito arco-íris</h4>
            </div>
        `,
        'adesivos.html': `
<div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Vinil Branco</h3>
                <h4>Impressão UV 1440dpi</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Transparente</h3>
                <h4>Perfeito para vidros</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Fosco</h3>
                <h4>Acabamento elegante</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Refletivo</h3>
                <h4>Visibilidade noturna</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo 3M</h3>
                <h4>Alta durabilidade</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Perfurado</h3>
                <h4>One-way vision</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Metalizado</h3>
                <h4>Acabamento metálico</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Holográfico</h3>
                <h4>Efeito arco-íris</h4>
            </div>
        `,
        'toldos.html': `
<div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Vinil Branco</h3>
                <h4>Impressão UV 1440dpi</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Transparente</h3>
                <h4>Perfeito para vidros</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Fosco</h3>
                <h4>Acabamento elegante</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Refletivo</h3>
                <h4>Visibilidade noturna</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo 3M</h3>
                <h4>Alta durabilidade</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Perfurado</h3>
                <h4>One-way vision</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Metalizado</h3>
                <h4>Acabamento metálico</h4>
            </div>
            <div class="prod1">
                <img src="ADESIVOs.png" alt="">
                <h3>Adesivo Holográfico</h3>
                <h4>Efeito arco-íris</h4>
            </div>
        `,
        'placasfachadas.html': `
                    <div class="prod1">
                <img src="./imgs-mp4s/placapvccomcoberturadeacm.png" alt="">
                <h3>Placa iluminada</h3>
                <h4>Placa de PVC com cobertura de acm e iluminação de led</h4>
            </div>
                        <div class="prod1">
                <img src="./imgs-mp4s/fachadaacm.png" alt="">
                <h3>Fachada</h3>
                <h4>fachada feita em acm com placa de acm rasgado</h4>
            </div>
        `,
    };
    return defaults[page] || '';
}

function removeFromFavorites(productId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const storageKey = `favs_${currentUser.id}`;
    const favorites = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = favorites.indexOf(productId);

    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(storageKey, JSON.stringify(favorites));
        loadUserFavorites();
    }
}

// ====== EVENT LISTENERS ======
function addProductEventListeners() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const productId = this.dataset.productId;
            const liked = toggleLike(productId);

            this.classList.toggle('liked');
            this.querySelector('.like-icon').textContent = liked ? '❤︎' : '♡︎';
            this.querySelector('.like-count').textContent = getProductLikes(productId);
        });
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const productId = this.dataset.productId;
            const favorited = this.classList.contains('favorited');

            toggleFavorite(productId);

            this.classList.toggle('favorited');
            this.querySelector('.favorite-icon').textContent = favorited ? '☆' : '⭐';
        });
    });
}

// ====== CARROSSEL TOP 10 ======
function updateCarouselWithTopProducts() {
    const currentPage = window.location.pathname.split('/').pop();
    if (!currentPage || currentPage === 'index.html' || currentPage === '') return;

    const products = JSON.parse(localStorage.getItem(`products_${currentPage}`) || '[]');
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

    // Remova a verificação de data/hora e sempre atualize
    const carousel = document.getElementById('carousel');
    if (carousel) {
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
    }
}

function initCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel || carousel.children.length === 0) return;

    let currentSlide = 0;
    const slides = carousel.querySelectorAll('.slide');
    const totalSlides = slides.length;

    const indicatorsContainer = document.getElementById('indicators');
    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (i === 0) indicator.classList.add('active');
            indicator.dataset.slide = i;
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
        }
    }

    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        document.querySelectorAll('.indicator').forEach((ind, idx) => {
            ind.classList.toggle('active', idx === currentSlide);
        });
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) prevBtn.onclick = () => {
        currentSlide--;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        goToSlide(currentSlide);
    };

    if (nextBtn) nextBtn.onclick = () => {
        currentSlide++;
        if (currentSlide >= totalSlides) currentSlide = 0;
        goToSlide(currentSlide);
    };

    setInterval(() => {
        currentSlide++;
        if (currentSlide >= totalSlides) currentSlide = 0;
        goToSlide(currentSlide);
    }, 10000);
}

function scheduleDailyUpdate() {
    setInterval(() => {
        const now = new Date();
        const brtHour = now.getUTCHours() - 3;
        if (brtHour === 12 || brtHour === 24) {
            updateCarouselWithTopProducts();
        }
    }, 60000);
}

document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'index.html' && currentPage !== 'login.html' && currentPage !== 'favoritos.html') {
        loadProductsFromPage(currentPage);
        updateCarouselWithTopProducts();
        scheduleDailyUpdate();
    }
    initCarousel();
});

document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'index.html' && currentPage !== 'login.html' && currentPage !== 'favoritos.html') {
        loadProductsFromPage(currentPage);
        
        // Forçar atualização do carrossel
        setTimeout(() => {
            updateCarouselWithTopProducts();
        }, 500);
        
        scheduleDailyUpdate();
    }
    initCarousel(); // Sempre inicializar o carrossel
});