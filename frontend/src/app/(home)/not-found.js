import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="d-flex align-items-center w-100 justify-content-center flex-col" style={{ height: "100vh" }}>
            <div className="not-found">
                <img src={"/images/not_found.jpg"} className='img-fluid' alt='Page not found' />
                <h2>404</h2>
                <p>Page Not Found</p>
                <Link href={"/"} style={{ textDecoration: "underline !important" }}>Return Home</Link>
            </div>
        </div>
    )
}