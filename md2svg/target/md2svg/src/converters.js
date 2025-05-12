// Converters for Markdown to SVG
// This file contains the core conversion methods for the md2svg application

/**
 * Create a Converters object with injected dependencies
 * @param {Object} deps - Dependencies object containing required libraries
 * @param {Object} deps.marked - Marked library for markdown parsing
 * @param {Object} deps.DOMPurify - DOMPurify library for sanitizing HTML
 * @param {Object} deps.html2canvas - html2canvas library for rendering HTML to canvas
 * @param {Object} deps.domToSvgModule - dom-to-svg module for converting DOM to SVG
 * @returns {Object} - Converters object with conversion methods
 */
export const createConverters = (deps) => {
    const { marked, DOMPurify, html2canvas, domToSvgModule } = deps;

    return {
        /**
         * Converts Markdown to clean HTML
         * @param {string} markdownContent - The markdown content to convert
         * @returns {string} - Sanitized HTML string
         */
        markdownToHtml(markdownContent) {
            // Convert Markdown to HTML using marked
            const rawHtml = marked.parse(markdownContent);
            
            // Sanitize the HTML to prevent XSS
            const cleanHtml = DOMPurify.sanitize(rawHtml);
            
            return cleanHtml;
        },
        
        /**
         * Method 1: Convert Markdown directly to native SVG elements
         * @param {string} markdownContent - The markdown content to convert
         * @returns {string} - SVG markup as a string
         */
        markdownToNativeSVG(markdownContent) {
            // Parse markdown content
            const tokens = marked.lexer(markdownContent);
            
            // SVG dimensions and settings
            const width = 800;
            const height = 1200; // Start with a height, will be adjusted
            const padding = 20;
            const lineHeight = 24;
            const fontFamily = 'Arial, Helvetica, sans-serif';
            
            // Start SVG document
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <style>
                .heading1 { font-size: 28px; font-weight: bold; fill: #2c3e50; }
                .heading2 { font-size: 24px; font-weight: bold; fill: #3498db; }
                .heading3 { font-size: 20px; font-weight: bold; fill: #2980b9; }
                .heading4 { font-size: 18px; font-weight: bold; fill: #2c3e50; }
                .paragraph { font-size: 16px; fill: #333; }
                .list-item { font-size: 16px; fill: #333; }
                .bold { font-weight: bold; fill: #000; }
                .italic { font-style: italic; }
                .link { fill: #3498db; text-decoration: underline; }
                .blockquote { font-size: 16px; fill: #7f8c8d; font-style: italic; }
                .code { font-family: monospace; fill: #e74c3c; }
            </style>
            <rect width="${width}" height="${height}" fill="white" />`;
            
            // Current Y position for rendering
            let currentY = padding;
            
            // Process tokens and convert to SVG elements
            for (const token of tokens) {
                switch (token.type) {
                    case 'heading':
                        currentY += lineHeight * 1.5; // Space before heading
                        svg += `<text x="${padding}" y="${currentY}" class="heading${token.depth}">${this.escapeXml(token.text)}</text>`;
                        currentY += lineHeight * (1 + 0.5 * token.depth); // Space after heading
                        break;
                        
                    case 'paragraph':
                        currentY += lineHeight;
                        // Split to handle inline formatting
                        svg += `<text x="${padding}" y="${currentY}" class="paragraph">${this.processInlineElements(token.text, padding)}</text>`;
                        currentY += lineHeight;
                        break;
                        
                    case 'list':
                        currentY += lineHeight * 0.5;
                        token.items.forEach((item, index) => {
                            currentY += lineHeight;
                            svg += `<text x="${padding + 20}" y="${currentY}" class="list-item"><tspan x="${padding}" text-anchor="middle">•</tspan>${this.processInlineElements(item.text, padding + 25)}</text>`;
                        });
                        currentY += lineHeight * 0.5;
                        break;
                        
                    case 'blockquote':
                        currentY += lineHeight;
                        // Draw quote line
                        svg += `<line x1="${padding}" y1="${currentY - lineHeight * 0.8}" x2="${padding}" y2="${currentY + lineHeight * 0.5}" stroke="#3498db" stroke-width="3" />`;
                        // Add the text
                        svg += `<text x="${padding + 10}" y="${currentY}" class="blockquote">${this.processInlineElements(token.text, padding + 10)}</text>`;
                        currentY += lineHeight * 1.5;
                        break;
                        
                    case 'code':
                        currentY += lineHeight;
                        svg += `<rect x="${padding}" y="${currentY - lineHeight * 0.8}" width="${width - padding * 2}" height="${lineHeight * (token.text.split('\\n').length + 0.6)}" fill="#f5f5f5" rx="5" ry="5" />`;
                        
                        token.text.split('\\n').forEach((line, index) => {
                            const lineY = currentY + index * lineHeight;
                            svg += `<text x="${padding + 10}" y="${lineY}" class="code">${this.escapeXml(line)}</text>`;
                        });
                        
                        currentY += lineHeight * (token.text.split('\\n').length + 0.8);
                        break;
                        
                    case 'hr':
                        currentY += lineHeight;
                        svg += `<line x1="${padding}" y1="${currentY}" x2="${width - padding}" y2="${currentY}" stroke="#ddd" stroke-width="2" />`;
                        currentY += lineHeight;
                        break;
                        
                    case 'space':
                        currentY += lineHeight * 0.5;
                        break;
                    
                    case 'html':
                        // Handle HTML inside markdown - this is a simplified approach
                        currentY += lineHeight;
                        svg += `<text x="${padding}" y="${currentY}" class="paragraph">[HTML content - view in HTML preview]</text>`;
                        currentY += lineHeight;
                        break;

                    case 'table':
                        // Basic table support - simplified
                        currentY += lineHeight;
                        svg += `<text x="${padding}" y="${currentY}" class="paragraph">[Table content - view in HTML preview]</text>`;
                        currentY += lineHeight * 1.5;
                        break;
                }
            }
            
            // Adjust the SVG height to actual content
            const actualHeight = currentY + padding;
            svg = svg.replace(`height="${height}"`, `height="${actualHeight}"`);
            svg = svg.replace(`viewBox="0 0 ${width} ${height}"`, `viewBox="0 0 ${width} ${actualHeight}"`);
            
            // Close SVG tag
            svg += '</svg>';
            
            return svg;
        },
        
        /**
         * Method 2: Convert HTML to SVG using foreignObject
         * @param {string} htmlContent - HTML content to embed in SVG
         * @returns {string} - SVG markup as a string
         */
        htmlToForeignObjectSVG(htmlContent) {
            const width = 800;
            const height = 600;
            
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <foreignObject width="100%" height="100%" x="0" y="0">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; background-color: white; width: 100%; height: 100%;">
                        ${htmlContent}
                    </div>
                </foreignObject>
            </svg>`;
            
            return svg;
        },
        
        /**
         * Method 3: Convert HTML to SVG via Canvas
         * @param {HTMLElement} htmlElement - HTML element to convert
         * @returns {Promise<string>} - SVG markup as a string
         */
        async htmlToCanvasSVG(htmlElement) {
            try {
                // Create a styled container for conversion
                const conversionContainer = document.createElement('div');
                conversionContainer.innerHTML = htmlElement.innerHTML;
                
                // Apply styling to the container
                Object.assign(conversionContainer.style, {
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    color: '#333',
                    padding: '20px',
                    width: '800px',
                    maxWidth: '100%',
                    background: 'white',
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px'
                });
                
                // Temporarily add to document for conversion
                document.body.appendChild(conversionContainer);
                
                // Use html2canvas to capture the content
                const canvas = await html2canvas(conversionContainer, {
                    backgroundColor: 'white',
                    scale: 2, // Higher resolution
                    logging: false,
                    onclone: (clonedDoc) => {
                        // Additional styling can be applied to the cloned document if needed
                    }
                });
                
                // Remove the temporary container
                document.body.removeChild(conversionContainer);
                
                // Convert canvas to SVG image embedding
                const dataURL = canvas.toDataURL('image/png');
                const width = canvas.width;
                const height = canvas.height;
                
                // Create SVG with embedded image
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                    <image width="${width}" height="${height}" xlink:href="${dataURL}" />
                </svg>`;
                
                return svg;
            } catch (error) {
                console.error('Error in Canvas to SVG conversion:', error);
                return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
                    <text x="50" y="50" fill="red">Error: ${error.message}</text>
                    <text x="50" y="80" fill="red">Try a different conversion method or check console for details.</text>
                </svg>`;
            }
        },
        
        /**
         * Method 4: Convert HTML to SVG using dom-to-svg module
         * @param {HTMLElement} htmlElement - HTML element to convert
         * @returns {Promise<string>} - SVG markup as a string
         */
        async htmlToDomToSvgModuleSVG(htmlElement) {
            try {
                // Create a styled container for conversion
                const conversionContainer = document.createElement('div');
                conversionContainer.innerHTML = htmlElement.innerHTML;
                
                // Apply styling to the container
                Object.assign(conversionContainer.style, {
                    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                    color: '#333',
                    padding: '20px',
                    width: '800px',
                    maxWidth: '100%',
                    background: 'white',
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px'
                });
                
                // Temporarily add to document for conversion
                document.body.appendChild(conversionContainer);
                
                // Check if dom-to-svg module is loaded
                if (!domToSvgModule || !domToSvgModule.elementToSVG) {
                    throw new Error('dom-to-svg module not loaded properly. This method requires a server to work correctly due to ES module loading restrictions.');
                }
                
                // Use dom-to-svg to convert to SVG
                const svgDocument = domToSvgModule.elementToSVG(conversionContainer);
                
                // Convert to string
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svgDocument);
                
                // Remove the temporary container
                document.body.removeChild(conversionContainer);
                
                return svgString;
            } catch (error) {
                console.error('Error in dom-to-svg module conversion:', error);
                return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
                    <text x="50" y="50" fill="red">Error: ${error.message}</text>
                    <text x="50" y="80" fill="red">This method requires serving the page via a web server due to ES module restrictions.</text>
                </svg>`;
            }
        },
        
        /**
         * Process inline elements (bold, italic, links, etc.)
         * @param {string} text - The text to process
         * @param {number} xPosition - The x position
         * @returns {string} - Processed text with SVG markup
         */
        processInlineElements(text, xPosition) {
            // This is a simplified version that only handles basic formatting
            // A full implementation would need to parse the inline markdown elements
            
            // Replace basic markdown formatting with SVG text spans
            let result = text;
            
            // Handle bold text
            result = result.replace(/\*\*(.+?)\*\*/g, '<tspan class="bold">$1</tspan>');
            
            // Handle italic text
            result = result.replace(/\*(.+?)\*/g, '<tspan class="italic">$1</tspan>');
            
            // Handle code snippets
            result = result.replace(/`(.+?)`/g, '<tspan class="code">$1</tspan>');
            
            // Handle links - simplified (doesn't handle the URL part)
            result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<tspan class="link">$1</tspan>');
            
            // Escape XML characters
            return this.escapeXml(result).replace(/&lt;tspan /g, '<tspan ').replace(/&lt;\/tspan&gt;/g, '</tspan>');
        },
        
        /**
         * Escape XML special characters
         * @param {string} unsafe - The string to escape
         * @returns {string} - Escaped string safe for XML
         */
        escapeXml(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }
    };
};

// Default export for backward compatibility
export default createConverters;