import React from 'react'

const PageHeader = ({heading,back_color, img, tag,color,content}) => {
  return (
    <div className='page-header' style={{backgroundImage: `url(${img})`,backgroundColor:back_color}}>
        {tag === "h1" ? <h1 className={color==="white" && "!text-white"}>{heading}</h1> : <h2 className={color==="white" && "!text-white"}>{heading}</h2>}
        {
          content &&
          <p className='!text-white mt-2 lg:w-[70%] text-center'>
            {content}
          </p>
        }
    </div>
  )
}

export default PageHeader
