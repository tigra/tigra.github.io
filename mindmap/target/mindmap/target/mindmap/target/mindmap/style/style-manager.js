// src/style/style-manager.js - Pass styleManager to StyleConfiguration

import StyleConfiguration from './style-configuration.js';

/**
 * Manages styles for the entire mindmap
 */
class StyleManager {
  /**
   * Create a new StyleManager
   */
  constructor() {
    // Initialize the level styles and default style
    this.reset();
  }
  
  /**
   * Reset all styles to their initial state
   * This ensures a clean slate when applying new styles
   */
  reset() {
    // Define default styles for different levels
    this.levelStyles = this.createInitialLevelStyles();

    // Initialize defaultLevelStyle with properties from level 6
    // This ensures level 7+ nodes have consistent styling with level 6
//    const level6Style = this.levelStyles[6];
//    const defaultStyleProps = {};
//
//    // Copy visual properties from level 6 to defaultLevelStyle
//    if (level6Style) {
//      // Copy visual properties (but not layout properties)
//      const visualProps = [
//        'fontSize', 'fontWeight', 'fontFamily',
//        'verticalPadding', 'horizontalPadding',
//        'backgroundColor', 'fillOpacity', 'textColor',
//        'borderColor', 'borderWidth', 'borderRadius',
//        'nodeType', 'connectionColor', 'connectionWidth',
//        'connectionTapered', 'connectionStartWidth', 'connectionEndWidth',
//        'connectionGradient'
//      ];
      
//      visualProps.forEach(prop => {
//        if (level6Style[prop] !== undefined) {
//          defaultStyleProps[prop] = level6Style[prop];
//        }
//      });
//    }
    
    // Default style for any level not explicitly defined
//    this.defaultLevelStyle = new StyleConfiguration(defaultStyleProps, this);
    
    return this;
  }

  createInitialLevelStyles() {
     return {
      // Root level
      1: new StyleConfiguration({
        fontSize: 18,
        fontWeight: 'bold',
        verticalPadding: 20,
        horizontalPadding: 20,
        parentPadding: 80,
        childPadding: 20,
//        layoutType: 'horizontal',
        backgroundColor: '#f5f5f5',
        borderColor: '#aaaaaa',
        borderWidth: 2,
        nodeType: 'box'
      }, this), // Pass this (StyleManager) to StyleConfiguration

      // Second level
      2: new StyleConfiguration({
        fontSize: 16,
        fontWeight: 'bold',
//        layoutType: 'horizontal',
        parentPadding: 60,
        childPadding: 20,
        nodeType: 'box'
      }, this),

      // Third level
      3: new StyleConfiguration({
        fontSize: 14,
        parentPadding: 40,
//        layoutType: 'horizontal',
        nodeType: 'box'
      }, this),

      // Fourth level
      4: new StyleConfiguration({
        fontSize: 12,
        horizontalPadding: 5,
        verticalPadding: 5,
        parentPadding: 30,
        childPadding: 15,
//        layoutType: 'horizontal',
        nodeType: 'box'
      }, this),
      
      // Fifth level
      5: new StyleConfiguration({
        fontSize: 11,
        horizontalPadding: 5,
        verticalPadding: 5,
        parentPadding: 25,
        childPadding: 12,
        nodeType: 'box'
      }, this),
      
      // Sixth level
      6: new StyleConfiguration({
        fontSize: 10,
        horizontalPadding: 3,
        verticalPadding: 3,
        parentPadding: 20,
        childPadding: 10,
        nodeType: 'text-only'
      }, this)
    };
  }

  /**
   * Get the effective value for a property, checking node overrides, parent inheritance, and level style
   * @param {Node} node - The node to get value for
   * @param {string} property - The property name to resolve
   * @param {boolean} inheritFromParent - Whether this property should inherit from parent (default: true)
   * @return {any} The effective value
   */
  getEffectiveValue(node, property, inheritFromParent = true) {
    // Add debug logging for level 4+ nodes and important properties
//    const isImportantProperty = ['layoutType', 'direction'].includes(property);
//    const isLevel4Plus = node && node.level >= 4;
//
//    if (isLevel4Plus && isImportantProperty) {
//      console.groupCollapsed(`StyleManager.getEffectiveValue for Level ${node.level} node "${node.text}", property: ${property}`);
//    }

    // Get the appropriate level style
    const levelStyle = this.getLevelStyle(node.level);

    // Start with level style default
    let value = levelStyle[property];
    
//    if (isLevel4Plus && isImportantProperty) {
//      console.log(`  Direct level style value: ${value}`);
//    }

    // Check node's own overrides
    if (node.configOverrides && property in node.configOverrides) {
      const overrideValue = node.configOverrides[property];
      
//      if (isLevel4Plus && isImportantProperty) {
//        console.log(`  Node override found: ${property} = ${overrideValue}`);
//        console.log(`  Node has these overrides:`, node.configOverrides);
//        console.groupEnd();
//      }
      
      return overrideValue;
    }

    // Check parent inheritance if enabled
    if (!value && inheritFromParent && node.parent) {
      // Recursively check parent's effective value
      const parentValue = this.getEffectiveValue(node.parent, property, true);
      
//      if (isLevel4Plus && isImportantProperty) {
//        console.log(`  Inherited from parent "${node.parent.text}": ${property} = ${parentValue}`);
//      }
      
      if (parentValue !== undefined) {
        value = parentValue;
      }
    }
    
//    if (isLevel4Plus && isImportantProperty) {
//      console.log(`  Final resolved value: ${value}`);
//      console.groupEnd();
//    }
    
    return value;
  }

