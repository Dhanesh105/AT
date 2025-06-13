// Order Page JavaScript

let orderItems = [];
let deliveryFee = 50;

document.addEventListener('DOMContentLoaded', function() {
    initOrderPage();
    loadCartItems();
    initQuickOrder();
    initOrderForm();
    setMinDeliveryDate();
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
    const quickProducts = document.querySelectorAll('.quick-product');
    
    quickProducts.forEach(product => {
        const addBtn = product.querySelector('.add-quick-btn');
        addBtn.addEventListener('click', function() {
            const productId = product.getAttribute('data-product');
            const productPrice = parseInt(product.getAttribute('data-price'));
            const productName = product.querySelector('h4').textContent;
            const productImage = product.querySelector('img').src;
            
            addToOrder({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
            
            // Button animation
            this.textContent = 'Added!';
            this.style.background = '#28a745';
            setTimeout(() => {
                this.textContent = 'Add';
                this.style.background = '';
            }, 1500);
        });
    });
}

function addToOrder(product) {
    const existingItem = orderItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        orderItems.push(product);
    }
    
    updateOrderSummary();
    showNotification(`${product.name} added to order!`);
}

function removeFromOrder(productId) {
    orderItems = orderItems.filter(item => item.id !== productId);
    updateOrderSummary();
}

function updateOrderQuantity(productId, newQuantity) {
    const item = orderItems.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromOrder(productId);
        } else {
            item.quantity = newQuantity;
            updateOrderSummary();
        }
    }
}

function updateOrderSummary() {
    const orderItemsContainer = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const finalTotalElement = document.getElementById('finalTotal');
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    if (orderItems.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-order">No items in your order. Add products using the quick order section.</p>';
        subtotalElement.textContent = '₹0';
        finalTotalElement.textContent = `₹${deliveryFee}`;
        return;
    }
    
    // Add order items
    orderItems.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
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
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 350px;
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
    }, 4000);
}
