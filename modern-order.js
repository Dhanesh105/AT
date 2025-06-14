// Modern Order Page JavaScript
class ModernOrderPage {
    constructor() {
        this.orderItems = [];
        this.deliveryFee = 50;
        this.currentStep = 'cart';
        this.init();
    }

    init() {
        console.log('Modern Order Page initialized');
        this.loadCartItems();
        this.loadCheckoutCart();
        this.loadUrlParams();
        this.bindEvents();
        this.updateDisplay();
        this.initMobileMenu();
        this.setMinDeliveryDate();
    }

    loadCartItems() {
        // Load from regular cart storage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length > 0 && this.orderItems.length === 0) {
            this.orderItems = [...cart];
            console.log('Loaded cart items:', this.orderItems);
        }
    }

    loadCheckoutCart() {
        // Load from checkout cart (when coming from products page checkout)
        const checkoutCart = localStorage.getItem('checkoutCart');
        if (checkoutCart) {
            this.orderItems = JSON.parse(checkoutCart);
            localStorage.removeItem('checkoutCart'); // Clear after loading
            console.log('Loaded checkout cart:', this.orderItems);
        }
    }

    loadUrlParams() {
        // Check URL parameters for direct product orders
        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');
        if (productParam && this.orderItems.length === 0) {
            this.addProductFromParam(productParam);
        }
    }

    addProductFromParam(productId) {
        const productMap = {
            'putharekulu': { name: 'Sugar Putharekulu', price: 250, image: 'Sugar Putharekulu.png' },
            'ghee-putharekulu': { name: 'Ghee Putharekulu', price: 300, image: 'Sugar Putharekulu.png' },
            'kaja': { name: 'Madatha Kaja', price: 180, image: 'kaja.jpg' },
            'thandra': { name: 'Mamadi Thandra', price: 120, image: 'Tandra.png' },
            'pickle': { name: 'Andhra Mixed Pickle', price: 150, image: 'pickle.jpg' },
            'mango-pickle': { name: 'Andhra Mango Pickle', price: 180, image: 'pickle.jpg' }
        };

        const product = productMap[productId];
        if (product) {
            this.orderItems.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
            console.log('Added product from URL:', product);
        }
    }

    setMinDeliveryDate() {
        const deliveryDateInput = document.getElementById('deliveryDate');
        if (deliveryDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const minDate = tomorrow.toISOString().split('T')[0];
            deliveryDateInput.setAttribute('min', minDate);
            deliveryDateInput.value = minDate;
        }
    }

    bindEvents() {
        // Single event listener for all add buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-btn')) {
                e.preventDefault();
                this.handleAddToCart(e.target.closest('.add-btn'));
            }
            
            if (e.target.closest('#proceedBtn')) {
                e.preventDefault();
                this.proceedToCheckout();
            }
            
            if (e.target.closest('#backBtn')) {
                e.preventDefault();
                this.backToCart();
            }

            if (e.target.closest('#cancelOrderBtn')) {
                e.preventDefault();
                this.backToCart();
            }

            if (e.target.closest('.close-modal')) {
                e.preventDefault();
                this.closeModal();
            }
        });

        // Quantity controls
        document.addEventListener('click', (e) => {
            if (e.target.closest('.qty-increase')) {
                const productId = e.target.closest('.cart-item').dataset.productId;
                this.updateQuantity(productId, 1);
            }
            
            if (e.target.closest('.qty-decrease')) {
                const productId = e.target.closest('.cart-item').dataset.productId;
                this.updateQuantity(productId, -1);
            }
            
            if (e.target.closest('.remove-item')) {
                const productId = e.target.closest('.cart-item').dataset.productId;
                this.removeItem(productId);
            }
        });

        // Form submission
        const deliveryForm = document.getElementById('deliveryFormContent');
        if (deliveryForm) {
            deliveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderSubmission(e.target);
            });
        }

        // Modal click outside to close
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('orderSuccessModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    handleAddToCart(button) {
        const productCard = button.closest('.product-card');
        const productId = productCard.dataset.product;
        const productPrice = parseInt(productCard.dataset.price);
        const productName = productCard.querySelector('h4').textContent;
        const productImage = productCard.querySelector('img').src;

        // Add to cart
        this.addToCart({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
        });

        // Button feedback
        this.showButtonFeedback(button);
        
        // Show notification
        this.showNotification(`${productName} added to cart!`, 'success');
    }

    addToCart(product) {
        const existingItem = this.orderItems.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.orderItems.push({ ...product, quantity: 1 });
        }

        // Sync with localStorage
        this.syncCartToStorage();
        this.updateDisplay();
    }

    syncCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.orderItems));
    }

    updateQuantity(productId, change) {
        const item = this.orderItems.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.syncCartToStorage();
                this.updateDisplay();
            }
        }
    }

    removeItem(productId) {
        this.orderItems = this.orderItems.filter(item => item.id !== productId);
        this.syncCartToStorage();
        this.updateDisplay();
        this.showNotification('Item removed from cart', 'info');
    }

    updateDisplay() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateOrderSummary();
        this.updateProgressBar();
    }

    updateCartCount() {
        const totalItems = this.orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        }
    }

    updateCartItems() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const proceedBtn = document.getElementById('proceedBtn');

        if (this.orderItems.length === 0) {
            if (emptyCart) emptyCart.style.display = 'block';
            if (proceedBtn) proceedBtn.disabled = true;
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (proceedBtn) proceedBtn.disabled = false;

        // Build cart items HTML
        const cartHTML = this.orderItems.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">₹${item.price}/kg</div>
                </div>
                <div class="item-controls">
                    <button class="qty-btn qty-decrease">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn qty-increase">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        cartItems.innerHTML = cartHTML;
    }

    updateOrderSummary() {
        const subtotal = this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + this.deliveryFee;

        const subtotalElement = document.getElementById('subtotal');
        const finalTotalElement = document.getElementById('finalTotal');

        if (subtotalElement) subtotalElement.textContent = `₹${subtotal}`;
        if (finalTotalElement) finalTotalElement.textContent = `₹${total}`;
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = this.orderItems.length > 0 ? 50 : 0;
            progressFill.style.width = `${progress}%`;
        }
    }

    showButtonFeedback(button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> <span>Added</span>';
        button.style.background = 'linear-gradient(135deg, #81C784, #66BB6A)';
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `modern-notification ${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #81C784, #66BB6A)',
            error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            info: 'linear-gradient(135deg, #FF9800, #F57C00)'
        };

        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100%);
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 25px;
            z-index: 1001;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            font-weight: 600;
            font-size: 0.95rem;
            max-width: 400px;
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

    proceedToCheckout() {
        if (this.orderItems.length === 0) {
            this.showNotification('Please add items to your cart first', 'error');
            return;
        }

        const mainContentArea = document.querySelector('.main-content-area');
        const orderSummarySidebar = document.querySelector('.order-summary-sidebar');
        const deliveryForm = document.getElementById('deliveryForm');

        if (mainContentArea) mainContentArea.style.display = 'none';
        if (orderSummarySidebar) orderSummarySidebar.style.display = 'none';
        if (deliveryForm) deliveryForm.style.display = 'block';

        this.currentStep = 'delivery';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    backToCart() {
        const mainContentArea = document.querySelector('.main-content-area');
        const orderSummarySidebar = document.querySelector('.order-summary-sidebar');
        const deliveryForm = document.getElementById('deliveryForm');

        if (mainContentArea) mainContentArea.style.display = 'block';
        if (orderSummarySidebar) orderSummarySidebar.style.display = 'block';
        if (deliveryForm) deliveryForm.style.display = 'none';

        this.currentStep = 'cart';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleOrderSubmission(form) {
        const formData = new FormData(form);
        const orderData = {
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            customerEmail: formData.get('customerEmail'),
            deliveryAddress: formData.get('deliveryAddress'),
            deliveryCity: formData.get('deliveryCity'),
            deliveryPincode: formData.get('deliveryPincode'),
            deliveryTime: formData.get('deliveryTime'),
            specialInstructions: formData.get('specialInstructions'),
            items: this.orderItems,
            subtotal: this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            deliveryFee: this.deliveryFee,
            total: this.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + this.deliveryFee
        };

        // Validate required fields
        if (!orderData.customerName || !orderData.customerPhone || !orderData.deliveryAddress || !orderData.deliveryCity || !orderData.deliveryPincode) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Validate phone number
        if (!/^[0-9]{10}$/.test(orderData.customerPhone.replace(/\D/g, ''))) {
            this.showNotification('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        // Validate pincode
        if (!/^[0-9]{6}$/.test(orderData.deliveryPincode)) {
            this.showNotification('Please enter a valid 6-digit pincode', 'error');
            return;
        }

        this.placeOrder(orderData);
    }

    placeOrder(orderData) {
        // Generate order ID
        const orderId = 'AT' + Date.now().toString().slice(-6);

        // Show loading state
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        const originalHTML = placeOrderBtn.innerHTML;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
        placeOrderBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset button
            placeOrderBtn.innerHTML = originalHTML;
            placeOrderBtn.disabled = false;

            // Show success modal
            this.showOrderSuccessModal(orderId, orderData.total);

            // Clear cart
            this.orderItems = [];
            this.updateDisplay();

            // Reset form
            document.getElementById('deliveryFormContent').reset();

            // Go back to cart view
            this.backToCart();

            console.log('Order placed:', { orderId, ...orderData });
        }, 2000);
    }

    showOrderSuccessModal(orderId, total) {
        const modal = document.getElementById('orderSuccessModal');
        const orderIdDisplay = document.getElementById('orderIdDisplay');
        const orderTotalDisplay = document.getElementById('orderTotalDisplay');

        if (orderIdDisplay) orderIdDisplay.textContent = orderId;
        if (orderTotalDisplay) orderTotalDisplay.textContent = `₹${total}`;

        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('orderSuccessModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNavbar = document.getElementById('mobileNavbar');

        if (mobileMenuToggle && mobileNavbar) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileNavbar.classList.toggle('active');

                // Toggle hamburger icon
                const icon = mobileMenuToggle.querySelector('i');
                if (mobileNavbar.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuToggle.contains(e.target) && !mobileNavbar.contains(e.target)) {
                    mobileNavbar.classList.remove('active');
                    const icon = mobileMenuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });

            // Close mobile menu when clicking on a link
            const mobileNavLinks = mobileNavbar.querySelectorAll('.nav-link');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileNavbar.classList.remove('active');
                    const icon = mobileMenuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                });
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernOrderPage();
});
