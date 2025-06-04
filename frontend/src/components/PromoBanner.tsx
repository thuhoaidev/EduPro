import React from 'react';

const PromoBanner = () => {
  return (
    <div className="w-full rounded-lg overflow-hidden relative mb-8"
      style={{
        background: 'linear-gradient(to right, #a000f0, #7000f0)', // Adjust gradient colors to match image
        minHeight: '200px', // Adjust height as needed
      }}
    >
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
        {/* Left Section: Text Content */}
        <div className="md:w-2/3 lg:w-1/2 text-white mb-6 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
            Mở bán khóa JavaScript Pro <span className="ml-2 text-yellow-400 text-2xl">👑</span>
          </h2>
          <p className="text-sm mb-4">
            Từ 08/08/2024 khóa học sẽ có giá 1.399K. Khi khóa học hoàn thiện sẽ trở về giá gốc.
          </p>
          <button className="border border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-[#a000f0]">
            HỌC THỬ MIỄN PHÍ
          </button>
        </div>

        {/* Right Section: Image/Illustration and Price */}
        <div className="md:w-1/3 lg:w-1/2 flex flex-col items-center md:items-end text-white">
          {/* Placeholder for illustration/image */}
          {/* You will need to replace this with your actual image */}
          {/* <img src="https://dummyimage.com/150x200/cccccc/000000&text=JS+Pro" alt="JavaScript Pro Course" className="max-h-40 mb-4" /> */}

          {/* Price Info */}
          <div className="text-right">
            <p className="text-lg line-through">3.299K</p>
            <p className="text-4xl font-bold">1.199K</p>
            <p className="text-xs">*Dành cho tài khoản đã pre-order khóa HTML, CSS Pro</p>
          </div>
        </div>
      </div>
      {/* Add navigation arrows if this is part of a slider (requires more logic) */}
      {/* <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12"></div> */}
      {/* <div className="absolute inset-y-0 right-0 flex items-center justify-center w-12"></div> */}
    </div>
  );
};

export default PromoBanner; 