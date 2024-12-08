import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Breadcrumb from '../../components/Public/Breadcrumb';
import Category from '../../components/Public/Category';
import Search from '../../components/Public/Search';
import PopularNews from '../../components/Public/News/PopularNews';
import RecentNews from '../../components/Public/News/RecentNews';
import SimpleDetailsNewCard from '../../components/Public/News/items/SimpleDetailsNewCard';
import { BASE_API_URL } from '../../config';

const IndividualCategoryPage = () => {
  const { category } = useParams(); // Use React Router to get the category from the URL
  const [news, setNews] = useState([]); // State to store fetched news
  const [loading, setLoading] = useState(true); // State to handle loading status

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/posts/category/${category}`);
          const data = await res.json();
          
        setNews(data.data.news); // Set the fetched news
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchNews();
  }, [category]); // Re-fetch when the category changes

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while fetching
  }

  return (
    <div>
      <div className="bg-white shadow-sm py-4">
        <div className="px-4 md:px-8 w-full">
          <Breadcrumb one="प्रकार" two={category} />
        </div>
      </div>
      <div className="bg-slate-200 w-full">
        <div className="px-4 md:px-8 w-full py-8">
          <div className="flex flex-wrap">
            <div className="w-full xl:w-8/12">
              <div className="w-full pr-0 xl:pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {news && news.length > 0 && news.map((item, i) => (
                    <SimpleDetailsNewCard
                      key={`news-${i}`} // Add unique key
                      news={item}
                      type="details-news"
                      height={200}
                      sliceLength={100}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full xl:w-4/12">
              <div className="w-full pl-0 xl:pl-4">
                <div className="flex flex-col gap-y-8">
                  <Search />
                  <RecentNews />
                  <div className="p-4 bg-white">
                    <Category titleStyle={"text-gray-700 font-bold"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8">
            <PopularNews type="Popular news" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualCategoryPage;
