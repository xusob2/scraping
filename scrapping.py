import os
import csv
import json
import webbrowser
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# Configurar Selenium con Chrome en modo headless
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")

# Inicializar el navegador
browser = webdriver.Chrome(options=options)

# URL del sitio a scrapear
url = "https://www.izapatillas.com/page/tienda-de-zapatillas-albacete"
browser.get(url)

# Extraer el HTML con BeautifulSoup
soup = BeautifulSoup(browser.page_source, "html.parser")

# Extraer imágenes
images = [a.find('img')['src'] for a in soup.find_all('a', class_="product_img_link") if a.find('img')]

# Extraer descripciones
paragraphs = [p.get_text(strip=True) for p in soup.find_all('p', class_="product-desc")]

# Extraer precios
prices = [price.get_text(strip=True) for price in soup.find_all('span', class_="price product-price")]

# Cerrar el navegador
browser.quit()

# Crear lista de productos
productos = []
for i in range(min(len(images), len(paragraphs), len(prices))):
    productos.append({
        "Imagen": images[i] if images[i].startswith("http") else url + images[i],
        "Descripción": paragraphs[i][:50] + "..." if len(paragraphs[i]) > 50 else paragraphs[i],
        "Precio": prices[i]
    })

# Guardar en CSV
csv_file = "productos.csv"
with open(csv_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Imagen", "Descripción", "Precio"])
    writer.writeheader()
    writer.writerows(productos)

print(f"✅ Datos guardados en {csv_file}")

# Guardar en JSON
json_file = "productos.json"
with open(json_file, "w", encoding="utf-8") as f:
    json.dump(productos, f, indent=4, ensure_ascii=False)

print(f"✅ Datos guardados en {json_file}")

# **Generar un HTML Dinámico con `styles.css` y Google Maps**
html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Productos - Izapatillas</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <div class="banner">
        🏃‍♂️ Bienvenido a Izapatillas - Encuentra las mejores zapatillas deportivas 🏆
    </div>

    <h1>👟 Productos Disponibles</h1>
    <div class="container">
"""

# Agregar productos al HTML
for producto in productos:
    html_content += f"""
        <div class="card">
            <img src="{producto['Imagen']}" alt="Producto">
            <h3>{producto['Descripción']}</h3>
            <p><strong>{producto['Precio']}</strong></p>
        </div>
    """

# Agregar el mapa de Google con la ubicación de la tienda
html_content += """
    </div>

    <div class="mapa">
        <h2>📍 Ubicación de la tienda</h2>
        <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3100.7861824925826!2d-1.8549688542362248!3d38.99737601047153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd665fb8cd57ae37%3A0xd3c5bf1046ca48d7!2sCatedral%20de%20San%20Juan%20Bautista%20de%20Albacete!5e0!3m2!1ses!2ses!4v1739906480962!5m2!1ses!2ses"
            allowfullscreen
            loading="lazy">
        </iframe>
    </div>

</body>
</html>
"""

# Guardar el archivo HTML
html_file = "productos.html"
with open(html_file, "w", encoding="utf-8") as f:
    f.write(html_content)

# Abrir automáticamente el archivo en el navegador
webbrowser.open("file://" + os.path.abspath(html_file))

print("✅ Página generada: productos.html (se abrirá en el navegador)")
