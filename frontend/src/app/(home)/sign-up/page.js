import React, { Suspense } from 'react'
import SignUp from './SignUp'

export const metadata = {
  alternates: {
    canonical: `https://www.iconperfumes.in/sign-up/`,
  }
};

const page = () => {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
        <div className="loader-circle">
          <span className="loader"></span>
        </div>
      </div>
    }>
      <SignUp />
    </Suspense>
  )
}

export default page
