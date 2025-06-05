import React from 'react'
import Image from 'next/image'

export function AppBanner() {
  return (
    <div className="w-full h-[120px] bg-green-800 border-b border-gray-200 py-4 px-6 flex items-center">
      <div className="max-w-7xl flex items-center gap-4">
        <Image
          src="/logo/logo_btl_tphcm.png"
          alt="logo"
          width={100}
          height={100}
          className=" object-contain"
        />
        <h2 className="text-2xl font-semibold text-white">
          Phần mềm Quản lý danh bạ và địa chỉ đơn vị LLVT Thành phố Hồ Chí Minh
        </h2>
      </div>
    </div>
  )
}
