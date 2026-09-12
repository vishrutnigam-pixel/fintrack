import * as pdfjsLib from "pdfjs-dist";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface ExtractedPageText {
  pageNumber: number;
  text: string;
}

export async function extractTextFromProtectedPdf(
  fileBuffer: ArrayBuffer,
  password?: string
): Promise<{ success: boolean; pages?: ExtractedPageText[]; error?: string }> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
      password: password || "",
    });

    const pdfDocument = await loadingTask.promise;
    const extractedPages: ExtractedPageText[] = [];

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const textItems = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      extractedPages.push({
        pageNumber: pageNum,
        text: textItems,
      });
    }

    return { success: true, pages: extractedPages };
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error?.name === "PasswordException") {
      return {
        success: false,
        error: "PASSWORD_REQUIRED_OR_INVALID",
      };
    }
    return {
      success: false,
      error: error?.message || "Failed to parse PDF document",
    };
  }
}
