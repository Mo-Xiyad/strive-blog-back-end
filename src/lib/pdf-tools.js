import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";
const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export const getPDFReadableStream = async (blog) => {
  let imagePart = {};
  if (blog.cover) {
    const response = await axios.get(blog.cover, {
      responseType: "arraybuffer",
    });
    const blogCoverURLParts = blog.cover.split("/");
    const fileName = blogCoverURLParts[blogCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }

  const docDefinition = {
    content: [
      imagePart,
      { text: blog.title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: striptags(blog.content), lineHeight: 2 },
    ],
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);

  pdfReadableStream.end();
  return pdfReadableStream;
};

/* ================================================================= */

// export const getPDFReadableStreamFunc = (data) => {
//   const fonts = {
//     Helvetica: {
//       normal: "Helvetica",
//       bold: "Helvetica-Bold",
//     },
//   };

//   const printer = new PdfPrinter(fonts);

//   const docDefinition = {
//     content: [
//       data.post.title,
//       data.post.author.name,
//       data.post.createdAt,
//       data.post.content,
//     ],

//     defaultStyle: {
//       font: "Helvetica",
//     },
//     // ...
//     images: {
//       cover: data.post.author.avatar,
//     },
//   };

//   const options = {
//     // ...
//   };

//   const pdfReadableStream = printer.createPdfKitDocument(
//     docDefinition,
//     options
//   );

//   pdfReadableStream.end();
//   return pdfReadableStream;
// };
