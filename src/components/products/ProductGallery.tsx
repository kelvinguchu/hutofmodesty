import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, ImageIcon } from "lucide-react";

interface ProductImage {
  url: string;
  alt?: string;
}

interface ColorVariation {
  color: string;
  colorCode: string;
  image: {
    url: string;
  };
  additionalImages?: Array<{
    image: {
      url: string;
    };
  }>;
}

interface ProductGalleryProps {
  mainImage: ProductImage | null;
  additionalImages?: ProductImage[];
  productName: string;
  colorVariations?: ColorVariation[];
  selectedColorCode?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  mainImage,
  additionalImages = [],
  productName,
  colorVariations = [],
  selectedColorCode,
}) => {
  // State to track the main displayed image
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    mainImage?.url || null
  );
  const [isZoomed, setIsZoomed] = useState(false);

  // Get the currently selected color variation
  const selectedVariation = selectedColorCode
    ? colorVariations.find((c) => c.colorCode === selectedColorCode)
    : null;

  // Determine which images to display based on selected color
  const displayImages = React.useMemo(() => {
    // If a color is selected, use that color's images
    if (selectedVariation) {
      const variationImages = [
        {
          url: selectedVariation.image.url,
          alt: `${productName} - ${selectedVariation.color}`,
        },
      ];

      // Add additional images for this color variation if they exist
      if (
        selectedVariation.additionalImages &&
        selectedVariation.additionalImages.length > 0
      ) {
        selectedVariation.additionalImages.forEach((img, index) => {
          variationImages.push({
            url: img.image.url,
            alt: `${productName} - ${selectedVariation.color} view ${index + 1}`,
          });
        });
      }

      return variationImages;
    }

    // Otherwise use the default main image and additionalImages
    const images: ProductImage[] = [];
    if (mainImage) {
      images.push(mainImage);
    }

    // Add unique additional images
    additionalImages.forEach((img) => {
      if (!images.some((existing) => existing.url === img.url)) {
        images.push(img);
      }
    });

    return images;
  }, [mainImage, additionalImages, selectedVariation, productName]);

  // Reset active image when color changes
  React.useEffect(() => {
    if (selectedVariation && selectedVariation.image) {
      setActiveImageUrl(selectedVariation.image.url);
    } else if (mainImage) {
      setActiveImageUrl(mainImage.url);
    }
  }, [selectedVariation, mainImage]);

  // Handle click on thumbnail
  const handleThumbnailClick = (imageUrl: string) => {
    setActiveImageUrl(imageUrl);
  };

  // Handle zoom toggle
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // Determine the main image to display
  const currentMainImage = activeImageUrl || displayImages[0]?.url || null;

  return (
    <div className='w-full md:w-1/2 space-y-4'>
      {/* Main Product Image */}
      <div className='relative group'>
        <div className='relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-lg'>
          {currentMainImage ? (
            <>
              <Image
                src={currentMainImage}
                alt={productName}
                fill
                className={`object-contain p-4 transition-transform duration-300 ${
                  isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
                }`}
                sizes='(max-width: 768px) 100vw, 50vw'
                priority
                onClick={toggleZoom}
              />
              {/* Zoom indicator */}
              <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                <div className='bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg'>
                  <ZoomIn className='w-5 h-5 text-gray-700' />
                </div>
              </div>
              {/* Image counter */}
              {displayImages.length > 1 && (
                <div className='absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium'>
                  {displayImages.findIndex(
                    (img) => img.url === currentMainImage
                  ) + 1}{" "}
                  / {displayImages.length}
                </div>
              )}
            </>
          ) : (
            <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-100'>
              <ImageIcon className='w-16 h-16 text-gray-400 mb-3' />
              <span className='text-gray-500 font-medium'>
                No image available
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Gallery - Only show if we have additional unique images */}
      {displayImages.length > 1 && (
        <div className='space-y-3'>
          <h4 className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
            <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
            More Views
          </h4>
          <div className='grid grid-cols-4 sm:grid-cols-5 gap-3'>
            {displayImages.slice(0, 8).map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square overflow-hidden border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  image.url === currentMainImage
                    ? "border-purple-500 ring-2 ring-purple-200 shadow-lg scale-105"
                    : "border-gray-300 hover:border-purple-400 hover:shadow-md hover:scale-102"
                } bg-gradient-to-br from-gray-50 to-gray-100`}
                onClick={() => handleThumbnailClick(image.url)}>
                <Image
                  src={image.url}
                  alt={image.alt || `${productName} - view ${index + 1}`}
                  fill
                  className='object-contain p-2'
                  sizes='(max-width: 640px) 25vw, 20vw'
                />
                {/* Active indicator */}
                {image.url === currentMainImage && (
                  <div className='absolute inset-0 bg-purple-500/10 border-2 border-purple-500 rounded-lg'></div>
                )}
              </div>
            ))}
            {/* Show more indicator if there are more than 8 images */}
            {displayImages.length > 8 && (
              <div className='relative aspect-square overflow-hidden border-2 border-gray-300 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
                <div className='text-center'>
                  <span className='text-2xl font-bold text-gray-600'>
                    +{displayImages.length - 8}
                  </span>
                  <p className='text-xs text-gray-500 mt-1'>More</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color indicator if color is selected */}
      {selectedVariation && (
        <div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-700'>
              Current Color:
            </span>
            <div className='flex items-center gap-2'>
              <div
                className='w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm'
                style={{ backgroundColor: selectedVariation.colorCode }}></div>
              <span className='text-sm font-semibold text-gray-900'>
                {selectedVariation.color}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
