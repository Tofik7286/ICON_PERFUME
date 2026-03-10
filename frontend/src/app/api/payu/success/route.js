export const config = {
    api: { bodyParser: false },
};
  
export async function POST(req) {
    const formData = await req.formData();
    const txnid = formData.get("txnid");
    const hash = formData.get("hash");
    const status = formData.get("status");
  
    // Redirect user to payment process page
    return Response.redirect(
      `/payment-process/?txnid=${txnid}&hash=${hash}&status=${status}`,
      302
    );
  }
  