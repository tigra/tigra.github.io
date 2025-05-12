/**
 * Tooltip management for the md2svg application
 * 
 * Creates global tooltip container and handles tooltip positioning and visibility
 */

/**
 * Creates a tooltip manager with no external dependencies
 * @returns {Object} - TooltipManager object
 */
export const createTooltipManager = () => {
    return {
        /**
         * Initialize tooltips system with global container
         */
        init() {
            // Create a container for tooltips that sits at the root of the document body
            // This ensures tooltips are never cut off by any container's overflow
            const tooltipContainer = document.createElement('div');
            tooltipContainer.id = 'global-tooltip-container';
            document.body.appendChild(tooltipContainer);

            const tooltips = document.querySelectorAll('.tooltip');

            tooltips.forEach(tooltip => {
                this.setupTooltip(tooltip, tooltipContainer);
            });
        },

        /**
         * Set up an individual tooltip
         * @param {HTMLElement} tooltip - The tooltip element 
         * @param {HTMLElement} tooltipContainer - The global tooltip container
         */
        setupTooltip(tooltip, tooltipContainer) {
            const originalTooltipText = tooltip.querySelector('.tooltip-text');
            if (!originalTooltipText) return;

            // Clone the tooltip text and move it to our global container
            const clonedTooltipText = originalTooltipText.cloneNode(true);
            clonedTooltipText.classList.add('cloned-tooltip');
            tooltipContainer.appendChild(clonedTooltipText);

            // Hide the original tooltip text as we'll use the cloned one
            originalTooltipText.style.display = 'none';

            // Position function for this specific tooltip
            const positionTooltip = () => {
                const rect = tooltip.getBoundingClientRect();

                // Ensure tooltip is initially hidden but displayed for measurements
                clonedTooltipText.style.visibility = 'hidden';
                clonedTooltipText.style.display = 'block';
                clonedTooltipText.style.position = 'fixed'; // Use fixed to ignore scroll

                // Force layout to get dimensions
                const tooltipRect = clonedTooltipText.getBoundingClientRect();

                // Adjust position based on available space
                if (rect.right + tooltipRect.width + 20 < window.innerWidth) {
                    // Position to the right if there's enough space
                    clonedTooltipText.style.left = rect.right + 10 + 'px';
                    clonedTooltipText.style.top = rect.top + 'px';
                } else if (rect.left - tooltipRect.width - 20 > 0) {
                    // Position to the left if there's enough space
                    clonedTooltipText.style.left = (rect.left - tooltipRect.width - 10) + 'px';
                    clonedTooltipText.style.top = rect.top + 'px';
                } else if (rect.bottom + tooltipRect.height + 20 < window.innerHeight) {
                    // Position below if there's enough space
                    clonedTooltipText.style.left = rect.left + 'px';
                    clonedTooltipText.style.top = (rect.bottom + 10) + 'px';
                } else {
                    // Position above if there's enough space
                    clonedTooltipText.style.left = rect.left + 'px';
                    clonedTooltipText.style.top = (rect.top - tooltipRect.height - 10) + 'px';
                }
            };

            // Event listeners
            tooltip.addEventListener('mouseenter', () => {
                positionTooltip();
                clonedTooltipText.style.visibility = 'visible';
                clonedTooltipText.style.opacity = '0.95';
            });

            tooltip.addEventListener('mouseleave', () => {
                clonedTooltipText.style.visibility = 'hidden';
                clonedTooltipText.style.opacity = '0';
            });

            // Also update position on window resize if tooltip is visible
            window.addEventListener('resize', () => {
                if (clonedTooltipText.style.visibility === 'visible') {
                    positionTooltip();
                }
            });
        },

        /**
         * Add a new tooltip dynamically to the document
         * @param {HTMLElement} element - The element to attach tooltip to
         * @param {string} content - The tooltip content
         * @param {string} position - Preferred position (right, left, top, bottom)
         */
        addTooltip(element, content, position = 'right') {
            // Make sure tooltip container exists
            let tooltipContainer = document.getElementById('global-tooltip-container');
            if (!tooltipContainer) {
                this.init();
                tooltipContainer = document.getElementById('global-tooltip-container');
            }

            // Set up the tooltip classes
            element.classList.add('tooltip');

            // Create the hidden tooltip text element
            const tooltipText = document.createElement('div');
            tooltipText.classList.add('tooltip-text');
            tooltipText.innerHTML = content;

            // Add to the original element
            element.appendChild(tooltipText);

            // Set up this tooltip
            this.setupTooltip(element, tooltipContainer);
        }
    };
};

// Default export for backward compatibility
export default createTooltipManager;