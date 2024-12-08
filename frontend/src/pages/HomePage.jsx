import { useEffect, useState } from 'react';
import { BASE_API_URL } from "../config";

import Title from "../components/Public/News/Title";
import HeadLines from "../components/Public/Header/Headlines";

import LatestNews from '../components/Public/News/LatestNews';
import PopularNews from '../components/Public/News/PopularNews';
import DetailsNewsRow from '../components/Public/News/DetailsNewsRow';
import DetailsNews from '../components/Public/News/DetailsNews';
import DetailsNewsCol from '../components/Public/News/DetailsNewsCol';

import NewsCard from '../components/Public/News/Items/NewsCard';
import SimpleNewsCard from '../components/Public/News/Items/SimpleNewsCard';

const HomePage = () => {
  const [recentNews, setRecentNews] = useState([]);
  const [techNews, setTechNews] = useState([]);
  const [sportsNews, setSportsNews] = useState([]);
  const [healthNews, setHealthNews] = useState([]);
  const [loading, setLoading] = useState(true); // Loading indicator

  useEffect(() => {
    // Fetch data from multiple APIs concurrently
    const fetchNews = async () => {
      setLoading(true);
      try {
        const [recentRes, techRes, sportsRes, healthRes] = await Promise.all([
          fetch(`${BASE_API_URL}/posts/recent`).then(res => res.json()),
          fetch(`${BASE_API_URL}/posts/category/Technology`).then(res => res.json()),
          fetch(`${BASE_API_URL}/posts/category/Sports`).then(res => res.json()),
          fetch(`${BASE_API_URL}/posts/category/Health`).then(res => res.json()),
        ]);

        // Update state with the fetched data
        setRecentNews(recentRes.data.news || []);
        setTechNews(techRes.data.news || []);
        setSportsNews(sportsRes.data.news || []);
        setHealthNews(healthRes.data.news || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <main>
      {/* Headline Section */}
      <HeadLines news={recentNews} />

      {/* Other News Sections */}
      <div className="bg-slate-100">
        <div className="px-4 md:px-8 py-8">
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12">
              <LatestNews news={recentNews} />
            </div>

            <div className="w-full lg:w-6/12 mt-5 lg:mt-0">
              <div className="flex w-full flex-col gap-y-[14px] pl-0 lg:pl-2">
                <Title title="Technology" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                  {techNews.slice(0, 4).map((item, i) => (
                    <SimpleNewsCard item={item} key={i} type={undefined} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PopularNews type="Popular news" />

          {/* Section 1 */}
          <div className="w-full">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12">
                <DetailsNewsRow
                  news={sportsNews}
                  category="Sports"
                  type="details-news"
                />
                <DetailsNews news={healthNews} category="Health" />
              </div>
              <div className="w-full lg:w-4/12">
                <DetailsNewsCol news={healthNews} category="Health Highlights" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
      
      // {/* first section */}
      
      //       div className="w-full">
      //         <div className="flex flex-wrap">
      //           <div className="w-full lg:w-8/12">
      //             <DetailsNewsRow
      //               news={news["Sports"]}
      //               category="खेलकुद "
      //               type="details-news"
      //             />
      //             <DetailsNews
      //               news={news["Health"]}
      //               category="स्वास्थ्य"
      //             />
      //           </div>
      //           <div className="w-full lg:w-4/12">
      //             <DetailsNewsCol
      //               news={news["Education"]}
      //               category="शिक्षा"
      //             />
      //           </div>
      //         </div>
      //       </div>

      //       {/* 2nd section */}
      //       <div className="w-full">
      //         <div className="flex flex-wrap">
      //           <div className="w-full lg:w-4/12">
      //             {
      //               <div className="pr-2">
      //                 <DetailsNewsCol
      //                   news={news["Education"]}
      //                   category="राजनीति"
      //                 />
      //               </div>
      //             }
      //           </div>
      //           <div className="w-full lg:w-8/12">
      //             <div className="pl-2">
      //               <DetailsNewsRow
      //                 news={news["Travel"]}
      //                 category="पर्यटन"
      //                 type="details-news"
      //               />
      //               <DetailsNews
      //                 news={news["Education"]}
      //                 category="अन्तर्राष्ट्रिय"
      //               />
      //             </div>
      //           </div>
      //         </div>
      //       </div>

      //       {/* 3rd section */}
      //       <div className="w-full">
      //         <div className="flex flex-wrap">
      //           <div className="w-full lg:w-8/12">
      //             <div>
      //               <DetailsNewsRow
      //                 news={news["Technology"]}
      //                 category="टेक्नोलोजी"
      //                 type="details-news"
      //               />
      //             </div>
      //           </div>
      //           <div className="w-full lg:w-4/12">
      //             <div className="pl-2">
      //               <Title title="ताजा समाचार" />
      //               <div className="grid grid-cols-1 gap-y-[14px] mt-4">
      //                 {news['Sports'].map((item, i) => (
      //                   <NewsCard item={item} key={i} />
      //                 ))}
      //               </div>
      //             </div>
      //           </div>
      //         </div>
              
      //         </div> 
  );
};

export default HomePage;
