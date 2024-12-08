const Input = ({ icon: Icon, ...props }) => {
	return (
		<div className='relative mb-6'>
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='size-5 text-red-500' />
			</div>
			<input
				{...props}
				className='w-full pl-10 pr-3 py-2 bg-gray-100 rounded-lg border-2 border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 text-gray-600 placeholder-gray-600 transition duration-200'
			/>
		</div>
	);
};
export default Input;
