import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Breadcrumb from "../../components/Public/Breadcrumb.jsx";
import Category from "../../components/Public/Category.jsx";
import Search from "../../components/Public/Search.jsx";

import parser from "html-react-parser";
import { BASE_API_URL } from "../../config/index.js";

import RelatedNews from "../../components/Public/News/RelatedNews";
import RecentNews from "../../components/Public/News/RecentNews.jsx";

import { useAuthStore } from "../../store/authStore.js";

const NewsDetailsPage = () => {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]); // Related news state
  const [loading, setLoading] = useState(true); // Track loading state
  const [comments, setComments] = useState([]); // State for comments

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching data
      try {
        // Fetch main news
        const res = await fetch(`${BASE_API_URL}/posts/${slug}`);
        const data = await res.json();
        setNews(data.data);

        // Fetch related news
        if (data.data?._id) {
          const relatedRes = await fetch(`${BASE_API_URL}/posts/recommended/${data.data._id}`);
          const relatedData = await relatedRes.json();

          setRelatedNews(relatedData.data || []);
        }

        // Fetch comments for this news article
        if (data.data?._id) {
          const commentsRes = await fetch(`${BASE_API_URL}/comments/${data.data._id}`);
          const commentsData = await commentsRes.json();

          setComments(commentsData.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, [slug]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this news?")) {
      try {
        const res = await fetch(`${BASE_API_URL}/posts/${slug}`, {
          method: "DELETE",
        });

        if (res.ok) {
          alert("News deleted successfully");
          window.location.href = "/"; // Redirect to home page after deletion
        } else {
          alert("Failed to delete the news");
        }
      } catch (error) {
        console.error("Error deleting news:", error);
        alert("Error deleting the news");
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message while data is being fetched
  }

  if (!news) {
    return <div>No news found!</div>; // Handle the case where news data is not available
  }

  return (
    <div>
      <div className="bg-white shadow-sm py-4">
        <div className="px-4 md:px-8 w-full">
          <Breadcrumb one={news?.category} two={news?.title} />
        </div>
      </div>
      <div className="bg-slate-200 w-full">
        <div className="px-4 md:px-8 w-full py-8">
          <div className="flex flex-wrap">
            <div className="w-full xl:w-8/12">
              <div className="w-full pr-0 xl:pr-4">
                <div className="flex flex-col gap-y-5 bg-white rounded-md">
                  <img
                    src={news?.image}
                    alt={news?.title}
                    className="rounded-t-md"
                  />
                  <div className="flex flex-col gap-y-4 px-6 pb-6">
                    <h3 className="text-red-700 uppercase font-medium text-xl">
                      {news?.category}
                    </h3>
                    <h2 className="text-3xl text-gray-700 font-bold">
                      {news?.title}
                    </h2>
                    <div className="flex gap-x-2 text-xs font-normal text-slate-600">
                      <span>{news?.createdAt}</span>
                    </div>
                    <div>{parser(news?.description)}</div>
                  </div>
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
            <RelatedNews news={relatedNews} type="Related news" />
          </div>

          {/* Comments Section */}
          <div className="pt-8">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <div>
              {comments.length === 0 ? (
                <div>No comments yet.</div>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className="p-4 bg-white mb-4 rounded-md shadow-sm">
                    <p className="font-medium text-gray-800">{comment.userName}</p>
                    <p className="text-gray-600">{comment.comment}</p>
                    <span className="text-xs text-gray-500">{comment.createdAt}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delete button for admin */}
          {user?.role === "ADMIN" && (
            <div className="pt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white py-2 px-4 rounded-md"
              >
                Delete News
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailsPage;
