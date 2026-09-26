/**
 * Text Formatting Utilities
 * 
 * Helper functions for formatting text, dates, and display values.
 */

/**
 * Map risk levels to display properties.
 * @param {string} level - Risk level (low|medium|high|critical)
 * @returns {{ label: string, color: string, icon: string }}
 */
export function getRiskDisplay(level) {
  const map = {
    low: { label: 'Low Risk', color: 'var(--color-success)', icon: '✓' },
    medium: { label: 'Medium Risk', color: 'var(--color-warning)', icon: '⚠' },
    high: { label: 'High Risk', color: 'var(--color-danger)', icon: '✗' },
    critical: { label: 'Critical', color: 'var(--color-critical)', icon: '⛔' },
  };
  return map[level] || map.medium;
}

/**
 * Map priority levels to display properties.
 * @param {string} priority
 * @returns {{ label: string, color: string }}
 */
export function getPriorityDisplay(priority) {
  const map = {
    high: { label: 'High Priority', color: 'var(--color-danger)' },
    medium: { label: 'Medium Priority', color: 'var(--color-warning)' },
    low: { label: 'Low Priority', color: 'var(--color-success)' },
  };
  return map[priority] || map.medium;
}

/**
 * Map significance levels to diff display colors.
 * @param {string} significance
 * @returns {{ color: string, bgColor: string }}
 */
export function getDiffSignificance(significance) {
  const map = {
    low: { color: 'var(--color-info)', bgColor: 'rgba(59,130,246,0.1)' },
    medium: { color: 'var(--color-warning)', bgColor: 'rgba(245,158,11,0.1)' },
    high: { color: 'var(--color-danger)', bgColor: 'rgba(239,68,68,0.1)' },
    critical: { color: 'var(--color-critical)', bgColor: 'rgba(220,38,38,0.15)' },
  };
  return map[significance] || map.medium;
}

/**
 * Truncate text to a maximum length with ellipsis.
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get category icon emoji.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryIcon(category) {
  const icons = {
    'Addition': '➕',
    'Removal': '➖',
    'Modification': '✏️',
    'Reworded': '🔄',
    'Rights': '🛡️',
    'Obligations': '📋',
    'Risks': '⚠️',
    'Deadlines': '⏰',
    'Costs': '💰',
    'Termination': '🚪',
  };
  return icons[category] || '📄';
}

/**
 * Format a category label for display.
 * @param {string} category
 * @returns {string}
 */
export function formatCategory(category) {
  if (!category) return '';
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}

/**
 * Safely parse JSON, returning null on failure.
 * @param {string} text - JSON string
 * @returns {object|null}
 */
export function safeParseJSON(text) {
  try {
    // Handle markdown code blocks wrapping
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    return JSON.parse(cleaned.trim());
  } catch {
    return null;
  }
}
