import React, { Suspense } from 'react'
import ResetPassword from './ResetPassword'

export const metadata = {
    alternates: {
        canonical: `https://www.iconperfumes.in/login/reset-password/`,
    }
};

const page = ({ params }) => {
    
    const token = params.token

    return (
        <Suspense fallback={
            <div className="d-flex align-items-center justify-content-center flex-col" style={{ height: "100vh" }}>
                <div className="loader-circle">
                    <span className="loader"></span>
                </div>
            </div>
          }>
            <ResetPassword token={token} />
        </Suspense>
    )
}

export default page
