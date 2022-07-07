/**
 * Async utility that waits for the specified time (in ms).
 *
 * @param {number} time - Time in milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export const wait = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

/**
 * Utility to calculate pagination and sorting options based on request query.
 *
 * @param {Object} query
 * @param {number} [query.page] - Current page number (1-indexed).
 * @param {number} [query.limit] - Number of items per page.
 * @param {string} [query.sortField] - Field name to sort by.
 * @param {string} [query.sort] - Sort direction ('asc' or 'desc').
 * @returns {{
 *   skip: number,
 *   limit: number|null,
 *   sort: Object,
 *   page: number|undefined,
 *   reset: Function
 * }}
 */
export const paginationWithSort = ({ page, sort, sortField, limit }) => {
  const calculatedLimit = limit || 1;
  const skip = page ? calculatedLimit * (page - 1) : 0;

  // Determine sort direction
  const sortData = {};
  if (sort && sortField) {
    sortData[sortField] = sort.toLowerCase() === 'asc' ? 1 : -1;
  } else {
    sortData['_id'] = -1; // Default sort by newest first
  }

  return {
    skip,
    limit: page ? calculatedLimit : null,
    sort: sortData,
    page,

    /**
     * Resets pagination to first page, default limit and sorting.
     * @returns {Object} this
     */
    reset() {
      this.skip = 0;
      this.limit = calculatedLimit;
      this.sort = sortData;
      this.page = 1;
      return this;
    }
  };
};
