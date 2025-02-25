// Función global para desplazamiento suave
function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 50, // Ajusta el desplazamiento para evitar que se tape la barra de navegación
            behavior: "smooth"          // Desplazamiento suave
        });
    } else {
        console.error(`La sección con ID "${id}" no existe.`);
    }
}

// Cargar productos al iniciar la página
async function loadProducts() {
    const response = await fetch("/productos");
    const productos = await response.json();
    const container = document.getElementById("productos");
    productos.forEach((producto, index) => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${producto.imagen}" alt="Producto">
            <h3>${producto.descripcion}</h3>
            <p><strong>${producto.precio}</strong></p>
        `;
        // Agregar la animación con retraso para cada tarjeta
        setTimeout(() => {
            container.appendChild(card);
        }, index * 100); // Aplica la animación con un retraso de 100ms por tarjeta
    });
}

// Cargar noticias al iniciar la página
async function loadNews() {
    const rssUrl = "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada";
    const atomUrl = "https://www.abc.es/rss/atom/espana/madrid/";

    const rssContainer = document.querySelectorAll(".news-container")[0];
    const atomContainer = document.querySelectorAll(".news-container")[1];

    rssContainer.innerHTML = "<p>⏳ Cargando noticias de tecnología...</p>";
    atomContainer.innerHTML = "<p>⏳ Cargando noticias de España...</p>";

    async function fetchFeed(url) {
        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            return new window.DOMParser().parseFromString(data.contents, "text/xml");
        } catch (error) {
            console.error("❌ Error cargando noticias:", error);
            return null;
        }
    }

    const rssFeed = await fetchFeed(rssUrl);
    const atomFeed = await fetchFeed(atomUrl);

    function addNewsItems(feed, container, limit = 6) {
        if (!feed) {
            container.innerHTML = "<p>⚠️ No se pudieron cargar las noticias.</p>";
            return;
        }

        container.innerHTML = ""; 
        const items = feed.querySelectorAll("item, entry");

        for (let i = 0; i < Math.min(items.length, limit); i++) {
            const title = items[i].querySelector("title")?.textContent || "Sin título";
            const link = items[i].querySelector("link")?.textContent || "#";
            const summary = items[i].querySelector("description, summary")?.textContent || "Sin descripción";

            const newsCard = document.createElement("div");
            newsCard.classList.add("news-card");

            newsCard.innerHTML = `
                <h3><a href="${link}" target="_blank">${title}</a></h3>
                <p>${summary.substring(0, 100)}...</p>
            `;

            setTimeout(() => {
                container.appendChild(newsCard);
            }, i * 500);
        }
    }

    addNewsItems(rssFeed, rssContainer);
    addNewsItems(atomFeed, atomContainer);
}

// Iniciar funciones al cargar la página
window.onload = () => {
    loadProducts();
    loadNews();
};