  /**
   * Get the appropriate style for a specific level
   * @param {number} level - The level to get style for
   * @return {StyleConfiguration} The level style
   */
  getLevelStyle(level) {
    // If we have a specific style for this level, return it
    if (this.levelStyles[level]) {
      return this.levelStyles[level];
    }
    
    // Otherwise return the default style
    return this.defaultLevelStyle;
  }

  /**
   * Configure the style with custom settings
   * @param {Object} options - Style configuration options
   */
  configure(options = {}) {
    if (options.levelStyles) {
      // Merge provided level styles with existing ones
      for (const [level, styleOptions] of Object.entries(options.levelStyles)) {
        // Create new style with existing properties plus new ones
        const existingStyle = this.levelStyles[level] || this.defaultLevelStyle;
        const mergedOptions = {
          ...existingStyle, // Spread existing properties
          ...styleOptions   // Override with new properties
        };

        this.levelStyles[level] = new StyleConfiguration(mergedOptions, this);
      }
    }

    if (options.defaultStyle) {
      this.defaultLevelStyle = new StyleConfiguration({
        ...this.defaultLevelStyle,
        ...options.defaultStyle     // Specific properties defined for defaultStyle
      }, this);
    }
  }

  /**
   * Change the layout type globally for all level styles
   * @param {string} layoutType - The layout type to set ('horizontal' or 'vertical')
   * @param {Object} options - Additional options
   * @param {Array<number>} options.excludeLevels - Array of level numbers to exclude from the change
   * @param {Object} options.customPadding - Custom padding values for different layout types
   */
  setGlobalLayoutType(layoutType, options = {}) {  // TODO use style change instead
    if (layoutType !== 'horizontal' && layoutType !== 'vertical' && layoutType !== 'taproot' && layout !== 'classic') {
      throw new Error('Layout type must be either "horizontal" or "vertical". Or "taproot"');
    }

    const excludeLevels = options.excludeLevels || [];
    const customPadding = options.customPadding || {};
    const direction = options.direction || null;

    // Update default level style
    if (!excludeLevels.includes(0)) {
      // Store existing visual properties before changing layout properties
      const visualProperties = {};
      const visualProps = [
        'fontSize', 'fontWeight', 'fontFamily',
        'verticalPadding', 'horizontalPadding',
        'backgroundColor', 'fillOpacity', 'textColor',
        'borderColor', 'borderWidth', 'borderRadius',
        'nodeType', 'connectionColor', 'connectionWidth',
        'connectionTapered', 'connectionStartWidth', 'connectionEndWidth',
        'connectionGradient'
      ];
      
      visualProps.forEach(prop => {
        if (this.defaultLevelStyle[prop] !== undefined) {
          visualProperties[prop] = this.defaultLevelStyle[prop];
        }
      });
      
      // Apply layout properties
      this.defaultLevelStyle.layoutType = layoutType;

      if (direction) {
        this.defaultLevelStyle.direction = direction;
      } else if (layoutType === 'horizontal') {
        this.defaultLevelStyle.direction = 'right';
      } else if (layoutType === 'vertical') {
        this.defaultLevelStyle.direction = 'down';
      }

      // Adjust padding values based on the layout type if needed
      if (customPadding.default) {
        if (customPadding.default.parentPadding) {
          this.defaultLevelStyle.parentPadding = customPadding.default.parentPadding;
        }
        if (customPadding.default.childPadding) {
          this.defaultLevelStyle.childPadding = customPadding.default.childPadding;
        }
      }
    }

    // Update all specific level styles
    for (const level in this.levelStyles) {
      if (excludeLevels.includes(parseInt(level))) {
        continue;
      }

      this.levelStyles[level].layoutType = layoutType;
      if (direction) {
        this.levelStyles[level].direction = direction;
      }

      // Adjust padding values based on the layout type if needed
      if (customPadding[level]) {
        if (customPadding[level].parentPadding) {
          this.levelStyles[level].parentPadding = customPadding[level].parentPadding;
        }
        if (customPadding[level].childPadding) {
          this.levelStyles[level].childPadding = customPadding[level].childPadding;
        }
      }
    }

    return this; // Allow method chaining
  }
}

// For backward compatibility
if (typeof window !== 'undefined') {
  window.StyleManager = StyleManager;
  window.styleManager = new StyleManager();
}

export default StyleManager;