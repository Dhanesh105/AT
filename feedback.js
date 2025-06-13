// Feedback Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initRatingStars();
    initFeedbackForm();
    initFAQ();
});

function initRatingStars() {
    const stars = document.querySelectorAll('.rating-stars i');
    const ratingInput = document.getElementById('productRating');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', function() {
            highlightStars(index + 1);
        });

        star.addEventListener('mouseleave', function() {
            highlightStars(selectedRating);
        });

        star.addEventListener('click', function() {
            selectedRating = index + 1;
            ratingInput.value = selectedRating;
            highlightStars(selectedRating);
            
            // Add animation
            star.style.transform = 'scale(1.2)';
            setTimeout(() => {
                star.style.transform = 'scale(1)';
            }, 200);
        });
    });

    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
}

function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitFeedback();
        }
    });
}

function validateForm() {
    const requiredFields = [
        'customerName',
        'customerEmail',
        'productRating',
        'feedbackCategory',
        'feedbackMessage'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        
        // Remove previous error styling
        field.classList.remove('error');
        
        if (!value) {
            field.classList.add('error');
            isValid = false;
        }
    });
    
    // Validate email format
    const email = document.getElementById('customerEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
        email.classList.add('error');
        isValid = false;
        showNotification('Please enter a valid email address', 'error');
    }
    
    // Validate rating
    const rating = document.getElementById('productRating');
    if (!rating.value || rating.value < 1 || rating.value > 5) {
        showNotification('Please select a rating', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

function submitFeedback() {
    const form = document.getElementById('feedbackForm');
    const submitBtn = form.querySelector('.submit-btn');
    const formData = new FormData(form);
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Create feedback object
        const feedback = {
            name: formData.get('customerName'),
            email: formData.get('customerEmail'),
            phone: formData.get('customerPhone'),
            orderNumber: formData.get('orderNumber'),
            rating: formData.get('productRating'),
            category: formData.get('feedbackCategory'),
            message: formData.get('feedbackMessage'),
            improvements: formData.get('improvements'),
            recommend: formData.get('recommendUs') === 'on',
            newsletter: formData.get('newsletter') === 'on',
            timestamp: new Date().toISOString()
        };
        
        // Store feedback locally (in a real app, this would be sent to a server)
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        feedbacks.push(feedback);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
        
        // Show success message
        showNotification('Thank you for your feedback! We appreciate your input.', 'success');
        
        // Reset form
        form.reset();
        document.getElementById('productRating').value = '';
        document.querySelectorAll('.rating-stars i').forEach(star => {
            star.classList.remove('active');
        });
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    }, 2000); // Simulate network delay
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        question.addEventListener('click', function() {
            const isOpen = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-answer').style.maxHeight = '0';
                faq.querySelector('.faq-question i').style.transform = 'rotate(0deg)';
            });
            
            // Open clicked item if it wasn't already open
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
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
        max-width: 300px;
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

// Form field animations
document.addEventListener('DOMContentLoaded', function() {
    const formInputs = document.querySelectorAll('.feedback-form input, .feedback-form textarea, .feedback-form select');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if field has value on page load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
});

// Character counter for textarea
document.addEventListener('DOMContentLoaded', function() {
    const textareas = document.querySelectorAll('textarea');
    
    textareas.forEach(textarea => {
        const maxLength = 500; // Set max length
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.textContent = `0/${maxLength}`;
        textarea.parentElement.appendChild(counter);
        
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            counter.textContent = `${length}/${maxLength}`;
            
            if (length > maxLength * 0.9) {
                counter.style.color = '#dc3545';
            } else {
                counter.style.color = '#666';
            }
        });
    });
});
