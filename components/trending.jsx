import SectionHeading from "./section-heading";
import RecipeCard from "./recipe-card";
import { getRandomRecipes } from "@/lib/recipes";
import Link from "next/link";
import { logger } from "@/lib/logger";

const Trending = async () => {
  const res = await getRandomRecipes();

  if (!res.success) {
    logger.error(res.error.message);
    throw new Error(res.error.message);
  }

  const recipes = res.data;
  logger.info([1, 2, 3]);
  logger.warn([1, 2, 3]);
  logger.success([1, 2, 3]);
  logger.error([1, 2, 3]);

  if (!recipes || recipes.length === 0) {
    return <p className="text-center">No recipes found</p>;
  }

  return (
    <section id="trending" className="my-8 max-w-7xl mx-auto px-4">
      <SectionHeading text="Trending Recipes" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5">
        {recipes.map((recipe, i) => (
          <Link href={`/${recipe.id}`} key={i}>
            <RecipeCard recipe={recipe} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Trending;
