import Breadcrumb from "../../../components/common/Breadcrumb";
import CategoryCard from "../../../components/category/CategoryCard";
import { ROUTES } from "../../../constants/routes";
import { featuredCategories } from "../../../data/categories";
import "./Categories.css";

/**
 * `/categories` — browse every category (the nav links straight here; each
 * tile opens the filtered shop at `/categories/:slug`).
 */
export default function Categories() {
  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Categories" },
  ];

  return (
    <div className="container categories">
      <Breadcrumb items={breadcrumb} />

      <header className="categories__header">
        <h1 className="categories__title">Categories</h1>
        <p className="categories__subtitle">
          Browse the full collection — every category opens a filtered shop
          with search, sorting and stock info.
        </p>
      </header>

      <ul className="categories__grid">
        {featuredCategories.map((category) => (
          <li key={category.id}>
            <CategoryCard category={category} />
          </li>
        ))}
      </ul>
    </div>
  );
}

