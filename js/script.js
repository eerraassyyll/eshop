let products = JSON.parse(localStorage.getItem('era_products')) || [
    { id: 1, name: "Minimal Watch", price: 120, oldPrice: 150, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "accessories", color: "black", size: "M", rating: 4.8, discount: 20 },
    { id: 2, name: "Era Sneakers", price: 85, oldPrice: 120, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category: "clothing", color: "white", size: "L", rating: 4.6, discount: 29 },
    { id: 3, name: "Classic Light Coat", price: 165, oldPrice: 220, img: "https://images.unsplash.com/photo-1539533057392-a7a3b816bae7?w=500", category: "clothing", color: "brown", size: "M", rating: 4.9, discount: 25 },
    { id: 4, name: "Men's T-Shirt", price: 20, oldPrice: 35, img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", category: "clothing", color: "blue", size: "M", rating: 4.9, discount: 43 },
    { id: 5, name: "Women's T-Shirt", price: 25, oldPrice: 40, img: "https://images.unsplash.com/photo-1574471618876-edb38f4ba727?w=500", category: "clothing", color: "black", size: "S", rating: 4.9, discount: 38 },
    { id: 6, name: "Casual Shirt", price: 45, oldPrice: 65, img: "https://images.unsplash.com/photo-1617622417736-b91e48f42d8e?w=500", category: "clothing", color: "white", size: "L", rating: 4.9, discount: 31 },
    { id: 7, name: "Denim Jacket", price: 95, oldPrice: 140, img: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500", category: "clothing", color: "blue", size: "M", rating: 4.8, discount: 32 },
    { id: 8, name: "Green Sweater", price: 55, oldPrice: 75, img: "https://images.unsplash.com/photo-1556821552-5f1f4e10916b?w=500", category: "clothing", color: "brown", size: "L", rating: 4.9, discount: 27 }
];

let activeFilters = {
    search: '',
    categories: [],
    colors: [],
    sizes: [],
    priceMin: 0,
    priceMax: Infinity
};

let cart = JSON.parse(localStorage.getItem('era_cart')) || [];

const saveData = () => {
    localStorage.setItem('era_products', JSON.stringify(products));
    localStorage.setItem('era_cart', JSON.stringify(cart));
    updateCartCount();
};

const updateCartCount = () => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
};

const filterAndSortProducts = () => {
    let filtered = products.filter(p => {
        if (activeFilters.search && !p.name.toLowerCase().includes(activeFilters.search.toLowerCase())) {
            return false;
        }
        
        if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(p.category)) {
            return false;
        }
        
        if (activeFilters.colors.length > 0 && !activeFilters.colors.includes(p.color)) {
            return false;
        }
        
        if (activeFilters.sizes.length > 0 && !activeFilters.sizes.includes(p.size)) {
            return false;
        }
        
        if (p.price < activeFilters.priceMin || p.price > activeFilters.priceMax) {
            return false;
        }
        
        return true;
    });
    
    const sort = document.getElementById('sort')?.value || 'newest';
    switch(sort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        default:
            filtered.sort((a, b) => b.id - a.id);
    }
    
    return filtered;
};

const updateActiveFilters = () => {
    const container = document.getElementById('active-filters');
    if (!container) return;
    
    let tags = [];
    
    if (activeFilters.search) {
        tags.push({ label: activeFilters.search, key: 'search' });
    }
    
    activeFilters.categories.forEach(cat => {
        tags.push({ label: cat, key: `cat-${cat}` });
    });
    
    activeFilters.colors.forEach(col => {
        tags.push({ label: col, key: `color-${col}` });
    });
    
    activeFilters.sizes.forEach(size => {
        tags.push({ label: size, key: `size-${size}` });
    });
    
    if (activeFilters.priceMin > 0 || activeFilters.priceMax < Infinity) {
        const priceLabel = `₸${activeFilters.priceMin} - ₸${activeFilters.priceMax === Infinity ? '∞' : activeFilters.priceMax}`;
        tags.push({ label: priceLabel, key: 'price' });
    }
    
    container.innerHTML = tags.map(tag => `
        <div class="filter-tag">
            ${tag.label}
            <button onclick="clearFilter('${tag.key}')">✕</button>
        </div>
    `).join('');
};

window.clearFilter = (key) => {
    if (key === 'search') {
        activeFilters.search = '';
        const searchEl = document.getElementById('search');
        if (searchEl) searchEl.value = '';
    } else if (key === 'price') {
        activeFilters.priceMin = 0;
        activeFilters.priceMax = Infinity;
        const minEl = document.getElementById('price-min');
        const maxEl = document.getElementById('price-max');
        if (minEl) minEl.value = '';
        if (maxEl) maxEl.value = '';
    } else if (key.startsWith('cat-')) {
        const cat = key.replace('cat-', '');
        activeFilters.categories = activeFilters.categories.filter(c => c !== cat);
        const el = document.getElementById(`cat-${cat}`);
        if (el) el.checked = false;
    } else if (key.startsWith('color-')) {
        const col = key.replace('color-', '');
        activeFilters.colors = activeFilters.colors.filter(c => c !== col);
        const el = document.getElementById(`color-${col}`);
        if (el) el.checked = false;
    } else if (key.startsWith('size-')) {
        const size = key.replace('size-', '');
        activeFilters.sizes = activeFilters.sizes.filter(s => s !== size);
        const el = document.getElementById(`size-${size}`);
        if (el) el.checked = false;
    }
    
    renderProducts();
    updateActiveFilters();
};

