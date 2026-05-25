I will fix the search functionality, category filtering, and product filters to ensure users can find products effectively.

### Improvements

1.  **Recursive Category Filtering**:
    *   Update the product fetching logic to include products from all subcategories when a parent category is selected. This ensures that clicking on "Carros e Camionetes" shows all tires in its child "Aro" categories.
2.  **Flexible Search**:
    *   Improve the search algorithm to split the search query into multiple terms. A product will match if all terms are present in its name (e.g., searching "Pirelli 13" will find "Pneu Pirelli Aro 13").
    *   Extend search to include the `gtin` (EAN) and `description` fields.
3.  **Facet Accuracy**:
    *   Ensure the filter options (Aro, Altura, Largura, Marca) are correctly populated by scanning all relevant products, even if some specifications are only present in the product name.
4.  **Filter Persistence**:
    *   Verify that filters remain active and accurate when switching between categories.

### Technical Details

*   **src/routes/products.index.tsx**:
    *   Fetch the entire category tree once and build a mapping to resolve all descendant IDs for any given category slug.
    *   Update the `useQuery` for `products` and `all-facets` to use the resolved list of category IDs.
    *   Implement multi-term `ilike` filtering for the search query.
    *   Update `parseMedida` to be more robust for different tire name formats.
*   **src/components/Header.tsx**:
    *   Ensure the search input correctly passes the query to the products page.
