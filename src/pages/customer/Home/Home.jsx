import Hero from "../../../components/home/Hero";
import FeaturedCategories from "../../../components/home/FeaturedCategories";
import FeaturedCollections from "../../../components/home/FeaturedCollections";
import PromoBanner from "../../../components/home/PromoBanner";
import WhyShopWithUs from "../../../components/home/WhyShopWithUs";
import Newsletter from "../../../components/home/Newsletter";

/** Customer home page — composes the storefront sections in display order. */
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <FeaturedCollections />
      <PromoBanner />
      <WhyShopWithUs />
      <Newsletter />
    </>
  );
}
