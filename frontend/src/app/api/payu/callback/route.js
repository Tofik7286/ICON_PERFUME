export const dynamic = "force-dynamic";

function resolveBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_WEB_URL) return process.env.NEXT_PUBLIC_WEB_URL;
  if (process.env.DOMAIN) return `https://${process.env.DOMAIN}`;
  return new URL(req.url).origin;
}

export async function POST(req) {
  const base = resolveBaseUrl(req);

  try {
    const formData = await req.formData();
    const txnid = formData.get("txnid") || "";
    const hash = formData.get("hash") || "";
    const payuStatus = (formData.get("status") || "").toString().toLowerCase();
    const mihpayid = formData.get("mihpayid") || "";

    const mappedStatus = payuStatus === "success" ? "success" : "failed";

    console.log("payu.callback_recv", { txnid, status: payuStatus, mihpayid });

    const target = `${base}/payment-process/?txnid=${encodeURIComponent(
      txnid
    )}&hash=${encodeURIComponent(hash)}&status=${mappedStatus}`;

    console.log("payu.callback_redirect", { txnid, mappedStatus, base });

    return Response.redirect(target, 303);
  } catch (err) {
    console.error("payu.callback_error", err);
    return Response.redirect(`${base}/payment-process/?status=failed`, 303);
  }
}
