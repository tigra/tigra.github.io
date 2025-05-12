// src/layout/layout.js

import ConnectionPoint from './connection-point.js';
import textMetrics from '../utils/text-metrics.js';

/**
 * Base Layout class that handles common functionality
 */
class Layout {
  /**
   * Calculate own dimensions of a node based on text and level style
   * @param {string} text - The text content of the node
   * @param {Object} levelStyle - The style for this node's level
   * @return {Object} The calculated width and height
   */
  getNodeSize(text, levelStyle) {
    // Get text wrapping configuration
    const wrapConfig = levelStyle.getTextWrapConfig();
    const textWrap = wrapConfig.textWrap;
    const maxWidth = wrapConfig.maxWidth;
    const maxWordLength = wrapConfig.maxWordLength;

    let textDimensions;

    if (textWrap === 'none') {
      // Simple case - just measure without wrapping
      textDimensions = textMetrics.measureText(
        text,
        levelStyle.fontFamily,
        levelStyle.fontSize,
        levelStyle.fontWeight
      );
    } else {
      // Use text wrapping measurement
      textDimensions = textMetrics.wrapText(
        text,
        maxWidth,
        levelStyle.fontFamily,
        levelStyle.fontSize,
        levelStyle.fontWeight,
        textWrap,
        maxWordLength
      );
    }

    // The textDimensions.width now already accounts for the appropriate width calculation
    // from our improved TextMetricsService

    return {
      width: textDimensions.width + (levelStyle.horizontalPadding * 2),
      height: textDimensions.height + (levelStyle.verticalPadding * 2)
    };
  }

  /**
   * Adjust position of node and all its children recursively
   * @param {Node} node - The node to adjust
   * @param {number} deltaX - Horizontal adjustment
   * @param {number} deltaY - Vertical adjustment
   */
  adjustPositionRecursive(node, deltaX, deltaY) {
    node.x += deltaX;
    node.y += deltaY;
    if (node.boundingBox) {
        node.boundingBox.x += deltaX;
        node.boundingBox.y += deltaY;
    }
    for (let i = 0; i < node.children.length; i++) {
      this.adjustPositionRecursive(node.children[i], deltaX, deltaY);
    }
  }

  /**
   * Apply layout to a node and its children.
   * x and y are only the initial position. The position may change after laying out children recursively
   * and finding out their positions/bounding boxes.
   * @param {Node} node - The node to layout
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {Object} style - The style to apply
   * @return {Object} The size of the laid out subtree
   */
  applyLayout(node, x, y, style) {
    throw new Error('Method applyLayout must be implemented by subclasses');
  }

  /**
   * Get the connection point for a parent node connecting to its children
   * @param {Node} node - The parent node
   * @param {Object} levelStyle - The style for this node's level
   * @param {Node} childNode - The specific child node being connected to (optional)
   * @return {ConnectionPoint} The connection point
   */
  getParentConnectionPoint(node, levelStyle, childNode = null) {
    throw new Error('Method getParentConnectionPoint must be implemented by subclasses');
  }
  
  /**
   * Calculate horizontal position for parent connection points when distributed
   * @param {Node} node - The parent node
   * @param {Node} childNode - The child node
   * @param {string} connectionPointsType - Type of distribution ('single', 'distributedRelativeToParentSize', 'distributeEvenly')
   * @param {number} widthPortion - Portion of parent width to use for connections (0.0-1.0), default 0.8
   * @returns {number} The x-coordinate for the connection point
   */
  calculateConnectionPointX(node, childNode, connectionPointsType, widthPortion = 0.8) {
    // Default to center position
    if (!childNode || connectionPointsType === 'single') {
      return node.x + (node.width / 2);
    }
    
    // Calculate margins - evenly distribute remaining width to both sides
    const marginPortion = (1 - widthPortion) / 2;
    const parentWidth = node.width;
    
    // Handle specific distribution types
    if (connectionPointsType === 'distributedRelativeToParentSize') {
      // Position based on child's horizontal center
      const childCenterX = childNode.x + (childNode.width / 2);
      
      // Calculate relative position with configured margins
      let relativePosition = (childCenterX - node.x) / parentWidth;
      // Constrain within the usable range
      relativePosition = Math.max(marginPortion, Math.min(1 - marginPortion, relativePosition));
      
      return node.x + (parentWidth * relativePosition);
    }
    
    if (connectionPointsType === 'distributeEvenly') {
      // Position based on child's index among siblings
      const children = node.children;
      
      // Return center if no children or child not found
      if (!children || children.length === 0) {
        return node.x + (node.width / 2);
      }
      
      const childIndex = children.findIndex(child => child === childNode);
      if (childIndex === -1) {
        return node.x + (node.width / 2);
      }
      
      // Calculate evenly spaced positions
      const usableWidth = parentWidth * widthPortion;  // Configurable portion of width
      const startX = node.x + (parentWidth * marginPortion);  // Left margin
      
      // For one child, use center; otherwise space evenly
      if (children.length === 1) {
        return startX + (usableWidth / 2);
      } else {
        const gap = usableWidth / (children.length - 1);
        return startX + (gap * childIndex);
      }
    }
    
    // Default fallback to center
    return node.x + (node.width / 2);
  }

  /**
   * Get the connection point for a child node connecting to its parent
   * @param {Node} node - The child node
   * @param {Object} levelStyle - The style for this node's level
   * @return {ConnectionPoint} The connection point
   */
  getChildConnectionPoint(node, levelStyle) {
    throw new Error('Method getChildConnectionPoint must be implemented by subclasses');
  }
}

// For backward compatibility
if (typeof window !== 'undefined') {
  window.BaseLayout = Layout;
}

export default Layout;
