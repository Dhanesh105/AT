// Order Page JavaScript - Cart First Layout

let orderItems = [];
let deliveryFee = 50;
let currentStep = 'cart'; // 'cart' or 'delivery'

// Test that JavaScript is loading
console.log('Order.js loaded successfully!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Order page loaded!');

    // Initialize everything
    initOrderPage();
    loadCartItems();
    initQuickOrder();
    initOrderForm();
    initStepNavigation();
    setMinDeliveryDate();
    updateCartDisplay();

    // Simple click handler for add buttons
    document.body.addEventListener('click', function(e) {
        // Check if clicked element is an add button or inside one
        let button = null;
        if (e.target.classList.contains('add-quick-btn')) {
            button = e.target;
        } else if (e.target.closest('.add-quick-btn')) {
            button = e.target.closest('.add-quick-btn');
        }

        if (button) {
            e.preventDefault();
            e.stopPropagation();

            console.log('Add button clicked!');

            const productItem = button.closest('.quick-add-item');
            if (!productItem) {
                console.error('Product item not found');
                return;
            }

            const productId = productItem.getAttribute('data-product');
            const productPrice = parseInt(productItem.getAttribute('data-price'));
            const productName = productItem.querySelector('h4')?.textContent;
            const productImage = productItem.querySelector('img')?.src;

            if (!productId || !productPrice || !productName) {
                console.error('Missing product data');
                return;
            }

            console.log('Adding product:', { productId, productPrice, productName });

            // Add to order using the centralized function
            addToOrder({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });

            // Button feedback
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Added';
            button.style.background = 'linear-gradient(135deg, #81C784, #66BB6A)';
            button.style.color = 'white';
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
                button.style.color = '';
            }, 2000);

            // Show subtle notification at top
            showNotification(`${productName} added to cart!`, 'success');
        }
    });
});

function initOrderPage() {
    // Check if there are items from cart
    const checkoutCart = localStorage.getItem('checkoutCart');
    if (checkoutCart) {
        orderItems = JSON.parse(checkoutCart);
        localStorage.removeItem('checkoutCart'); // Clear after loading
    }
    
    // Check URL parameters for direct product orders
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    if (productParam && orderItems.length === 0) {
        addProductFromParam(productParam);
    }
    
    updateOrderSummary();
}

function addProductFromParam(productId) {
    const productMap = {
        'putharekulu': { name: 'Sugar Putharekulu', price: 250, image: 'Sugar Putharekulu.png' },
        'kaja': { name: 'Madatha Kaja', price: 180, image: 'kaja.jpg' },
        'thandra': { name: 'Mamadi Thandra', price: 120, image: 'Tandra.png' },
        'pickle': { name: 'Andhra Pickle', price: 150, image: 'pickle.jpg' }
    };
    
    const product = productMap[productId];
    if (product) {
        orderItems.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
}

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0 && orderItems.length === 0) {
        orderItems = [...cart];
    }
}

function initQuickOrder() {
    // Use event delegation for better reliability
    const quickAddGrid = document.querySelector('.quick-add-grid');

    if (!quickAddGrid) {
        console.error('Quick add grid not found!');
        return;
    }

    quickAddGrid.addEventListener('click', function(e) {
        const button = e.target.closest('.add-quick-btn');
        if (!button) return;

        e.preventDefault();

        const productItem = button.closest('.quick-add-item');
        if (!productItem) return;

        const productId = productItem.getAttribute('data-product');
        const productPrice = parseInt(productItem.getAttribute('data-price'));
        const productName = productItem.querySelector('h4').textContent;
        const productImage = productItem.querySelector('img').src;

        addToOrder({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });

        // Button animation
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Added';
        button.style.background = 'linear-gradient(135deg, #81C784, #66BB6A)';
        button.style.color = 'white';
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    });
}

function initStepNavigation() {
    console.log('Initializing step navigation...');
    const proceedBtn = document.getElementById('proceedBtn');
    const backBtn = document.getElementById('backBtn');
    const cartSection = document.querySelector('.cart-section');
    const deliveryForm = document.getElementById('deliveryForm');

    console.log('Navigation elements:', { proceedBtn, backBtn, cartSection, deliveryForm });

    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            console.log('Proceed button clicked');
            if (orderItems.length === 0) {
                showNotification('Please add items to your cart first', 'error');
                return;
            }

            currentStep = 'delivery';
            cartSection.style.display = 'none';
            deliveryForm.style.display = 'block';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            console.log('Back button clicked');
            currentStep = 'cart';
            cartSection.style.display = 'block';
            deliveryForm.style.display = 'none';

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function addToOrder(product) {
    const existingItem = orderItems.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        orderItems.push(product);
    }

    updateCartDisplay();
    updateOrderSummary();
    showNotification(`${product.name} added to cart!`);
}

