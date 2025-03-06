

function createDraggableWindows() {
  const linksList = document.querySelector('.links');
  if (!linksList) return;
  const listItems = linksList.querySelectorAll('li');  
  listItems.forEach((item, index) => {
    applyRandomOffset(item, index % 2 === 0);
    makeDraggable(item);
  });
}

// Global registry to track all draggable windows and their momentum
const windowRegistry = {
  windows: [],
  register: function(element, momentumData) {
    // Check if already registered
    const existing = this.windows.find(w => w.element === element);
    if (existing) {
      // Update momentum data if provided
      if (momentumData) {
        existing.momentumData = momentumData;
      }
      return existing;
    }
    
    // Add new window
    const windowData = {
      element: element,
      momentumData: momentumData || {
        velocityX: 0,
        velocityY: 0,
        animationId: null
      }
    };
    this.windows.push(windowData);
    return windowData;
  },
  unregister: function(element) {
    this.windows = this.windows.filter(w => w.element !== element);
  },
  getWindowData: function(element) {
    return this.windows.find(w => w.element === element);
  },
  getAllWindows: function() {
    return this.windows;
  }
};

// Function to apply random horizontal offset to a window
function applyRandomOffset(element, isPositive) {
  // Get the container and its width
  const container = element.parentElement || document.querySelector('.links');
  const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
  const elementWidth = element.getBoundingClientRect().width || 250; // Default width if not yet rendered
  
  // Calculate maximum safe offset to keep element in view
  // Leave at least 50px of the element visible
  const maxOffset = Math.max(20, (containerWidth - elementWidth) / 2 - 100);
  
  // Generate a random offset between 20px and maxOffset
  const randomOffset = Math.floor(Math.random() * (maxOffset - 20)) + 20;
  
  // Apply the offset as a transform, with direction based on isPositive
  element.style.transform = `translateX(${isPositive ? randomOffset : -randomOffset}px)`;
}

