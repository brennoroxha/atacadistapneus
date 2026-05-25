import { createServerFn } from "@tanstack/react-start";
import { supabase } from "./supabase";

export const getFeaturedProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("featured", true)
      .limit(12);

    if (error) throw error;
    return data;
  });

export const getProductsByCategorySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!cat) return [];
    const { data: products, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("category_id", cat.id)
      .gt("price", 0)
      .limit(data.limit ?? 8);
    if (error) throw error;
    return products;
  });

export const getCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  });
