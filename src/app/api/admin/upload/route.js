import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await connectDB();
    const settings = await Setting.findOne({ key: "general_settings" }).lean();

    const contentType = request.headers.get("content-type") || "";

    // Check if this is a test request or standard upload
    let fileToUpload = null;
    let base64ToUpload = null;
    let customApiKey = null;
    let isTest = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      fileToUpload = formData.get("image");
      if (formData.get("action") === "test") {
        isTest = true;
      }
      if (formData.get("apiKey")) {
        customApiKey = formData.get("apiKey").toString().trim();
      }
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      base64ToUpload = body.image;
      if (body.action === "test") {
        isTest = true;
      }
      if (body.apiKey) {
        customApiKey = body.apiKey.trim();
      }
    }

    const apiKey = customApiKey || settings?.imgbb?.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ImgBB API key is not configured. Please add your API key in Admin Settings > ImgBB Storage.",
        },
        { status: 400 }
      );
    }

    // Handle Test Request
    if (isTest) {
      // 1x1 transparent GIF to verify API key
      const testPixel = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      const testForm = new FormData();
      testForm.append("image", testPixel);

      const testRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          body: testForm,
        }
      );

      const testData = await testRes.json();
      if (testRes.ok && testData?.success) {
        return NextResponse.json({
          success: true,
          message: "ImgBB API Key verified successfully!",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message:
              testData?.error?.message ||
              "Failed to verify ImgBB API Key. Please check the key.",
          },
          { status: 400 }
        );
      }
    }

    // Build base64 string (same format as ImgBB docs:
    // curl -X POST "https://api.imgbb.com/1/upload?key=KEY" --form "image=<base64>")
    let base64Image = "";

    if (fileToUpload && typeof fileToUpload === "object" && "arrayBuffer" in fileToUpload) {
      const buffer = Buffer.from(await fileToUpload.arrayBuffer());
      base64Image = buffer.toString("base64");
    } else if (base64ToUpload && typeof base64ToUpload === "string") {
      // Strip potential base64 prefix e.g. data:image/png;base64,
      base64Image = base64ToUpload.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, "");
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "No image file provided for upload.",
        },
        { status: 400 }
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append("image", base64Image);

    // Send to ImgBB API (no expiration → image is stored permanently)
    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: imgbbFormData,
      }
    );

    const imgbbData = await imgbbRes.json();

    if (!imgbbRes.ok || !imgbbData.success) {
      console.error("ImgBB API error:", imgbbData);
      const code = imgbbData?.error?.code;
      return NextResponse.json(
        {
          success: false,
          message:
            code === 103
              ? "ImgBB blocked this server's IP address (code 103). Try another network/VPN or deploy the server, then retry."
              : code === 100
              ? "Invalid ImgBB API key. Please update it in Settings > ImgBB Storage."
              : imgbbData?.error?.message ||
                "ImgBB upload failed. Please check your ImgBB API key in Settings.",
          details: imgbbData,
        },
        { status: 400 }
      );
    }

    const uploadedUrl =
      imgbbData.data?.url ||
      imgbbData.data?.display_url ||
      imgbbData.data?.image?.url;

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      display_url: imgbbData.data?.display_url || uploadedUrl,
      title: imgbbData.data?.title,
      id: imgbbData.data?.id,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
