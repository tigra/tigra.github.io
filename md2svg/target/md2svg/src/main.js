// Import dependencies
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import { elementToSVG } from 'dom-to-svg';
import { createConverters } from './converters.js';
import { createResizeManager } from './resizers.js';
import { createTooltipManager } from './tooltips.js';

// Main application code
document.addEventListener('DOMContentLoaded', () => {
    // Create module instances with dependencies
    const deps = {
        marked,
        DOMPurify,
        html2canvas,
        domToSvgModule: { elementToSVG }
    };
    
    const Converters = createConverters(deps);
    const ResizeManager = createResizeManager();
    const TooltipManager = createTooltipManager();

    // DOM elements
    const markdownInput = document.getElementById('markdown-input');
    const convertButton = document.getElementById('convert-btn');
    const htmlPreview = document.getElementById('html-preview');
    const svgContainer = document.getElementById('svg-container');
    const svgCode = document.getElementById('svg-code');
    const downloadButton = document.getElementById('download-btn');
    const copyButton = document.getElementById('copy-btn');
    const conversionMethods = document.getElementsByName('svg-method');

    // Initialize with default content
    updatePreview();

    // Initialize tooltips
    TooltipManager.init();

    // Initialize resizers
    ResizeManager.init();

    // Run positioning again after a short delay to ensure it works after layout is complete
    setTimeout(() => ResizeManager.positionVerticalResizers(), 100);

    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    convertButton.addEventListener('click', convertToSVG);
    downloadButton.addEventListener('click', downloadSVG);
    copyButton.addEventListener('click', copySVG);

    // Update HTML preview from Markdown
    function updatePreview() {
        // Convert Markdown to HTML using our converter
        const cleanHtml = Converters.markdownToHtml(markdownInput.value);

        // Update the preview
        htmlPreview.innerHTML = cleanHtml;
    }

    // Convert to SVG using selected method
    async function convertToSVG() {
        try {
            // Clear previous SVG
            svgContainer.innerHTML = '';

            // Get the selected conversion method
            let selectedMethod = Array.from(conversionMethods).find(radio => radio.checked).value;

            // Convert based on selected method
            let svgString = '';

            switch (selectedMethod) {
                case 'native':
                    svgString = Converters.markdownToNativeSVG(markdownInput.value);
                    break;
                case 'foreignObject':
                    svgString = Converters.htmlToForeignObjectSVG(htmlPreview.innerHTML);
                    break;
                case 'canvas':
                    svgString = await Converters.htmlToCanvasSVG(htmlPreview);
                    break;
                case 'domToSvgModule':
                    svgString = await Converters.htmlToDomToSvgModuleSVG(htmlPreview);
                    break;
                default:
                    svgString = Converters.markdownToNativeSVG(markdownInput.value);
            }

            // Display the SVG
            svgContainer.innerHTML = svgString;

            // Add the SVG code to the textarea
            svgCode.value = svgString;

            // Enable the download button
            downloadButton.disabled = false;
        } catch (error) {
            console.error('Error generating SVG:', error);
            svgContainer.innerHTML = '<p>Error generating SVG. See console for details.</p>';
        }
    }
    
    // Utility functions for file management

    // Download SVG file
    function downloadSVG() {
        if (!svgCode.value) {
            alert('Please generate an SVG first.');
            return;
        }
        
        // Create a blob from the SVG code
        const blob = new Blob([svgCode.value], { type: 'image/svg+xml' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'markdown-export.svg';
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Copy SVG code to clipboard
    function copySVG() {
        if (!svgCode.value) {
            alert('Please generate an SVG first.');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(svgCode.value)
            .then(() => {
                // Visual feedback that copy succeeded
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                copyButton.style.backgroundColor = '#27ae60';

                // Reset button after 2 seconds
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.style.backgroundColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy SVG: ', err);
                alert('Failed to copy SVG to clipboard.');
            });
    }
});