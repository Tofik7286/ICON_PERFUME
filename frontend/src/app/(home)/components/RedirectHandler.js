"use client"; // For Next.js 13+ with App Router
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation"; // Use `next/router` for Pages Router
import { clearRedirect } from "../redux/redirectSlice";

const RedirectHandler = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const redirectTo = useSelector((state) => state.redirect.redirectTo);
  const pathname = usePathname(); 

  useEffect(() => {
    if (redirectTo) {
      router.push(`${redirectTo}?redirect=${pathname}`); // Redirect to the stored URL
      dispatch(clearRedirect()); // Clear the redirect state after navigation
    }
  }, [redirectTo, router, dispatch]);

  return null; // No UI, just handling redirection
};

export default RedirectHandler;
