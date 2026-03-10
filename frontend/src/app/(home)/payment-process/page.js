'use client'
import React, { Suspense } from 'react'
import PaymentSuccess from './PaymentSuccess'

const page = () => {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
        <div className="loader-circle">
          <span className="loader"></span>
        </div>
      </div>
    }>
      <PaymentSuccess />
    </Suspense>
  )
}

export default page

