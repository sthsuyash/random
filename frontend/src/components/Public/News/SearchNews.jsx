import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';  
import SimpleDetailsNewCard from './Items/SimpleDetailsNewCard';
import { BASE_API_URL } from '../../../config';

const SearchNewsComponent = () => {
    const [news, setNews] = useState([]);
    const [isClient, setIsClient] = useState(false);  // State to check if we are on the client

    const location = useLocation();  // Hook to access the current location
    const searchParams = new URLSearchParams(location.search);  // Get search parameters from URL
    const q = searchParams.get('q');  // Retrieve the 'value' parameter

    const get_news = async () => {
        if (!q) return;  // If there's no search value, don't fetch

        try {
            const res = await fetch(`${BASE_API_URL}/posts/search?q=${q}`);
            const data_res = await res.json();
            const data = data_res.data;

            if (res.ok) {
                setNews(data.news);  // Only update if the response is OK
            } else {
                console.error('Failed to fetch news:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    useEffect(() => {
        setIsClient(true);  // Indicate that we are on the client
    }, []);

    useEffect(() => {
        if (isClient && q) {
            get_news();  // Only fetch news when on the client side and if there's a search value
        }
    }, [q, isClient]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {news.length > 0 ? (
                news.map((item, i) => (
                    <SimpleDetailsNewCard key={i} news={item} type="details-news" height={200} />
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500">No news found.</div>
            )}
        </div>
    );
};

export default function SearchNews() {
    return (
        <div>
            <SearchNewsComponent />
        </div>
    );
}
