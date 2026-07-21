import Image from "next/image";
import Link from "next/link";

interface CategoryItem {
  name: string;
  image: string;
  desc: string;
}

function CategoryCard({ item }: { item: CategoryItem }) {
  return (
    <Link
      href={`/?category=${encodeURIComponent(item.name)}`}
      className="w-52 flex-shrink-0 group card hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/50 dark:hover:bg-white/10 transition-all duration-200"
    >
      <div className="p-4 pb-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors leading-tight block">{item.name}</span>
        <span className="text-xs text-slate-500 dark:text-gray-500 mt-0.5 block">{item.desc}</span>
      </div>
      <div className="relative h-28 overflow-hidden">
        <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-70 group-hover:opacity-90" />
      </div>
    </Link>
  );
}

export default function CategoriesReel({ items }: { items: CategoryItem[] }) {
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
      }}
    >
      <div className="flex gap-4 w-max animate-reel hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <CategoryCard key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
