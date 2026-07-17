import { galleryImages } from './galleryImages.js'

// Replaces the previous flat, uniform 3-col grid of identically-cropped
// squares with an editorial bento layout — a large feature tile plus varied
// tile sizes, reading as curated rather than auto-generated (ui-ux-pro-max
// "Portfolio Grid" pattern: masonry-style project grid, not a uniform
// thumbnail wall).
//
// On mobile each `variant` gets a fixed aspect-ratio wrapper (natural
// document flow). At md+, the grid switches to 4 columns with a fixed
// auto-row height and col/row spans per variant instead — CSS Grid's default
// (sparse, row-first) auto-placement lays the two `feature`+`tall` rows out
// exactly as intended purely from source order, so no explicit
// grid-column/grid-row placement is needed:
//   md: [ feature(2x2) ][ tall(1x2) ][ tall(1x2) ]  <- fills all 4 cols x 2 rows
//       [   wide(2x1)  ][standard(1x1)][standard(1x1)] <- fills 4 cols x 1 row
const variantClasses = {
  feature: 'col-span-2 aspect-[16/10] md:aspect-auto md:row-span-2',
  tall: 'col-span-1 aspect-[3/4] md:aspect-auto md:row-span-2',
  wide: 'col-span-2 aspect-[2/1] md:aspect-auto md:row-span-1',
  standard: 'col-span-1 aspect-square md:aspect-auto md:row-span-1',
}

export default function LandingGallery() {
  return (
    <section className="mx-auto w-full max-w-(--content-max-width) px-5 py-16 [--content-max-width:64rem] sm:py-20">
      <h2 className="m-0 mb-8 text-[clamp(1.875rem,1.5rem+1.5vw,2.75rem)] leading-tight font-extrabold tracking-tight text-balance sm:mb-10">
        A few moments together
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:auto-rows-[12rem] lg:auto-rows-[14rem]">
        {galleryImages.map((image) => (
          <figure
            key={image.src}
            className={`relative m-0 overflow-hidden rounded-md shadow-sm ${variantClasses[image.variant]}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-200 ease-out hover:scale-105"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}
