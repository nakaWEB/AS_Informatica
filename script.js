    // Aguardar DOM carregar completamente
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Página carregada e script iniciado...');

        // 1. Efeito de scroll na navbar
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // 2. Scroll suave para links de navegação
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // 3. Controle de áudio
        const audio = document.getElementById('meuAudio');
        const botao = document.getElementById('audio-control');
        const iconPlay = document.getElementById('icon-play');
        const iconPause = document.getElementById('icon-pause');

        function toggleAudio() {
            if (audio.paused) {
                audio.play();
                iconPlay.classList.add('hidden');
                iconPause.classList.remove('hidden');
            } else {
                audio.pause();
                iconPlay.classList.remove('hidden');
                iconPause.classList.add('hidden');
            }
        }

        botao.addEventListener('click', toggleAudio);

        audio.addEventListener('ended', function() {
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        });

        // Tenta reproduzir automaticamente
        audio.play().catch(function(error) {
            console.log('Autoplay bloqueado. Aguardando interação do usuário.');
            iconPlay.classList.remove('hidden');
            iconPause.classList.add('hidden');
        });

        // 4. Carrossel de Slides
        console.log('Inicializando carrossel...');
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const carousel = document.getElementById('carousel');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const indicatorsContainer = document.getElementById('indicators');

        console.log(`Total de slides encontrados: ${totalSlides}`);

        if (totalSlides === 0) {
            console.error('Nenhum slide encontrado!');
            return;
        }

        // Criar indicadores
        const indicators = [];
        for (let i = 0; i < totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (i === 0) indicator.classList.add('active');
            indicator.dataset.slide = i;
            indicator.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(indicator);
            indicators.push(indicator);
        }

        // Atualizar carrossel
        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Atualizar indicadores
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
            
            console.log(`Slide atual: ${currentSlide + 1}`);
        }

        // Mover slide
        function moveSlide(direction) {
            currentSlide += direction;
            
            if (currentSlide < 0) {
                currentSlide = totalSlides - 1;
            } else if (currentSlide >= totalSlides) {
                currentSlide = 0;
            }
            
            updateCarousel();
        }

        // Ir para slide específico
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            updateCarousel();
        }

        // Adicionar event listeners aos botões
        prevBtn.addEventListener('click', () => moveSlide(-1));
        nextBtn.addEventListener('click', () => moveSlide(1));

        // Auto-play a cada 10 segundos
        setInterval(() => moveSlide(1), 10000);

        console.log('Carrossel carregado com sucesso!');
    });

    (function(){
    // 90 % de chance
    if(Math.random() * 100 <= 2){
        document.getElementById('imagem-sorteada').style.display = 'block';
    }
})();