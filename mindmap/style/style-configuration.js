// src/style/style-configuration.js
import LayoutFactory from '../layout/layout-factory.js';

/**
 * Represents styling for a specific level in the mindmap
 */
class StyleConfiguration {
  /**
   * Create a new StyleConfiguration
   * @param {Object} options - Configuration options for this style
   */
  constructor(options = {}) {
    // Font settings
    this.fontSize = options.fontSize || 14;
    this.fontWeight = options.fontWeight || 'normal';
    this.fontFamily = options.fontFamily || '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif';

    // Padding and spacing
    this.verticalPadding = options.verticalPadding || 10;
    this.horizontalPadding = options.horizontalPadding || 10;
    this.parentPadding = options.parentPadding || 30;
    this.childPadding = options.childPadding || 20;

    // Layout type
    this.layoutType = options.layoutType || 'horizontal';
//    this.direction = options.direction || 'left';
    this.direction = options.direction || 'right';
//    this.direction = options.direction || 'down  ';

    // Colors and appearance
    this.backgroundColor = options.backgroundColor || '#ffffff';
    this.fillOpacity = options.fillOpacity || 0.9;  // TODO 1 and some semitransparent presets
    this.textColor = options.textColor || '#000000';
    this.borderColor = options.borderColor || '#cccccc';
    this.borderWidth = options.borderWidth || 2;
    this.borderRadius = options.borderRadius || 5;
    this.nodeType = options.nodeType || 'box';
    this.connectionColor = options.connectionColor || '#666666';
    this.connectionWidth = options.connectionWidth || 2;
    this.boundingBox = options.boundingBox || false;
  }

    /**
     * Get the appropriate layout for this level style
     * @return {Layout} The layout instance
     */
    getLayout() {
      const LayoutFactory = window.LayoutFactory || (typeof require !== 'undefined' ? require('../layout/layout-factory').default : null);
        return LayoutFactory.createLayout(
          this.layoutType,
          this.parentPadding,
          this.childPadding,
          this.direction
        );
    }

  /**
   * Get the appropriate layout type for this style
   * @return {string} The layout type
   */
  getLayoutType() {  // TODO do we need it?
    return this.layoutType;
  }

  /**
   * Set the layout type for this style
   * @param {string} layoutType - The layout type to set ('horizontal' or 'vertical')
   */
  setLayoutType(layoutType) {
    if (layoutType !== 'horizontal' && layoutType !== 'vertical') {
      throw new Error('Layout type must be either "horizontal" or "vertical"');
    }
    this.layoutType = layoutType;
  }
}

// For backward compatibility
if (typeof window !== 'undefined') {
  window.StyleConfiguration = StyleConfiguration;
}

export default StyleConfiguration;