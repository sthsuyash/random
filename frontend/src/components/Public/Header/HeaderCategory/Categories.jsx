import { useNavigate } from 'react-router-dom';

const Categories = ({ categories }) => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex justify-center space-x-4">
            {categories.length > 0 &&
                categories.map((c, i) => (
                    <button
                        key={i}
                        className={`px-6 font-medium text-sm py-[13px] text-gray-500 ${
                            window.location.pathname === `/category/${c.category}` ? 'underline' : ''
                        }`}
                        onClick={() => navigate(`/category/${c.category}`)}
                    >
                        {c.category}
                    </button>
                ))}
        </div>
    );
};

export default Categories;
