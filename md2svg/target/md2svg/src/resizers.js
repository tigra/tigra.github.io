/**
 * Resizer functionality for the md2svg application
 * 
 * Handles column and panel resizing logic
 */

/**
 * Create a ResizeManager with no external dependencies
 * @returns {Object} - ResizeManager object
 */
export const createResizeManager = () => {
    return {
        /**
         * Initialize all resizers
         */
        init() {
            // Horizontal resizer between middle column and right column
            this.initColumnResizer('middle-right-resizer', 1, 3); // Indices: 1=middle column, 3=right column

            // Vertical resizers (within columns)
            this.initRowResizer('editor-source-resizer', '.editor-container', '.svg-source-container');
            this.initRowResizer('html-svg-resizer', '.preview-container', '.result-container');

            // Position vertical resizers
            this.positionVerticalResizers();

            // Re-position resizers on window resize
            window.addEventListener('resize', () => this.positionVerticalResizers());
        },

        /**
         * Position vertical resizers between panels
         */
        positionVerticalResizers() {
            // 1. Position resizer between editor and svg source in middle column
            const editorContainer = document.querySelector('.editor-container');
            const editorSourceResizer = document.getElementById('editor-source-resizer');
            const middleColumn = document.querySelector('.middle-column');

            if (editorContainer && editorSourceResizer && middleColumn) {
                // Get the height of the editor container
                const editorRect = editorContainer.getBoundingClientRect();
                const editorHeight = editorRect.height;

                // Position the resizer at the bottom of the editor container
                editorSourceResizer.style.top = `${editorHeight}px`;

                // Ensure the resizer spans the full width of the middle column
                editorSourceResizer.style.left = '0';
                editorSourceResizer.style.right = '0';
                editorSourceResizer.style.width = 'auto';

                // Make sure editor panel is using the full width available
                editorContainer.style.left = '0';
                editorContainer.style.right = '0';
                editorContainer.style.width = 'auto';

                // Make sure SVG source panel is using the full width available
                const svgSourceContainer = document.querySelector('.svg-source-container');
                if (svgSourceContainer) {
                    svgSourceContainer.style.left = '0';
                    svgSourceContainer.style.right = '0';
                    svgSourceContainer.style.width = 'auto';
                }
            }

            // 2. Position resizer between html preview and svg preview in right column
            const htmlPreviewContainer = document.querySelector('.preview-container');
            const htmlSvgResizer = document.getElementById('html-svg-resizer');
            const rightColumn = document.querySelector('.right-column');

            if (htmlPreviewContainer && htmlSvgResizer && rightColumn) {
                // Get the height of the HTML preview container
                const previewRect = htmlPreviewContainer.getBoundingClientRect();
                const previewHeight = previewRect.height;

                // Position the resizer at the bottom of the HTML preview container
                htmlSvgResizer.style.top = `${previewHeight}px`;

                // Ensure the resizer spans the full width of the right column
                htmlSvgResizer.style.left = '0';
                htmlSvgResizer.style.right = '0';
                htmlSvgResizer.style.width = 'auto';

                // Make sure HTML preview panel is using the full width available
                htmlPreviewContainer.style.left = '0';
                htmlPreviewContainer.style.right = '0';
                htmlPreviewContainer.style.width = 'auto';

                // Make sure SVG preview panel is using the full width available
                const svgPreviewContainer = document.querySelector('.result-container');
                if (svgPreviewContainer) {
                    svgPreviewContainer.style.left = '0';
                    svgPreviewContainer.style.right = '0';
                    svgPreviewContainer.style.width = 'auto';
                }
            }
        },

        /**
         * Handle column resizing with direct width manipulation and panel updates
         * @param {string} resizerId - ID of the resizer element
         * @param {number} firstColIndex - Index of the first column to resize
         * @param {number} secondColIndex - Index of the second column to resize
         */
        initColumnResizer(resizerId, firstColIndex, secondColIndex) {
            const resizerElement = document.getElementById(resizerId);
            if (!resizerElement) return;

            resizerElement.addEventListener('mousedown', (e) => {
                e.preventDefault();
                document.body.style.cursor = 'col-resize';
                resizerElement.classList.add('resizer-active');

                // Get the grid container and directly access the columns we're resizing
                const container = document.querySelector('.container');
                const containerRect = container.getBoundingClientRect();

                // Get the columns we're resizing
                const columns = container.children;
                const firstColumn = columns[firstColIndex];  // Middle column (index 1)
                const secondColumn = columns[secondColIndex]; // Right column (index 3)
                const resizerColumn = columns[firstColIndex + 1]; // Horizontal resizer element (index 2)

                // Get the current widths in pixels from the DOM elements
                const firstColumnRect = firstColumn.getBoundingClientRect();
                const secondColumnRect = secondColumn.getBoundingClientRect();
                const firstColumnWidth = firstColumnRect.width;
                const secondColumnWidth = secondColumnRect.width;

                // Get the current width of the container
                const containerWidth = container.getBoundingClientRect().width;

                // Starting position
                const startX = e.clientX;

                // Add mouse move and mouse up event listeners
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);

                const self = this; // Reference to the ResizeManager

                function resize(e) {
                    // Calculate the delta in pixels
                    const deltaX = e.clientX - startX;

                    // Calculate new pixel widths
                    let newFirstColumnWidth = firstColumnWidth + deltaX;
                    let newSecondColumnWidth = secondColumnWidth - deltaX;

                    // Get the current width of the container for accurate calculations
                    const currentContainerWidth = container.getBoundingClientRect().width;

                    // Calculate minimum widths for middle and right columns
                    const minFirstColumnWidth = 250;  // Minimum width for middle column
                    const minSecondColumnWidth = 250; // Minimum width for right column

                    // Enforce minimum widths
                    if (newFirstColumnWidth < minFirstColumnWidth) {
                        newFirstColumnWidth = minFirstColumnWidth;
                        newSecondColumnWidth = secondColumnWidth; // Keep right column width the same
                    } else if (newSecondColumnWidth < minSecondColumnWidth) {
                        newSecondColumnWidth = minSecondColumnWidth;
                        newFirstColumnWidth = firstColumnWidth; // Keep middle column width the same
                    }

                    // Convert to fr units (proportional parts of the grid)
                    const firstColumnFr = (newFirstColumnWidth / currentContainerWidth) * 100;
                    const secondColumnFr = (newSecondColumnWidth / currentContainerWidth) * 100;

                    // Get left column width (fixed at 250px)
                    const leftColumnFr = (250 / currentContainerWidth) * 100;
                    
                    // Resizer width takes 1% of the space
                    const resizerFr = 1;

                    // Build a new grid-template-columns with fr units
                    container.style.gridTemplateColumns =
                        `${leftColumnFr}fr ${firstColumnFr}fr 8px ${secondColumnFr}fr`;

                    // Explicitly update all panels in the middle column (firstColumn) to ensure they maintain their width
                    // This is the key fix for the "panel width behaves strangely" issue
                    const middleColumnPanels = firstColumn.querySelectorAll('.editor-container, .svg-source-container');
                    middleColumnPanels.forEach(panel => {
                        panel.style.left = '0';
                        panel.style.right = '0';
                        panel.style.width = 'auto';
                    });

                    // Same for right column panels
                    const rightColumnPanels = secondColumn.querySelectorAll('.preview-container, .result-container');
                    rightColumnPanels.forEach(panel => {
                        panel.style.left = '0';
                        panel.style.right = '0';
                        panel.style.width = 'auto';
                    });

                    // Update resizer positions
                    self.positionVerticalResizers();
                }

                function stopResize() {
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                    document.body.style.cursor = '';
                    resizerElement.classList.remove('resizer-active');

                    // Update panel positions and resizers after resizing is done
                    self.positionVerticalResizers();

                    // Ensure all panels have correct width settings
                    const allPanels = document.querySelectorAll('.editor-container, .svg-source-container, .preview-container, .result-container');
                    allPanels.forEach(panel => {
                        panel.style.left = '0';
                        panel.style.right = '0';
                        panel.style.width = 'auto';
                    });
                }
            });
        },

        /**
         * Handle vertical resizing within a column - optimized for absolute positioning
         * @param {string} resizerId - ID of the resizer element
         * @param {string} topPanelSelector - Selector for the top panel
         * @param {string} bottomPanelSelector - Selector for the bottom panel
         */
        initRowResizer(resizerId, topPanelSelector, bottomPanelSelector) {
            const verticalResizerElement = document.querySelector('#' + resizerId);
            if (!verticalResizerElement) return;
            
            const topPanel = verticalResizerElement.previousElementSibling;
            const bottomPanel = verticalResizerElement.nextElementSibling;
            const columnElement = topPanel.parentElement;

            // Calculate heights and position the vertical resizer correctly
            const updateLayout = () => {
                // Get the total available height in the column
                const totalColumnHeight = columnElement.clientHeight;

                // Get the current heights from the style (or defaults if not set)
                const topPanelHeightPercent = parseFloat(topPanel.style.height) || 60;
                const bottomPanelHeightPercent = parseFloat(bottomPanel.style.height) || 40;

                // Calculate pixel heights
                const topPanelHeight = (topPanelHeightPercent / 100) * totalColumnHeight;
                const bottomPanelHeight = (bottomPanelHeightPercent / 100) * totalColumnHeight;

                // Position the top panel
                topPanel.style.top = '0';
                topPanel.style.height = topPanelHeightPercent + '%';

                // Position the vertical resizer
                verticalResizerElement.style.top = topPanelHeight + 'px';

                // Position the bottom panel
                bottomPanel.style.top = (topPanelHeight + verticalResizerElement.offsetHeight) + 'px';
                bottomPanel.style.height = bottomPanelHeightPercent + '%';

                // Ensure width is set correctly for all elements
                topPanel.style.left = '0';
                topPanel.style.right = '0';
                bottomPanel.style.left = '0';
                bottomPanel.style.right = '0';
            };

            // Set initial layout
            updateLayout();

            // Add window resize event to update layout
            window.addEventListener('resize', updateLayout);

            // Add resize event listener
            verticalResizerElement.addEventListener('mousedown', function(e) {
                e.preventDefault();
                document.body.style.cursor = 'row-resize';
                verticalResizerElement.classList.add('resizer-active');

                // Get starting measurements
                const startY = e.clientY;
                const totalColumnHeight = columnElement.clientHeight;
                const initialTopPanelHeight = topPanel.getBoundingClientRect().height;
                const initialBottomPanelHeight = bottomPanel.getBoundingClientRect().height;

                // Add mouse move and mouse up event listeners
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);

                function resize(e) {
                    // Calculate the delta movement
                    const deltaY = e.clientY - startY;

                    // Calculate new heights
                    let newTopPanelHeight = initialTopPanelHeight + deltaY;
                    let newBottomPanelHeight = initialBottomPanelHeight - deltaY;
                    const totalAvailableHeight = totalColumnHeight - verticalResizerElement.offsetHeight;

                    // Enforce minimum heights (10% of total)
                    const minHeight = totalAvailableHeight * 0.1;
                    if (newTopPanelHeight < minHeight) {
                        newTopPanelHeight = minHeight;
                        newBottomPanelHeight = totalAvailableHeight - minHeight;
                    } else if (newBottomPanelHeight < minHeight) {
                        newBottomPanelHeight = minHeight;
                        newTopPanelHeight = totalAvailableHeight - minHeight;
                    }

                    // Convert to percentages
                    const newTopPanelPercentage = (newTopPanelHeight / totalAvailableHeight) * 100;
                    const newBottomPanelPercentage = (newBottomPanelHeight / totalAvailableHeight) * 100;

                    // Apply new heights
                    topPanel.style.height = newTopPanelPercentage + '%';
                    bottomPanel.style.height = newBottomPanelPercentage + '%';

                    // Update resizer position
                    verticalResizerElement.style.top = newTopPanelHeight + 'px';
                    bottomPanel.style.top = (newTopPanelHeight + verticalResizerElement.offsetHeight) + 'px';
                }

                function stopResize() {
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                    document.body.style.cursor = '';
                    verticalResizerElement.classList.remove('resizer-active');

                    // Make sure everything is positioned correctly after resize
                    updateLayout();
                }
            });
        }
    };
};

// Default export for backward compatibility
export default createResizeManager;