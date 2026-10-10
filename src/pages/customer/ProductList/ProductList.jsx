import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import ProductCard from "../../../components/product/ProductCard";
import ActiveFilterChips from "../../../components/shop/ActiveFilterChips";
import CategoryNav from "../../../components/shop/CategoryNav";
import FilterDrawer from "../../../components/shop/FilterDrawer";
import Pagination from "../../../components/shop/Pagination";
import ProductFilters from "../../../components/shop/ProductFilters";
import ShopToolbar from "../../../components/shop/ShopToolbar";
import { ROUTES } from "../../../constants/routes";
import { ALL_CATEGORY } from "../../../constants/shop";
import { featuredCategories } from "../../../data/categories";
import { products } from "../../../data/products";
import useProductFilters from "../../../hooks/useProductFilters";
import "./ProductList.css";

const CATEGORY_SLUGS = featuredCategories.map((category) => category.slug);

/**
 * Shop / product listing page. Wires the mock catalogue into the reusable
 * filter-UI components, with all state and business logic delegated to
 * `useProductFilters` and the pure helpers in `utils/productFilters`.
 *
 * The active category lives in the URL (`/products` or `/categories/:slug`),
 * so a category is shareable and survives a refresh.
 */
export default function ProductList() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const category = slug && CATEGORY_SLUGS.includes(slug) ? slug : ALL_CATEGORY;

  const handleCategoryChange = (nextCategory) => {
    navigate(
      nextCategory === ALL_CATEGORY
        ? ROUTES.PRODUCTS
        : `${ROUTES.CATEGORIES}/${nextCategory}`,
    );
  };

  const shop = useProductFilters(products, {
    category,
    onCategoryChange: handleCategoryChange,
  });

  const activeCategory = featuredCategories.find((item) => item.slug === category);
  const heading = activeCategory
    ? `${activeCategory.name}'s Collection`
    : "Shop All Products";
  const description = activeCategory
    ? activeCategory.description
    : "Browse our full range of premium clothing and accessories. Refine by size, colour, price and availability.";

  const filterProps = {
    categories: featuredCategories,
    options: shop.options,
    filters: shop.filters,
    category,
    onCategoryChange: handleCategoryChange,
    onFilterChange: shop.setFilter,
    onToggleFilter: shop.toggleFilter,
    onPriceChange: shop.setPriceRange,
    onClear: shop.clearFilters,
    activeCount: shop.activeCount,
  };

  return (
    <div className="container product-list">
      <header className="product-list__head">
        <Breadcrumb
          items={[{ label: "Home", to: ROUTES.HOME }, { label: "Shop" }]}
        />
        <h1 className="product-list__title">{heading}</h1>
        <p className="product-list__desc">{description}</p>
        <p className="product-list__count">{shop.totalCount} products available</p>
      </header>

      <CategoryNav
        categories={featuredCategories}
        active={category}
        onChange={handleCategoryChange}
      />

      <div className="product-list__layout">
        <aside className="product-list__sidebar" aria-label="Product filters">
          <ProductFilters {...filterProps} variant="sidebar" />
        </aside>

        <section className="product-list__results" aria-label="Product results">
          <ShopToolbar
            search={shop.filters.search}
            onSearchChange={(value) => shop.setFilter("search", value)}
            sort={shop.sort}
            onSortChange={shop.setSort}
            onOpenFilters={() => setDrawerOpen(true)}
            activeCount={shop.activeCount}
            resultCount={shop.resultCount}
            totalCount={shop.totalCount}
          />

          <ActiveFilterChips {...filterProps} />

          {shop.pageItems.length > 0 ? (
            <>
              <ul className="product-list__grid">
                {shop.pageItems.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} showWishlist showStock />
                  </li>
                ))}
              </ul>

              <Pagination
                page={shop.page}
                totalPages={shop.totalPages}
                onChange={shop.setPage}
              />
            </>
          ) : (
            <div className="product-list__empty">
              <span className="product-list__empty-icon">
                <Icon name="filter" size={28} />
              </span>
              <h2 className="product-list__empty-title">
                No products match your filters
              </h2>
              <p className="product-list__empty-text">
                Try a different search term, or clear the filters to see the full
                collection.
              </p>
              <Button onClick={shop.clearFilters}>Clear Filters</Button>
              <Link to={ROUTES.PRODUCTS} className="product-list__empty-link">
                Browse all products
              </Link>
            </div>
          )}
        </section>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <ProductFilters {...filterProps} variant="drawer" />
        <button
          type="button"
          className="product-list__drawer-apply"
          onClick={() => setDrawerOpen(false)}
        >
          Show {shop.resultCount} products
        </button>
      </FilterDrawer>
    </div>
  );
}
