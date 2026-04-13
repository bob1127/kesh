import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useRouter } from "next/router";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { asPath } = router;

  useEffect(() => {
    const fetchCategories = async () => {
      let allCategories = [];
      let page = 1;
      const perPage = 100;
      const consumerKey = "ck_0ed8acaab9f0bc4cd27c71c2e7ae9ccc3ca45b04";
      const consumerSecret = "cs_50ad8ba137c027d45615b0f6dc2d2d7ffcf97947";

      try {
        while (true) {
          const response = await axios.get(
            "https://dyx.wxv.mybluehost.me/website_a8bfc44c/wp-json/wc/v3/products/categories",
            {
              params: {
                consumer_key: consumerKey,
                consumer_secret: consumerSecret,
                page: page,
                per_page: perPage,
              },
            }
          );

          if (response.data.length === 0) break;

          allCategories = [...allCategories, ...response.data];
          page++;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
      setCategories(allCategories);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSubcategories = (categoryId) => {
    if (isMobile) return;
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const renderCategories = (parentId) => {
    const subCategories = categories.filter(
      (category) => category.parent === parentId
    );
    if (subCategories.length === 0) return null;

    return (
      <ul className="pl-4 flex flex-col space-y-2">
        {subCategories.map((category) => (
          <li className="flex group" key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className={`px-3 py-1 transition duration-200 rounded-lg hover:bg-gray-200`}
            >
              {category.name}
            </Link>
            {renderCategories(category.id)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <nav className="relative w-full">
      {isMobile ? (
        // ✅ 手機版下拉式選單
        <div className="w-full px-4">
          <select
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const selectedSlug = e.target.value;
              if (selectedSlug) router.push(`/category/${selectedSlug}`);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              請選擇分類
            </option>
            {categories
              .filter((category) => category.parent === 0)
              .map((category) => (
                <optgroup label={category.name} key={category.id}>
                  <option value={category.slug}>{category.name}</option>
                  {categories
                    .filter((sub) => sub.parent === category.id)
                    .map((sub) => (
                      <option key={sub.id} value={sub.slug}>
                        └ {sub.name}
                      </option>
                    ))}
                </optgroup>
              ))}
          </select>
        </div>
      ) : (
        // ✅ 桌面版分類
        <ul className="flex   flex-row lg:flex-col space-y-4 overflow-x-scroll lg:overflow-visible scrollbar-none">
          {categories
            .filter((category) => category.parent === 0)
            .map((category) => {
              const subCategories = categories.filter(
                (subCat) => subCat.parent === category.id
              );
              const hasSubcategories = subCategories.length > 0;

              return (
                <li
                  key={category.id}
                  className="relative rounded-full p-1 pr-3 inline-block w-[180px] mx-2 group"
                >
                  <button
                    onClick={() => toggleSubcategories(category.id)}
                    className="py-1 rounded-full px-3 flex justify-between w-full text-center font-bold bg-white"
                  >
                    <span className="whitespace-nowrap text-[15px] group-hover:text-gray-900 font-bold">
                      {category.name}
                    </span>
                    {hasSubcategories && (
                      <span className="ml-2">
                        {activeCategory === category.id ? (
                          <FiChevronUp size={18} />
                        ) : (
                          <FiChevronDown size={18} />
                        )}
                      </span>
                    )}
                  </button>
                  {activeCategory === category.id && (
                    <div className="mt-2 text-[14px]">
                      {renderCategories(category.id)}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
