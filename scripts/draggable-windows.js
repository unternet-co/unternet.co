

function createDraggableWindows() {
  const container = document.querySelector('main');
  const linksList = document.querySelector('.links');
  const heroSection = document.querySelector('.hero-image');
  const aboutSection = document.querySelector('.about');
  
  if (!linksList) return;
  
  // Get all list items
  const listItems = linksList.querySelectorAll('li');
  
  // Create a container for the draggable windows
  const windowsContainer = document.createElement('div');
  windowsContainer.className = 'draggable-windows-container';
  
  // Insert the container after the about section
  if (aboutSection) {
    aboutSection.after(windowsContainer);
  } else {
    container.appendChild(windowsContainer);
  }
  
  // Remove the original list
  linksList.remove();
  
  // Create draggable windows for each list item
  listItems.forEach((item, index) => {
    // Create window container
    const windowElement = document.createElement('div');
    windowElement.className = 'draggable-window';
    
    // Create window header
    const windowHeader = document.createElement('div');
    windowHeader.className = 'window-header';
    
    // Create window content
    const windowContent = document.createElement('div');
    windowContent.className = 'window-content';
    windowContent.innerHTML = item.innerHTML;
    
    // Append header and content to window
    windowElement.appendChild(windowHeader);
    windowElement.appendChild(windowContent);
    
    // Apply random horizontal offset, alternating direction based on index
    applyRandomOffset(windowElement, index % 2 === 0);
    
    // Make the window draggable
    makeDraggable(windowElement, windowsContainer);
    
    // Add to container
    windowsContainer.appendChild(windowElement);
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
  const container = element.parentElement || document.querySelector('.draggable-windows-container');
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
function makeDraggable(element, container) {
  // Find the header element
  const header = element.querySelector('.window-header');
  const bounds = document.querySelector('main');
  
  if (!header) return;
  
  let isDragging = false;
  let initialMouseX, initialMouseY;
  let initialElementX, initialElementY;
  let initialScrollX, initialScrollY;
  
  // For momentum tracking
  let lastMouseX, lastMouseY;
  let lastMouseTime;
  let velocityX = 0, velocityY = 0;
  let momentumAnimationId = null;
  
  // Mouse down event on the header
  header.addEventListener('mousedown', (e) => {
    if (isDragging) return;
    isDragging = true;
    
    // Cancel any ongoing momentum animation
    if (momentumAnimationId !== null) {
      cancelAnimationFrame(momentumAnimationId);
      momentumAnimationId = null;
    }
    
    // Store the initial mouse position
    initialMouseX = lastMouseX = e.clientX;
    initialMouseY = lastMouseY = e.clientY;
    lastMouseTime = Date.now();
    
    // Store initial scroll position
    initialScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    initialScrollY = (window.pageYOffset || document.documentElement.scrollTop) - bounds.offsetTop;
    
    // Get current position in the page
    const rect = element.getBoundingClientRect();
    
    // Convert to absolute positioning if not already
    if (window.getComputedStyle(element).position !== 'absolute') {
      // Create a placeholder to maintain the layout
      const placeholder = document.createElement('div');
      placeholder.className = 'window-placeholder';
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.margin = window.getComputedStyle(element).margin;
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
      element.style.left = `${rect.left + initialScrollX}px`;
      element.style.top = `${rect.top + initialScrollY}px`;
      element.style.width = `${rect.width}px`;
      
      // Move to body to ensure it can be dragged across the document
      bounds.appendChild(element);
    }
    
    // Store the initial element position relative to the document
    initialElementX = rect.left + initialScrollX;
    initialElementY = rect.top + initialScrollY;
    
    // Add active class for styling
    element.classList.add('dragging');
    
    // Bring the window to the front
    bringToFront(element);
    
    // Prevent default behavior
    e.preventDefault();
    
    // Mouse move event on the document
    const mouseMoveHandler = (e) => {
      if (!isDragging) return;
      
      // Get current scroll position
      const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const currentScrollY = (window.pageYOffset || document.documentElement.scrollTop) - bounds.offsetTop;
      
      // Calculate the mouse movement delta, accounting for scroll
      const deltaX = (e.clientX + currentScrollX) - (initialMouseX + initialScrollX);
      const deltaY = (e.clientY + currentScrollY) - (initialMouseY + initialScrollY);
      
      // Calculate new position
      let newX = initialElementX + deltaX;
      let newY = initialElementY + deltaY;
      
      // Apply the position
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
      
      // Track velocity for momentum
      const now = Date.now();
      const timeDelta = now - lastMouseTime;
      
      if (timeDelta > 0) {
        // Calculate velocity in pixels per millisecond, accounting for scroll
        velocityX = ((e.clientX + currentScrollX) - (lastMouseX + (window.pageXOffset || document.documentElement.scrollLeft))) / timeDelta;
        velocityY = ((e.clientY + currentScrollY) - (lastMouseY + (window.pageYOffset || document.documentElement.scrollTop) - bounds.offsetTop)) / timeDelta;
        
        // Update last position and time
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMouseTime = now;
      }
      
      // Prevent default behavior
      e.preventDefault();
    };
    
    // Mouse up event on the document
    const mouseUpHandler = () => {
      isDragging = false;
      element.classList.remove('dragging');
      
      // Apply momentum if velocity is significant
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      if (speed > 0.05) {
        // Apply momentum with decay
        applyMomentum(element, velocityX, velocityY);
      }
      
      // Remove the event listeners
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    
    // Add the event listeners
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  });
  
  // Touch events for mobile support - explicitly set as non-passive
  header.addEventListener('touchstart', (e) => {
    if (isDragging) return;
    isDragging = true;
    
    // Cancel any ongoing momentum animation
    if (momentumAnimationId !== null) {
      cancelAnimationFrame(momentumAnimationId);
      momentumAnimationId = null;
    }
    
    // Store the initial touch position
    const touch = e.touches[0];
    initialMouseX = lastMouseX = touch.clientX;
    initialMouseY = lastMouseY = touch.clientY;
    lastMouseTime = Date.now();
    
    // Store initial scroll position
    initialScrollX = window.pageXOffset || document.documentElement.scrollLeft;
    initialScrollY = (window.pageYOffset || document.documentElement.scrollTop) - bounds.offsetTop;
    
    // Get current position in the page
    const rect = element.getBoundingClientRect();
    
    // Convert to absolute positioning if not already
    if (window.getComputedStyle(element).position !== 'absolute') {
      // Create a placeholder to maintain the layout
      const placeholder = document.createElement('div');
      placeholder.className = 'window-placeholder';
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.margin = window.getComputedStyle(element).margin;
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
      element.style.left = `${rect.left + initialScrollX}px`;
      element.style.top = `${rect.top + initialScrollY}px`;
      element.style.width = `${rect.width}px`;
      
      // Move to body to ensure it can be dragged across the document
      bounds.appendChild(element);
    }
    
    // Store the initial element position relative to the document
    initialElementX = rect.left + initialScrollX;
    initialElementY = rect.top + initialScrollY;
    
    // Add active class for styling
    element.classList.add('dragging');
    
    // Bring the window to the front
    bringToFront(element);
    
    // Prevent default behavior
    e.preventDefault();
    
    // Touch move event on the document
    const moveHandler = (e) => {
      // Get current scroll position
      const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      // Calculate the touch movement delta, accounting for scroll
      const touch = e.touches[0];
      const deltaX = (touch.clientX + currentScrollX) - (initialMouseX + initialScrollX);
      const deltaY = (touch.clientY + currentScrollY) - (initialMouseY + initialScrollY);
      
      // Calculate new position
      let newX = initialElementX + deltaX;
      let newY = initialElementY + deltaY;
      
      // Apply the position
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
      
      // Track velocity for momentum
      const now = Date.now();
      const timeDelta = now - lastMouseTime;
      
      if (timeDelta > 0) {
        // Calculate velocity in pixels per millisecond, accounting for scroll
        velocityX = ((touch.clientX + currentScrollX) - (lastMouseX + (window.pageXOffset || document.documentElement.scrollLeft))) / timeDelta;
        velocityY = ((touch.clientY + currentScrollY) - (lastMouseY + (window.pageYOffset || document.documentElement.scrollTop))) / timeDelta;
        
        // Update last position and time
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
        lastMouseTime = now;
      }
      
      // Prevent default behavior (scrolling)
      e.preventDefault();
    };
    
    // Touch end event on the document
    const endHandler = () => {
      isDragging = false;
      element.classList.remove('dragging');
      
      // Apply momentum if velocity is significant
      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      
      if (speed > 0.05) {
        // Apply momentum with decay
        applyMomentum(element, velocityX, velocityY);
      }
      
      // Remove the event listeners
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', endHandler);
    };
    
    // Add the event listeners - explicitly set touchmove as non-passive
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
  }, { passive: false });
  
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
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    let currentX = rect.left + scrollX;
    let currentY = rect.top + scrollY;
    
    // PARAMETER: Mass calculation - affects how windows interact during collisions
    const massMultiplier = 0; // Adjust to change the effect of window size on mass
    const mass = (element.offsetWidth * element.offsetHeight) * massMultiplier || 1;
    windowData.mass = mass;
    
    // Friction factor (0-1, lower = more friction)
    const frictionFactor = 0.95;
    
    // Minimum velocity to continue animation
    const minVelocityThreshold = 0.1;
    
    // Animation function
    function animateMomentum() {

      const wallSpringiness = 0.3;

      // Get current scroll position for each frame
      const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      
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
      
      // Check for collisions with other windows
      const thisRect = {
        left: currentX,
        top: currentY,
        right: currentX + elementWidth,
        bottom: currentY + elementHeight,
        width: elementWidth,
        height: elementHeight
      };
      
      // Get all other windows
      const otherWindows = windowRegistry.getAllWindows().filter(w => w.element !== element);
      
      for (const otherWindow of otherWindows) {
        const otherElement = otherWindow.element;
        const otherRect = otherElement.getBoundingClientRect();
        
        // Convert other window's viewport coordinates to document coordinates
        const otherDocRect = {
          left: otherRect.left + currentScrollX,
          top: otherRect.top + currentScrollY,
          right: otherRect.right + currentScrollX,
          bottom: otherRect.bottom + currentScrollY,
          width: otherRect.width,
          height: otherRect.height
        };
        
        // Check if collision occurred
        if (
          thisRect.left < otherDocRect.right &&
          thisRect.right > otherDocRect.left &&
          thisRect.top < otherDocRect.bottom &&
          thisRect.bottom > otherDocRect.top
        ) {
          // Collision detected!
          
          // Calculate collision normal (direction from this window to other window)
          const thisCenter = {
            x: thisRect.left + thisRect.width / 2,
            y: thisRect.top + thisRect.height / 2
          };
          
          const otherCenter = {
            x: otherDocRect.left + otherDocRect.width / 2,
            y: otherDocRect.top + otherDocRect.height / 2
          };
          
          const collisionNormal = {
            x: otherCenter.x - thisCenter.x,
            y: otherCenter.y - thisCenter.y
          };
          
          // Normalize the collision normal
          const magnitude = Math.sqrt(collisionNormal.x * collisionNormal.x + collisionNormal.y * collisionNormal.y);
          if (magnitude === 0) continue; // Avoid division by zero
          
          collisionNormal.x /= magnitude;
          collisionNormal.y /= magnitude;
          
          // Calculate relative velocity
          const otherVelocityX = otherWindow.momentumData?.velocityX || 0;
          const otherVelocityY = otherWindow.momentumData?.velocityY || 0;
          
          const relativeVelocityX = currentVelocityX - otherVelocityX;
          const relativeVelocityY = currentVelocityY - otherVelocityY;
          
          // Calculate relative velocity in terms of the collision normal
          const velocityAlongNormal = 
            relativeVelocityX * collisionNormal.x + 
            relativeVelocityY * collisionNormal.y;
          
          // Only resolve if objects are moving toward each other
          if (velocityAlongNormal > 0) continue;
          
          const restitution = 0; // Adjust between 0.1 (less bouncy) and 0.9 (very bouncy)
          
          // Calculate impulse scalar
          const otherMass = otherWindow.mass || 1;
          const impulseScalar = -(1 + restitution) * velocityAlongNormal / 
                                (1/mass + 1/otherMass);
          
          // Apply impulse
          const impulseX = impulseScalar * collisionNormal.x;
          const impulseY = impulseScalar * collisionNormal.y;
          
          // Update velocities based on impulse and mass
          currentVelocityX -= impulseX / mass;
          currentVelocityY -= impulseY / mass;
          
          // Update registry with new velocities
          windowData.momentumData.velocityX = currentVelocityX;
          windowData.momentumData.velocityY = currentVelocityY;
          
          // Apply impulse to other window if it's not already in motion
          if (otherWindow.momentumData) {
            otherWindow.momentumData.velocityX += impulseX / otherMass;
            otherWindow.momentumData.velocityY += impulseY / otherMass;
            
            // Start momentum on the other window if it's not already animating
            if (!otherWindow.momentumData.animationId) {
              startMomentumOnWindow(otherWindow);
            }
          }
          
          // PARAMETER: Separation factor - controls how windows separate after collision
          const separationFactor = 0.2; // Adjust between 0.1 (minimal) and 1.0 (maximum)
          
          // Resolve overlap (move windows apart)
          const overlap = Math.min(
            thisRect.right - otherDocRect.left,
            otherDocRect.right - thisRect.left,
            thisRect.bottom - otherDocRect.top,
            otherDocRect.bottom - thisRect.top
          );
          
          const separationX = overlap * collisionNormal.x * separationFactor;
          const separationY = overlap * collisionNormal.y * separationFactor;
          
          // Move this window away from collision
          currentX -= separationX;
          currentY -= separationY;
          
          // Move other window away from collision (if it's not fixed)
          if (otherWindow.momentumData) {
            const otherCurrentX = otherDocRect.left;
            const otherCurrentY = otherDocRect.top;
            
            otherElement.style.left = `${otherCurrentX + separationX}px`;
            otherElement.style.top = `${otherCurrentY + separationY}px`;
          }
        }
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

// Function to bring a window to the front
function bringToFront(element) {
  // Get all draggable windows
  const windows = document.querySelectorAll('.draggable-window');
  
  // Find the highest z-index
  let maxZ = 0;
  windows.forEach(win => {
    const zIndex = parseInt(window.getComputedStyle(win).zIndex) || 0;
    maxZ = Math.max(maxZ, zIndex);
  });
  
  // Set this window's z-index to be higher
  element.style.zIndex = maxZ + 1;
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
    const container = document.querySelector('.draggable-windows-container');
    
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