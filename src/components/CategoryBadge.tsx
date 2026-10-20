import type { Category } from "@/lib/types";

const COLORS: Record<Category, string> = {
  시사: "bg-amber-50 text-amber-700",
  경제: "bg-emerald-50 text-emerald-700",
  IT: "bg-sky-50 text-sky-700",
};

export default function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${COLORS[category]}`}>
      {category}
    </span>
  );
}