const initFilterHandlers = () => {
    const searchEl = document.getElementById('search');
    if (searchEl) {
        searchEl.addEventListener('input', (e) => {
            activeFilters.search = e.target.value;
            renderProducts();
            updateActiveFilters();
        });
    }
    
    const sortEl = document.getElementById('sort');
    if (sortEl) {
        sortEl.addEventListener('change', () => {
            renderProducts();
        });
    }
    
    document.querySelectorAll('.category-filter').forEach(el => {
        el.addEventListener('change', (e) => {
            const value = e.target.value;
            if (e.target.checked) {
                if (!activeFilters.categories.includes(value)) {
                    activeFilters.categories.push(value);
                }
            } else {
                activeFilters.categories = activeFilters.categories.filter(c => c !== value);
            }
            renderProducts();
            updateActiveFilters();
        });
    });
    
    document.querySelectorAll('.color-filter').forEach(el => {
        el.addEventListener('change', (e) => {
            const value = e.target.value;
            if (e.target.checked) {
                if (!activeFilters.colors.includes(value)) {
                    activeFilters.colors.push(value);
                }
            } else {
                activeFilters.colors = activeFilters.colors.filter(c => c !== value);
            }
            renderProducts();
            updateActiveFilters();
        });
    });
    
    document.querySelectorAll('.size-filter').forEach(el => {
        el.addEventListener('change', (e) => {
            const value = e.target.value;
            if (e.target.checked) {
                if (!activeFilters.sizes.includes(value)) {
                    activeFilters.sizes.push(value);
                }
            } else {
                activeFilters.sizes = activeFilters.sizes.filter(s => s !== value);
            }
            renderProducts();
            updateActiveFilters();
        });
    });
    
    const priceMinEl = document.getElementById('price-min');
    const priceMaxEl = document.getElementById('price-max');
    
    if (priceMinEl) {
        priceMinEl.addEventListener('change', (e) => {
            activeFilters.priceMin = e.target.value ? parseInt(e.target.value) : 0;
            renderProducts();
            updateActiveFilters();
        });
    }
    
    if (priceMaxEl) {
        priceMaxEl.addEventListener('change', (e) => {
            activeFilters.priceMax = e.target.value ? parseInt(e.target.value) : Infinity;
            renderProducts();
            updateActiveFilters();
        });
    }
};

const renderProducts = () => {
    const grid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    if (!grid) return;
    
    let filtered = filterAndSortProducts();
    
    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    grid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div style="position: relative;">
                <img src="${p.img}" alt="${p.name}">
                ${p.discount ? `<div class="product-discount" style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: white; padding: 4px 8px; border-radius: 4px;">${p.discount}% OFF</div>` : ''}
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="product-rating">${p.rating ? '★'.repeat(Math.floor(p.rating)) + ' ' + p.rating : 'Нет рейтинга'}</div>
                <div class="product-prices">
                    <span class="product-price">₸${p.price}</span>
                    ${p.oldPrice ? `<span class="product-old-price">₸${p.oldPrice}</span>` : ''}
                </div>
                <button class="btn" onclick="addToCart(${p.id})">В корзину</button>
            </div>
        </div>
    `).join('');
};

window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    const inCart = cart.find(item => item.id === id);
    
    if (inCart) {
        inCart.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveData();
    alert('Товар добавлен!');
};

const modal = document.getElementById('cart-modal');
const openBtn = document.getElementById('open-cart');
const closeBtn = document.getElementById('close-cart');

if (modal) {
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Ваша корзина</h2>
            <div id="cart-items"></div>
            <div class="cart-total">Итого: <span id="total-price">0</span> ₸</div>
            <button class="btn" id="checkout-btn">Оформить заказ</button>
            <button class="btn-close" id="close-cart">Закрыть</button>
        </div>
    `;
}

if (openBtn) {
    openBtn.onclick = () => {
        modal.classList.add('active');
        renderCart();
    };
}

const renderCart = () => {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('total-price');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Корзина пуста</p>';
        totalEl.innerText = '0';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong><br>
                <small>x${item.quantity} × ₸${item.price}</small>
            </div>
            <span>₸${item.price * item.quantity}</span>
            <button onclick="removeFromCart(${item.id})">✖</button>
        </div>
    `).join('');
    
    totalEl.innerText = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
};

setTimeout(() => {
    const closeBtn = document.getElementById('close-cart');
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
    }
}, 100);

window.removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveData();
    renderCart();
};

const adminForm = document.getElementById('admin-form');
if (adminForm) {
    adminForm.onsubmit = (e) => {
        e.preventDefault();
        const newP = {
            id: Date.now(),
            name: document.getElementById('p-name').value,
            price: Number(document.getElementById('p-price').value),
            oldPrice: document.getElementById('p-old-price')?.value ? Number(document.getElementById('p-old-price').value) : null,
            img: document.getElementById('p-img').value || "https://via.placeholder.com/200",
            category: document.getElementById('p-category')?.value || 'accessories',
            color: document.getElementById('p-color')?.value || 'black',
            size: document.getElementById('p-size')?.value || 'M',
            rating: Number(document.getElementById('p-rating')?.value || 4.8),
            discount: document.getElementById('p-old-price')?.value ? Math.round(((Number(document.getElementById('p-old-price').value) - Number(document.getElementById('p-price').value)) / Number(document.getElementById('p-old-price').value)) * 100) : 0
        };
        products.push(newP);
        saveData();
        alert('Товар добавлен в базу!');
        adminForm.reset();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    initFilterHandlers();
    updateActiveFilters();
});