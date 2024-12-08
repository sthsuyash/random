import { useEffect, useState } from 'react';

import Categories from './Categories';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

import { BASE_API_URL } from '../../../../config/index.js';

const SecondaryHeader = () => {
    const [categories, setCategories] = useState([]);
    const [showSearchBar, setShowSearchBar] = useState(false); // State for SearchBar visibility
    const [showUserMenu, setShowUserMenu] = useState(false);   // State for UserMenu visibility

    const getCategories = async () => {
        try {
            const res = await fetch(`${BASE_API_URL}/posts/category/all`);
            const data = await res.json();
            setCategories(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        setShowUserMenu(false);  // Hide UserMenu when SearchBar is toggled
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
        setShowSearchBar(false);  // Hide SearchBar when UserMenu is toggled
    };

    return (
        <div className="w-full">
            <hr className="my-2" /> {/* Horizontal line above */}
            <div className="w-full text-black uppercase font-semibold relative">
                <div className="px-8 flex justify-between items-center relative h-[48px]">
                    {/* Categories Section */}
                    <Categories categories={categories} />

                    {/* SearchBar and UserMenu */}
                    <div className="flex items-center space-x-4">
                        <SearchBar show={showSearchBar} toggleSearchBar={toggleSearchBar} />
                        <UserMenu show={showUserMenu} toggleUserMenu={toggleUserMenu} />
                    </div>
                </div>
            </div>
            <hr className="mt-2" /> {/* Horizontal line below */}
        </div>
    );
};

export default SecondaryHeader;
