// Products Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initProductFilters();
    initShoppingCart();
    initProductActions();
});

// Shopping Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function initProductFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            
            productItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease-in-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

function initShoppingCart() {
    updateCartDisplay();
    
    const cartToggle = document.getElementById('cartToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.querySelector('.close-cart');

    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target)) {
            cartSidebar.classList.remove('active');
        }
    });
}

function initProductActions() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const buyNowBtns = document.querySelectorAll('.buy-now-btn');

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const productPrice = parseInt(this.getAttribute('data-price'));
            const productElement = this.closest('.product-item');
            const productTitle = productElement.querySelector('h3').textContent;
            const productImage = productElement.querySelector('img').src;

            addToCart({
                id: productName,
                name: productTitle,
                price: productPrice,
                image: productImage,
                quantity: 1
            });

            // Button animation
            const originalText = this.textContent;
            this.textContent = 'Added!';
            this.style.background = '#28a745';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
                this.disabled = false;
            }, 1500);
        });
    });

    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            // Redirect to order page with product info
            window.location.href = `order.html?product=${productName}`;
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price}/kg</p>
                        <div class="quantity-controls">
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        ₹${item.price * item.quantity}
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = total;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Quick View Modal (placeholder for future implementation)
function showQuickView(productId) {
    // This would show a modal with product details
    console.log('Quick view for:', productId);
}

// Checkout function
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Store cart data and redirect to order page
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = 'order.html';
}

// Add checkout event listener
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});

// CSS Animation keyframes (added via JavaScript)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
