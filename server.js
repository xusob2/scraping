const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { Builder, By } = require("selenium-webdriver");
const { parse } = require("json2csv");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public"));  // Servir archivos estáticos

// ✅ Función para hacer scraping con Selenium
async function scrapeData() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        console.log("🔍 Iniciando scraping...");
        await driver.get("https://www.izapatillas.com/page/tienda-de-zapatillas-albacete");

        // ✅ Extraer imágenes
        let imageElements = await driver.findElements(By.css("a.product_img_link img"));
        let images = [];
        for (let img of imageElements) {
            let src = await img.getAttribute("src");
            images.push(src);
        }

        // ✅ Extraer nombres de productos desde `a.product-name`
        let descElements = await driver.findElements(By.css("a.product-name"));
        let descriptions = [];
        for (let desc of descElements) {
            let text = await desc.getAttribute("title");
            if (!text) {
                text = await desc.getText();
            }
            text = text.trim();
            descriptions.push(text.length > 50 ? text.substring(0, 50) + "..." : text);
        }

        // ✅ Extraer precios
        let priceElements = await driver.findElements(By.css("span.price.product-price"));
        let prices = [];
        for (let price of priceElements) {
            let text = await price.getText();
            prices.push(text);
        }

        // ✅ Crear lista de productos (mínimo 30)
        let productos = images.map((img, index) => ({
            imagen: img,
            descripcion: descriptions[index] || "Sin descripción",
            precio: prices[index] || "Precio no disponible"
        })).slice(0, 30);

        // ✅ Guardar en CSV antes de convertir a JSON
        const csvData = parse(productos, { fields: ["imagen", "descripcion", "precio"] });
        fs.writeFileSync("productos.csv", csvData, "utf-8");

        // ✅ Convertir CSV a JSON
        fs.writeFileSync("productos.json", JSON.stringify(productos, null, 4), "utf-8");
        console.log("✅ Scraping completado y guardado en productos.json y productos.csv");

        return productos;
    } catch (error) {
        console.error("❌ Error en el scraping:", error);
        return [];
    } finally {
        await driver.quit();
    }
}

// ✅ Ruta API para obtener productos
app.get("/productos", async (req, res) => {
    let productos = [];

    try {
        let data = fs.readFileSync("productos.json", "utf-8");
        productos = JSON.parse(data);
    } catch (error) {
        console.error("⚠️ No se pudo leer productos.json, ejecutando scraping...");
        productos = await scrapeData();  // Si no hay archivo JSON, hacer scraping
    }

    res.json(productos);
});

// ✅ Iniciar el servidor
app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

    // Ejecutar scraping al iniciar si no hay datos
    if (!fs.existsSync("productos.json")) {
        console.log("📂 No se encontró productos.json, realizando scraping...");
        await scrapeData();
    }
});