function removeFromOrder(productId) {
    orderItems = orderItems.filter(item => item.id !== productId);
    updateCartDisplay();
    updateOrderSummary();
    showNotification('Item removed from cart', 'info');
}

function updateOrderQuantity(productId, newQuantity) {
    const item = orderItems.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromOrder(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            updateOrderSummary();
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const emptyCart = document.getElementById('emptyCart');
    const proceedBtn = document.getElementById('proceedBtn');

    if (!cartItems || !cartCount) return;

    // Update cart count
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    // Show/hide empty cart state
    if (orderItems.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (proceedBtn) proceedBtn.disabled = true;
        cartItems.innerHTML = '';
        if (emptyCart) cartItems.appendChild(emptyCart);
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (proceedBtn) proceedBtn.disabled = false;

    // Clear and rebuild cart items
    cartItems.innerHTML = '';

    orderItems.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">₹${item.price}/kg</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateOrderQuantity('${item.id}', ${item.quantity - 1})">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="updateOrderQuantity('${item.id}', ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-item" onclick="removeFromOrder('${item.id}')" title="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

function updateOrderSummary() {
    const orderItemsContainer = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const finalTotalElement = document.getElementById('finalTotal');
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    if (orderItems.length === 0) {
        orderItemsContainer.innerHTML = `
            <div class="empty-cart" id="emptyCart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <p class="empty-cart-subtitle">Add some delicious treats below!</p>
            </div>
        `;
        subtotalElement.textContent = '₹0';
        finalTotalElement.textContent = `₹${deliveryFee}`;
        return;
    }
    
    // Add order items
    orderItems.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'cart-item';
        orderItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price}/kg</p>
                <div class="quantity-controls">
                    <button onclick="updateOrderQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateOrderQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="item-price">
                ₹${item.price * item.quantity}
            </div>
            <button class="remove-item" onclick="removeFromOrder('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
    
    // Update totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;
    
    subtotalElement.textContent = `₹${subtotal}`;
    finalTotalElement.textContent = `₹${total}`;
}

function initOrderForm() {
    const form = document.getElementById('orderForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateOrderForm()) {
            submitOrder();
        }
    });
}

function validateOrderForm() {
    if (orderItems.length === 0) {
        showNotification('Please add items to your order before proceeding', 'error');
        return false;
    }
    
    const requiredFields = [
        'firstName', 'lastName', 'email', 'phone',
        'address', 'city', 'state', 'pincode'
    ];
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.classList.remove('error');
    });
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        }
    });
    
    // Validate email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
        email.classList.add('error');
        isValid = false;
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/;
    if (phone.value && !phoneRegex.test(phone.value.replace(/\s/g, ''))) {
        phone.classList.add('error');
        isValid = false;
    }
    
    // Validate PIN code
    const pincode = document.getElementById('pincode');
    const pincodeRegex = /^[0-9]{6}$/;
    if (pincode.value && !pincodeRegex.test(pincode.value)) {
        pincode.classList.add('error');
        isValid = false;
    }
    
    // Check terms acceptance
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        showNotification('Please accept the terms and conditions', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

function submitOrder() {
    const form = document.getElementById('orderForm');
    const submitBtn = form.querySelector('.place-order-btn');
    const formData = new FormData(form);
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        const orderId = 'AT' + Date.now();
        const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + deliveryFee;
        
        // Create order object
        const order = {
            orderId: orderId,
            items: orderItems,
            customer: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            delivery: {
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode'),
                landmark: formData.get('landmark'),
                date: formData.get('deliveryDate'),
                time: formData.get('deliveryTime'),
                instructions: formData.get('specialInstructions')
            },
            payment: {
                method: formData.get('paymentMethod'),
                subtotal: subtotal,
                deliveryFee: deliveryFee,
                total: total
            },
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Store order locally
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Show success modal
        showOrderSuccess(orderId, total);
        
        // Reset form and order
        form.reset();
        orderItems = [];
        updateOrderSummary();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    }, 3000);
}

function showOrderSuccess(orderId, total) {
    const modal = document.getElementById('orderSuccessModal');
    const orderIdDisplay = document.getElementById('orderIdDisplay');
    const orderTotalDisplay = document.getElementById('orderTotalDisplay');
    
    orderIdDisplay.textContent = orderId;
    orderTotalDisplay.textContent = `₹${total}`;
    
    modal.style.display = 'flex';
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function setMinDeliveryDate() {
    const deliveryDateInput = document.getElementById('deliveryDate');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    const colors = {
        success: 'linear-gradient(135deg, #81C784, #66BB6A)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(135deg, #FF9800, #F57C00)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100%);
        background: ${colors[type]};
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 1001;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        font-weight: 500;
        font-size: 0.9rem;
        max-width: 400px;
        text-align: center;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}
