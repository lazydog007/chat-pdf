type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  return (
    <iframe
      src={`http://docs.google.com/gview?url=${pdf_url}&embedded=true`}
      className="w-full h-full"
    />
  );
};

export default PDFViewer;