// Function to make an element draggable
function makeDraggable(element) {
  // Find the container element
  const bounds = document.querySelector('main');
  
  let isDragging = false;
  let initialPointerX, initialPointerY;
  let initialElementX, initialElementY;
  let initialScrollX, initialScrollY;
  
  // For momentum tracking
  let lastPointerX, lastPointerY;
  let lastPointerTime;
  let velocityX = 0, velocityY = 0;
  let momentumAnimationId = null;
  
  /**
   * Get pointer position from either mouse or touch event
   * @param {Event} e - Mouse or Touch event
   * @returns {Object} - x and y coordinates
   */
  function getPointerPosition(e) {
    // Touch event
    if (e.touches) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
    // Mouse event
    return {
      x: e.clientX,
      y: e.clientY
    };
  }
  
  /**
   * Get current scroll position
   * @returns {Object} - x and y scroll positions
   */
  function getScrollPosition() {
    return {
      x: element.pageXOffset || document.documentElement.scrollLeft,
      y: (element.pageYOffset || document.documentElement.scrollTop) - bounds.offsetTop
    };
  }
  
  /**
   * Set up element for dragging (convert to absolute positioning if needed)
   * @param {Element} element - The element to prepare
   * @param {DOMRect} rect - The element's bounding rectangle
   * @param {Object} scrollPos - Current scroll position
   */
  function prepareElementForDragging(element, rect, scrollPos) {
    if (window.getComputedStyle(element).position !== 'absolute') {
      // Create a placeholder to maintain the layout
      const placeholder = document.createElement('div');
      placeholder.className = 'window-placeholder';
      placeholder.style.height = `${rect.height}px`;
      placeholder.dataset.forWindow = element.id || `window-${Date.now()}`;
      
      // If element doesn't have an ID, assign one
      if (!element.id) {
        element.id = placeholder.dataset.forWindow;
      }
      
      // Insert placeholder before removing element from flow
      element.parentNode.insertBefore(placeholder, element);
      
      // Remove the transform that was adding the random offset
      element.style.transform = '';
      
      // Set absolute position to match current visual position
      element.style.position = 'absolute';
      element.style.left = `${rect.left + scrollPos.x}px`;
      element.style.top = `${rect.top + scrollPos.y}px`;
      element.style.width = `${rect.width}px`;
      
      // Move to bounds container to ensure it can be dragged across the document
      bounds.appendChild(element);
    }
  }
  
  /**
   * Handle the start of a drag operation
   * @param {Event} e - The initiating event (mouse or touch)
   */
  function handleDragStart(e) {
    if (isDragging) return;
    isDragging = true;
    
    // Cancel any ongoing momentum animation
    if (momentumAnimationId !== null) {
      cancelAnimationFrame(momentumAnimationId);
      momentumAnimationId = null;
    }
    
    // Get pointer position
    const pointerPos = getPointerPosition(e);
    initialPointerX = lastPointerX = pointerPos.x;
    initialPointerY = lastPointerY = pointerPos.y;
    lastPointerTime = Date.now();
    
    // Get scroll position
    const scrollPos = getScrollPosition();
    initialScrollX = scrollPos.x;
    initialScrollY = scrollPos.y;
    
    // Get current position in the page
    const rect = element.getBoundingClientRect();
    
    // Prepare element for dragging
    prepareElementForDragging(element, rect, scrollPos);
    
    // Store the initial element position relative to the document
    initialElementX = rect.left + scrollPos.x;
    initialElementY = rect.top + scrollPos.y;
    
    // Add active class for styling
    element.classList.add('dragging');
    
    // Bring the window to the front
    element.parentNode.appendChild(element);
    
    // Prevent default behavior
    e.preventDefault();
    
    // Set up the appropriate move and end handlers based on event type
    if (e.type === 'mousedown') {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    } else if (e.type === 'touchstart') {
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
    }
  }
  
  /**
   * Handle the drag movement
   * @param {Event} e - The move event (mouse or touch)
   */
  function handleDragMove(e) {
    if (!isDragging) return;
    
    // Get current pointer position
    const pointerPos = getPointerPosition(e);
    
    // Get current scroll position
    const scrollPos = getScrollPosition();
    
    // Calculate the pointer movement delta, accounting for scroll
    const deltaX = (pointerPos.x + scrollPos.x) - (initialPointerX + initialScrollX);
    const deltaY = (pointerPos.y + scrollPos.y) - (initialPointerY + initialScrollY);
    
    // Calculate new position
    const newX = initialElementX + deltaX;
    const newY = initialElementY + deltaY;
    
    // Apply the position
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
    
    // Track velocity for momentum
    const now = Date.now();
    const timeDelta = now - lastPointerTime;
    
    if (timeDelta > 0) {
      // Calculate velocity in pixels per millisecond, accounting for scroll
      velocityX = ((pointerPos.x + scrollPos.x) - (lastPointerX + (element.pageXOffset || document.documentElement.scrollLeft))) / timeDelta;
      velocityY = ((pointerPos.y + scrollPos.y) - (lastPointerY + (element.pageYOffset || document.documentElement.scrollTop) - bounds.offsetTop)) / timeDelta;
      
      // Update last position and time
      lastPointerX = pointerPos.x;
      lastPointerY = pointerPos.y;
      lastPointerTime = now;
    }
    
    // Prevent default behavior
    e.preventDefault();
  }
  
  /**
   * Handle the end of a drag operation
   */
  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    element.classList.remove('dragging');
    
    // Apply momentum if velocity is significant
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    if (speed > 0.05) {
      // Apply momentum with decay
      applyMomentum(element, velocityX, velocityY);
    }
    
    // Remove the event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  }
  
  // Add event listeners for both mouse and touch events
  element.addEventListener('mousedown', handleDragStart);
  element.addEventListener('touchstart', handleDragStart, { passive: false });
  
  // Function to apply momentum with decay
  function applyMomentum(element, initialVelocityX, initialVelocityY) {
    // PARAMETER: Initial velocity multiplier - higher values create more dramatic movements
    const velocityMultiplier = 5; // Adjust this to control the overall speed/momentum
    
    // Current velocity
    let currentVelocityX = initialVelocityX * velocityMultiplier;
    let currentVelocityY = initialVelocityY * velocityMultiplier;
    
    // Register or update this window in the registry
    const windowData = windowRegistry.register(element, {
      velocityX: currentVelocityX,
      velocityY: currentVelocityY,
      animationId: null
    });
    
    // PARAMETER: Friction factor (0-1) - lower values create more friction/faster slowdown
    const friction = 0.95; // Adjust between 0.9 (more friction) and 0.99 (less friction)
    
    // PARAMETER: Minimum velocity threshold to continue animation
    const minVelocity = 0.1; // Adjust to control when windows stop moving
    
    // Current position
    const rect = element.getBoundingClientRect();
    const scrollX = element.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = element.pageYOffset || document.documentElement.scrollTop;
    let currentX = rect.left + scrollX;
    let currentY = rect.top + scrollY;
    
    // Animation function
    function animateMomentum() {

      const wallSpringiness = 0.3;

      // Get current scroll position for each frame
      const currentScrollX = element.pageXOffset || document.documentElement.scrollLeft;
      const currentScrollY = element.pageYOffset || document.documentElement.scrollTop;
      
      // Apply velocity to position
      currentX += currentVelocityX;
      currentY += currentVelocityY;
      
      // Apply friction
      currentVelocityX *= friction;
      currentVelocityY *= friction;
      
      // Update velocity in registry
      windowData.momentumData.velocityX = currentVelocityX;
      windowData.momentumData.velocityY = currentVelocityY;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get element dimensions
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      
      // Check for boundary collisions with viewport, but in document coordinates
      // Convert viewport boundaries to document coordinates
      const viewportLeftDoc = currentScrollX;
      const viewportTopDoc = currentScrollY;
      const viewportRightDoc = currentScrollX + viewportWidth;
      const viewportBottomDoc = currentScrollY + viewportHeight;
      
      // Constrain to viewport boundaries (in document coordinates)
      if (currentX < viewportLeftDoc) {
        currentX = viewportLeftDoc;
        currentVelocityX = -currentVelocityX * wallSpringiness; // Bounce with energy loss
        windowData.momentumData.velocityX = currentVelocityX;
      } else if (currentX + elementWidth > viewportRightDoc) {
        currentX = viewportRightDoc - elementWidth;
        currentVelocityX = -currentVelocityX * wallSpringiness; // Bounce with energy loss
        windowData.momentumData.velocityX = currentVelocityX;
      }
      
      if (currentY < viewportTopDoc) {
        currentY = viewportTopDoc;
        currentVelocityY = -currentVelocityY * wallSpringiness; // Bounce with energy loss
        windowData.momentumData.velocityY = currentVelocityY;
      } else if (currentY + elementHeight > viewportBottomDoc) {
        currentY = viewportBottomDoc - elementHeight;
        currentVelocityY = -currentVelocityY * wallSpringiness; // Bounce with energy loss
        windowData.momentumData.velocityY = currentVelocityY;
      }
      
      // Apply the position (in document coordinates)
      element.style.left = `${currentX}px`;
      element.style.top = `${currentY}px`;
      
      // Calculate current speed
      const speed = Math.sqrt(
        currentVelocityX * currentVelocityX + 
        currentVelocityY * currentVelocityY
      );
      
      // Continue animation if speed is above threshold
      if (speed > minVelocity) {
        windowData.momentumData.animationId = requestAnimationFrame(animateMomentum);
      } else {
        windowData.momentumData.animationId = null;
        windowData.momentumData.velocityX = 0;
        windowData.momentumData.velocityY = 0;
      }
    }
    
    // Start animation
    windowData.momentumData.animationId = requestAnimationFrame(animateMomentum);
  }
  
  // Function to start momentum on a window from registry data
  function startMomentumOnWindow(windowData) {
    if (!windowData || !windowData.momentumData) return;
    
    const element = windowData.element;
    const velocityX = windowData.momentumData.velocityX;
    const velocityY = windowData.momentumData.velocityY;
    
    // Only start if there's meaningful velocity
    if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) return;
    
    // Cancel any existing animation
    if (windowData.momentumData.animationId) {
      cancelAnimationFrame(windowData.momentumData.animationId);
    }
    
    // Apply momentum
    applyMomentum(element, velocityX / 15, velocityY / 15); // Reverse the scaling we applied
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createDraggableWindows();
  
  // Register existing windows
  document.querySelectorAll('.draggable-window').forEach(window => {
    windowRegistry.register(window);
  });

  // Track window width for responsive adjustments
  let lastWindowWidth = window.innerWidth;

  // Re-position windows when window is resized
  window.addEventListener('resize', () => {
    const windows = document.querySelectorAll('.draggable-window');
    const container = document.querySelector('.links');
    
    if (windows.length > 0 && container) {
      const containerRect = container.getBoundingClientRect();
      const currentWindowWidth = window.innerWidth;
      
      // Check if window width changed significantly (by more than 100px)
      const widthChangedSignificantly = Math.abs(currentWindowWidth - lastWindowWidth) > 100;
      
      windows.forEach((windowElement, index) => {
        // For absolutely positioned windows (that have been dragged)
        if (window.getComputedStyle(windowElement).position === 'absolute') {
          // Get the window's current position
          const windowRect = windowElement.getBoundingClientRect();
          
          // Check if the window is outside the container bounds
          // or if the viewport width changed significantly
          if (windowRect.right > containerRect.right || 
              windowRect.left < containerRect.left ||
              widthChangedSignificantly) {
            // Find the placeholder for this window
            const placeholder = document.querySelector(`.window-placeholder[data-for-window="${windowElement.id}"]`);
            
            // Reset the window to its original flex position
            windowElement.style.position = 'relative';
            windowElement.style.left = '';
            windowElement.style.top = '';
            windowElement.style.width = '';
            
            // Apply a new random offset, alternating based on index
            applyRandomOffset(windowElement, index % 2 === 0);
            
            // Remove the placeholder if it exists
            if (placeholder) {
              placeholder.parentNode.removeChild(placeholder);
            }
          }
        } 
        // For windows still in the flex layout
        else if (widthChangedSignificantly) {
          // Reapply random offset to ensure it's appropriate for the new viewport width
          applyRandomOffset(windowElement, index % 2 === 0);
        }
      });
      
      // Update the last window width
      lastWindowWidth = currentWindowWidth;
    }
  });
});