// Curated selection for the landing page gallery — real photos only, chosen
// from the WeChat export in public/landing/. Excludes the two images already
// used elsewhere on the page (hero-recital.jpg, portrait-headshot.jpg).
// width/height are the source files' native pixel dimensions.
//
// `variant` drives the editorial bento layout in LandingGallery.jsx (replaces
// the previous uniform 3-col grid of identically-cropped squares). The order
// here is also the visual order: performance-hall leads as the feature tile
// (a recital-hall photo reads as stronger "proof" than shop/logistics shots),
// followed by two tall portrait-orientation shots beside it, then a wide shot
// and two standard tiles closing the row below.
export const galleryImages = [
  {
    src: '/landing/gallery-performance-hall.jpg',
    alt: 'Elle performing violin on stage at a recital hall, accompanied by piano.',
    caption: 'Recital Hall',
    width: 1206,
    height: 789,
    variant: 'feature',
  },
  {
    src: '/landing/gallery-camp-helping.jpg',
    alt: 'Elle helping younger students carry their violin cases into the lesson room.',
    caption: 'Camp Day',
    width: 1280,
    height: 1707,
    variant: 'tall',
  },
  {
    src: '/landing/gallery-teaching-student.jpg',
    alt: 'Elle helping a young student rest her violin correctly on her shoulder.',
    caption: 'Hands-On Teaching',
    width: 1280,
    height: 1707,
    variant: 'tall',
  },
  {
    src: '/landing/gallery-violin-shop.jpg',
    alt: 'Rows of violins hanging on display at the violin shop where students pick out their own instrument on the first day of camp.',
    caption: 'Choosing a Violin',
    width: 1707,
    height: 1280,
    variant: 'wide',
  },
  {
    src: '/landing/gallery-violin-detail.jpg',
    alt: "Close-up of a violin's bridge and strings.",
    caption: 'Fine Details',
    width: 1280,
    height: 1707,
    variant: 'standard',
  },
  {
    src: '/landing/gallery-camp-group.jpg',
    alt: 'Elle standing with a group of camp students, each holding their violin case, before a lesson.',
    caption: 'The Group',
    width: 1707,
    height: 1280,
    variant: 'standard',
  },
]
