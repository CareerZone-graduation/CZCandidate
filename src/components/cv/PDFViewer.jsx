import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

/**
 * PDF Viewer Component
 * Displays PDF with navigation and zoom controls
 */
const PDFViewer = ({ pdfUrl, onDownload, fileName = 'cv.pdf' }) => {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [pageNumber, setPageNumber] = useState(1);

    // Reset page number when PDF changes
    React.useEffect(() => {
        setPageNumber(1);
    }, [pdfUrl]);


    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const onDocumentLoadError = (error) => {
        console.error('Error loading PDF:', error);
    };

    const goToPrevPage = () => {
        setPageNumber((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setPageNumber((prev) => Math.min(prev + 1, numPages));
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 2.0));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5));
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-700 min-w-[100px] text-center">
                        Trang {pageNumber} / {numPages || '...'}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-700 min-w-[60px] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 2.0}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>

                <Button variant="default" size="sm" onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                </Button>
            </div>

            {/* PDF Display */}
            <div className="flex-1 overflow-auto p-4 flex justify-center">
                <Document
                    key={pdfUrl}
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Đang tải PDF...</span>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                    />
                </Document>
            </div>
        </div>
    );
};

export default PDFViewer;
