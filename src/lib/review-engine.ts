export type ReviewTone = "casual" | "formal" | "enthusiastic" | "short" | "desi";

export type ReviewSubcategory = {
  id: string;
  label: string;
  description: string;
  iconName?: "taste" | "service" | "ambience" | "recommend" | "quality" | "staff" | "pricing" | "doctor" | "equipment" | "comfort" | "speed" | "star";
};

export type BusinessCategoryType =
  | "FOOD_DINING"
  | "SALON_BEAUTY"
  | "RETAIL_SHOP"
  | "HEALTHCARE"
  | "FITNESS_GYM"
  | "HOSPITALITY_STAY"
  | "AUTO_REPAIR"
  | "GENERAL_BUSINESS";

export function detectBusinessCategoryType(
  category?: string | null,
  businessName?: string
): BusinessCategoryType {
  const text = `${category || ""} ${businessName || ""}`.toLowerCase();

  if (/food|restaurant|cafe|coffee|bakery|panipuri|chaat|bites|snack|dining|kitchen|dhaba|bar|pub|biryani|pizza|burger|chai|tea|sweets|mithai|cater/i.test(text)) {
    return "FOOD_DINING";
  }
  if (/salon|spa|beauty|parlour|parlor|hair|barber|nails|makeup|grooming|lash|skin/i.test(text)) {
    return "SALON_BEAUTY";
  }
  if (/retail|shop|store|mart|market|hardware|clothing|boutique|jewel|grocery|electronics|supermarket|appliances|stationery|optics|footwear/i.test(text)) {
    return "RETAIL_SHOP";
  }
  if (/health|clinic|doctor|hospital|dental|dentist|pharmacy|medical|physio|eye|care|ortho|chiro/i.test(text)) {
    return "HEALTHCARE";
  }
  if (/fitness|gym|yoga|workout|crossfit|trainer|sports|badminton|swimming|aerobics/i.test(text)) {
    return "FITNESS_GYM";
  }
  if (/hotel|resort|lodge|stay|homestay|guest house|motel|villa|inn/i.test(text)) {
    return "HOSPITALITY_STAY";
  }
  if (/car|auto|bike|garage|motor|repair|mechanic|detailing|tyre|tire|service center|wash/i.test(text)) {
    return "AUTO_REPAIR";
  }
  return "GENERAL_BUSINESS";
}

export function getBusinessSubcategories(
  category?: string | null,
  businessName?: string
): ReviewSubcategory[] {
  const type = detectBusinessCategoryType(category, businessName);

  switch (type) {
    case "FOOD_DINING":
      return [
        { id: "taste", label: "Taste & Quality", description: "Delicious food, fresh ingredients & authentic taste", iconName: "taste" },
        { id: "service", label: "Service & Hygiene", description: "Quick service, clean environment & polite team", iconName: "service" },
        { id: "ambience", label: "Ambience & Value", description: "Great atmosphere, pocket friendly & comfy setup", iconName: "ambience" },
        { id: "recommend", label: "Must Visit Spot", description: "Highly recommended to friends & family", iconName: "recommend" },
      ];
    case "SALON_BEAUTY":
      return [
        { id: "styling", label: "Styling & Service", description: "Expert hair styling, grooming & precision", iconName: "quality" },
        { id: "staff", label: "Staff & Hospitality", description: "Warm, polite & attentive professionals", iconName: "staff" },
        { id: "hygiene", label: "Cleanliness & Vibe", description: "Sanitized tools, relaxing & fresh ambiance", iconName: "ambience" },
        { id: "recommend", label: "Highly Recommended", description: "5-star salon experience worth repeating", iconName: "recommend" },
      ];
    case "RETAIL_SHOP":
      return [
        { id: "quality", label: "Quality & Variety", description: "Genuine products, vast collection & fresh stock", iconName: "quality" },
        { id: "staff", label: "Helpful Staff", description: "Patient assistance, honest guidance & fast billing", iconName: "staff" },
        { id: "pricing", label: "Pricing & Deals", description: "Fair rates, great discounts & value for money", iconName: "pricing" },
        { id: "recommend", label: "Trusted Store", description: "My go-to shop for all essentials", iconName: "recommend" },
      ];
    case "HEALTHCARE":
      return [
        { id: "treatment", label: "Care & Treatment", description: "Accurate diagnosis, gentle care & quick recovery", iconName: "doctor" },
        { id: "doctor", label: "Doctor & Consultation", description: "Listens patiently, explains clearly & reassuring", iconName: "staff" },
        { id: "cleanliness", label: "Hygiene & Team", description: "Spotless clinic, polite reception & smooth visit", iconName: "service" },
        { id: "recommend", label: "Highly Trusted", description: "Reliable healthcare you can trust wholeheartedly", iconName: "recommend" },
      ];
    case "FITNESS_GYM":
      return [
        { id: "equipment", label: "Equipment & Space", description: "Modern machines, spacious area & great hygiene", iconName: "equipment" },
        { id: "coaching", label: "Trainers & Support", description: "Motivating coaches, customized tips & guidance", iconName: "staff" },
        { id: "vibe", label: "Vibe & Atmosphere", description: "Energetic workout environment & great crowd", iconName: "ambience" },
        { id: "recommend", label: "Best Fitness Spot", description: "Top recommended place to achieve your goals", iconName: "recommend" },
      ];
    case "HOSPITALITY_STAY":
      return [
        { id: "comfort", label: "Room & Comfort", description: "Spacious, spotless rooms & peaceful sleep", iconName: "comfort" },
        { id: "hospitality", label: "Service & Staff", description: "Warm welcome, 24/7 helpful team & hospitality", iconName: "service" },
        { id: "location", label: "Location & Vibe", description: "Scenic views, convenient access & pleasant vibe", iconName: "ambience" },
        { id: "recommend", label: "Memorable Stay", description: "Worth every penny, definitely visiting again", iconName: "recommend" },
      ];
    case "AUTO_REPAIR":
      return [
        { id: "repair", label: "Work Quality & Fix", description: "Expert diagnostics, genuine parts & proper fix", iconName: "quality" },
        { id: "pricing", label: "Honest Pricing", description: "Transparent estimates, no hidden charges", iconName: "pricing" },
        { id: "speed", label: "Speed & Reliability", description: "Prompt delivery, dependable team & smooth work", iconName: "speed" },
        { id: "recommend", label: "Go-To Garage", description: "Best trusted place for complete vehicle care", iconName: "recommend" },
      ];
    default:
      return [
        { id: "overall", label: "Overall Experience", description: "Smooth process, exceeding expectations", iconName: "star" },
        { id: "service", label: "Customer Service", description: "Friendly, courteous & responsive team", iconName: "service" },
        { id: "quality", label: "Quality & Reliability", description: "Top-notch work, professional standards", iconName: "quality" },
        { id: "recommend", label: "Highly Recommended", description: "5-star recommendation to friends & colleagues", iconName: "recommend" },
      ];
  }
}

type GeneratorOptions = {
  businessName: string;
  category?: string | null;
  subcategoryId?: string;
  subcategoryLabel?: string;
  tone: ReviewTone;
  keywords?: string[];
  notes?: string;
  variation?: number;
};

// Rich template library organized by CategoryType -> Subcategory -> Tone -> Array of 3 reviews
type ReviewTemplateMap = Record<
  ReviewTone,
  (name: string, keywordStr: string, customNote: string) => [string[], string[]] // returns 2 alternative sets of 3 reviews
>;

const foodTemplates: Record<string, ReviewTemplateMap> = {
  taste: {
    desi: (name, kw, note) => [
      [
        `${name} ka taste sach me ekdum lajawab hai! Har bite me authentic aur fresh flavor milta hai. ${note ? note + ". " : ""}${kw ? "Khas taur pe " + kw + " bohot badhiya laga. " : ""}Pure 5 stars!`,
        `Food lovers ke liye ${name} ek must-visit place hai! Dishes bohot tasty aur perfect spices ke sath serve hoti hain. ${note || "Puri family ko yahan ka khana bohot pasand aaya."} 5/5 stars!`,
        `Bhai maza aa gaya! Itna fresh aur lajawab khana bohot kam jagah milta hai. ${name} never disappoints. Quality aur taste dono number one hain!`,
      ],
      [
        `${name} me khana kha ke dil khush ho gaya! Taste ekdum fresh aur flavorful hai. ${kw ? kw + " ka taste hamesha yaad rahega. " : ""}${note || "Har kisi ko zaroor try karna chahiye."}`,
        `Authentic aur super delicious! ${name} ka food taste me best hai aur portions bhi kaafi acche hain. Totally worth it, 5/5 stars!`,
        `Jab bhi yahan aao, consistent taste milta hai. ${name} food quality aur flavor ke mamle me sabse aage hai. Highly recommended to all foodies!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `Visited ${name} today and the food was absolutely delicious! Everything was fresh, full of flavor, and made with care. ${note ? note + ". " : ""}${kw ? "Especially loved the " + kw + ". " : ""}Definitely coming back soon!`,
        `The taste and quality at ${name} are simply unbeatable. Authentic flavors and super fresh ingredients in every bite. ${note || "Easily one of my favorite spots around!"} 5 stars!`,
        `Hands down one of the best dining experiences I've had! ${name} serves top-tier dishes bursting with flavor. Highly recommend checking it out!`,
      ],
      [
        `So glad I stopped by ${name}! The food exceeded all expectations—fresh, piping hot, and seasoned to perfection. ${note ? note + ". " : ""}Can't wait to visit again!`,
        `Consistently amazing flavors at ${name}. You can tell they use genuine, quality ingredients. ${kw ? "The " + kw + " was a standout highlight! " : ""}A solid 5/5!`,
        `Delicious food, generous portions, and great presentation! ${name} has truly perfected their craft. Highly recommended to everyone.`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `An absolute 10/10 culinary gem! ${name} blew me away with their incredible flavors and top-notch quality. ${note ? note + ". " : ""}${kw ? "The " + kw + " was out of this world! " : ""}You HAVE to try this place!`,
        `Hands down the best food in town! Every single dish at ${name} is bursting with flavor and passion. ${note || "I couldn't stop raving about it!"} Five massive stars!`,
        `Phenomenal food and unforgettable taste! ${name} is doing something truly special here. If you appreciate good food, don't miss this place!`,
      ],
      [
        `WOW! Just had the most incredible meal at ${name}. The flavors are fresh, vibrant, and thoroughly satisfying. ${note ? note + ". " : ""}Already planning my next visit!`,
        `Unbelievably good! ${name} hits the mark every single time with delicious food and generous portions. ${kw ? "Loved the " + kw + "! " : ""}100% recommended!`,
        `Pure food heaven! From the first bite to the last, ${name} delivered an extraordinary meal. Absolutely five stars!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Outstanding taste and fresh quality at ${name}! 5/5 stars.`,
        `Super delicious food with authentic flavors. Loved ${name}!`,
        `Fresh, flavorful, and generous portions. Highly recommended!`,
      ],
      [
        `Amazing food and consistent quality at ${name}. Will visit again!`,
        `Best taste around! Everything was fresh and super tasty.`,
        `Incredible food at great value. Top marks for ${name}!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `I had an exceptional dining experience at ${name}. The food was impeccably fresh, delightfully prepared, and authentically seasoned. Truly deserving of a 5-star rating.`,
        `The culinary standards at ${name} are commendable. Fresh ingredients, exquisite presentation, and consistent flavor profile throughout. Highly recommended.`,
        `Thoroughly impressed by the quality and attention to detail at ${name}. A sophisticated and deeply satisfying food experience.`,
      ],
      [
        `Consistently high standards and superb food quality at ${name}. Each course was thoughtfully prepared with great finesse. A well-deserved 5 stars.`,
        `An exemplary establishment offering authentic tastes and superior culinary standards. I gladly recommend ${name} to discerning diners.`,
        `Exceptional flavor balance and fresh preparation. ${name} stands out for its unwavering dedication to quality cuisine.`,
      ],
    ],
  },
  service: {
    desi: (name, kw, note) => [
      [
        `${name} me service bohot fast aur staff super polite hai. Hygiene aur cleanliness ka pura dhyaan rakha gaya hai jo dekh kar bohot accha laga! ${note ? note + ". " : ""}5 stars!`,
        `Cleanliness aur customer service dono top level hain ${name} me. Staff attentive hai aur orders time pe aate hain. Bohot hi badhiya experience raha!`,
        `Safe, hygienic aur respectful staff! ${name} me hygiene standards dekh kar tassalli ho gayi. ${note || "Staff ka behavior bohot welcoming tha."} Full 5 stars!`,
      ],
      [
        `Yahan ki quick service aur polite team ne dil jeet liya. ${name} me cleanliness ka khas khayal rakhte hain. Bohot hi accha experience!`,
        `Super fast service aur ekdum neat & clean setup! ${name} team delivers top quality with utmost hygiene. Highly recommended!`,
        `${name} ka staff bohot cooperative aur smiling hai. Food quickly serve hua aur cleanliness bilkul spotless thi. 5/5 stars!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `The staff at ${name} is so warm and welcoming! Service was prompt, and the place is spotless. ${note ? note + ". " : ""}${kw ? "Great " + kw + ". " : ""}Made our visit so pleasant!`,
        `Super impressed by the cleanliness and quick service at ${name}. The team takes genuine care of their customers. Definitely coming back!`,
        `Quick, polite, and very hygienic! ${name} pays great attention to cleanliness and prompt customer service. Highly recommend!`,
      ],
      [
        `Friendly faces and prompt service! The team at ${name} made us feel right at home. Spotless environment and great hygiene all around.`,
        `Fast service without compromising on care. The team at ${name} was attentive, respectful, and ensured everything was clean and fresh. 5 stars!`,
        `Loved how well-maintained and clean ${name} is. Staff attended to us quickly and with great courtesy. A wonderful experience!`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `World-class hospitality and lightning-fast service! The team at ${name} went above and beyond to make our visit unforgettable. Spotless and hygienic!`,
        `Incredible customer service! Warm, attentive, and super efficient team at ${name}. You can feel how much they care about their guests. 10/10!`,
        `Flawless service from start to finish! The staff at ${name} was welcoming, proactive, and kept everything immaculately clean. Five bright stars!`,
      ],
      [
        `Blown away by how fast and friendly the staff at ${name} was! Superb hygiene, great energy, and genuine care. Loved every moment!`,
        `Top-tier customer service! ${name} sets the gold standard for hospitality and cleanliness. Keep up the phenomenal work!`,
        `Super helpful, courteous, and fast! The team at ${name} made our experience completely effortless and delightful. Highly recommended!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Prompt service, clean environment, and friendly staff at ${name}!`,
        `Super hygienic and quick service. Welcoming team! 5/5.`,
        `Great staff, fast service, and spotless setup. Recommended!`,
      ],
      [
        `Courteous staff and quick order delivery at ${name}.`,
        `Very clean, fast, and polite service. 5 stars all the way!`,
        `Spotless hygiene and attentive team. Loved ${name}!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `Commendable service and exemplary hygiene standards at ${name}. The staff demonstrated genuine professionalism and promptness throughout. Highly recommended.`,
        `I was thoroughly impressed by the courtesy and attentiveness of the team at ${name}. The premises were impeccably maintained.`,
        `Outstanding professionalism, seamless service, and strict adherence to cleanliness. ${name} provides a superior customer experience.`,
      ],
      [
        `The staff at ${name} operates with admirable efficiency and warmth. The commitment to cleanliness and client satisfaction is evident.`,
        `A remarkably organized and hygienic establishment. Courteous staff and prompt attention to every detail make ${name} a standout.`,
        `Exemplary standards of customer care and cleanliness at ${name}. I wholeheartedly recommend their services.`,
      ],
    ],
  },
  ambience: {
    desi: (name, kw, note) => [
      [
        `${name} ka mahol bohot hi shant aur pleasant hai. Pricing bhi ekdum pocket-friendly hai. ${note ? note + ". " : ""}Doston aur family ke sath visit karne ke liye perfect place!`,
        `Sahi rate aur zabardast vibe! ${name} me aake relaxing feel hota hai. Budget friendly prices me high quality experience milta hai yahan. 5/5 stars!`,
        `Value for money place! ${name} ka ambience bohot accha hai aur rates bilkul reasonable hain. Sabhi ko zaroor visit karna chahiye!`,
      ],
      [
        `Great ambience aur peaceful vibe! ${name} me baithe ke sukoon milta hai aur billing bhi bilkul affordable hai. Full 5 stars!`,
        `Comfortable seating aur warm environment. ${name} pocket-friendly rates me premium experience deta hai. Loved it!`,
        `Family and friends ke sath chill karne ke liye ${name} best spot hai. Reasonable pricing aur great atmosphere!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `Loved the cozy atmosphere at ${name}! Great seating, pleasant vibes, and very reasonable prices. ${note ? note + ". " : ""}A fantastic spot to unwind!`,
        `Great vibes and even better value! ${name} offers a comfortable environment without breaking the bank. Definitely my new go-to place.`,
        `Wonderful ambience, clean seating, and pocket-friendly pricing at ${name}. You really get great value here. Highly recommend!`,
      ],
      [
        `Such a pleasant and inviting atmosphere at ${name}. Very relaxing vibe, fair prices, and great overall comfort. 5 stars!`,
        `Super cozy setup and very reasonably priced. ${name} is the ideal spot whether you're catching up with friends or having a quiet meal.`,
        `Great aesthetics, comfortable vibe, and honest pricing. ${name} delivers great value for every single rupee!`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `The vibe here is simply magical! ${name} combines a fantastic atmosphere with incredible value for money. Can't recommend this gem enough!`,
        `Obsessed with the atmosphere at ${name}! Cozy, beautifully maintained, and super pocket-friendly. A must-visit destination!`,
        `Unbeatable value and such a joyful vibe! ${name} is the perfect place to make memories with loved ones. Five huge stars!`,
      ],
      [
        `What a stunning and welcoming space! ${name} has created the perfect vibe, and the prices are unbelievable for the quality. 10/10!`,
        `Absolutely love the energy and comfort at ${name}! Perfect lighting, comfy setup, and wonderful value. Highly recommended!`,
        `Total gem of a place! Fantastic atmosphere and genuine value for money. ${name} is an absolute must-visit!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Great atmosphere and very affordable prices at ${name}!`,
        `Cozy vibe, fair pricing, and great setup. 5/5 stars.`,
        `Comfortable, pleasant ambiance, and pocket friendly. Loved it!`,
      ],
      [
        `Lovely setting and wonderful value for money at ${name}.`,
        `Charming vibe and very reasonable pricing. Recommended!`,
        `Relaxing environment and great value. A solid 5 stars!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `${name} offers an inviting, tasteful ambiance paired with competitive pricing. An ideal venue for casual and professional gatherings alike.`,
        `I appreciate the serene atmosphere and courteous hospitality at ${name}. High standards maintained at very fair value.`,
        `A well-curated environment combining comfort, elegance, and reasonable pricing. ${name} consistently delivers excellent value.`,
      ],
      [
        `Pleasant aesthetic and comfortable accommodations at ${name}. The pricing is fair and the ambiance is distinctly refined.`,
        `An aesthetically pleasing venue with a calming atmosphere. ${name} provides high quality and great value in equal measure.`,
        `Thoroughly enjoyed the tasteful environment and balanced pricing. ${name} is an asset to our local community.`,
      ],
    ],
  },
  recommend: {
    desi: (name, kw, note) => [
      [
        `${name} is truly a hidden gem! Agar aapne abhi tak visit nahi kiya to bohot kuch miss kar rahe hain. ${note || "Har cheez me 100% satisfaction milti hai."} 5/5 stars!`,
        `Meri taraf se ${name} ke liye highest recommendation! Quality, taste aur service sab me best hai. Doston ke sath zaroor visit karein!`,
        `Ek baar aayenge to baar baar aane ka mann karega. ${name} ne hamare pure group ka dil jeet liya. Definitely a 5-star place!`,
      ],
      [
        `${name} stands out for all the right reasons! Top-notch experience har baar. Kisi ko bhi recommend karne me sochna nahi padega!`,
        `Mera favorite spot ban chuka hai ${name}. Truly 5-star experience, aap log bhi zaroor visit karein!`,
        `Full marks to ${name}! Everything from taste to hospitality was top class. 100% recommended!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `If you haven't visited ${name} yet, you're truly missing out! Outstanding overall experience from start to finish. Easily 5 stars!`,
        `Can't say enough good things about ${name}! Great quality, wonderful people, and an all-round fantastic spot. Highly recommended!`,
        `I will definitely be recommending ${name} to all my friends and family. A genuine 5-star gem that deserves all the praise!`,
      ],
      [
        `Always a delight visiting ${name}. They never cut corners and always deliver a top-quality experience. 10/10 recommended!`,
        `A must-visit spot in the area! ${name} gets everything right. Looking forward to my next visit already.`,
        `Hands down one of the most reliable and enjoyable places around. Do yourself a favor and visit ${name}!`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `STOP WHAT YOU'RE DOING AND VISIT ${name}! Truly an unforgettable experience. They have earned a loyal customer for life! 10/10!`,
        `Hands down the best decision we made today was visiting ${name}! Absolutely phenomenal experience across the board. Five massive stars!`,
        `I am raving to everyone I know about ${name}! Stellar quality, heartwarming hospitality, and sheer perfection!`,
      ],
      [
        `An absolute triumph! ${name} is setting the standard that everyone else should follow. Do not hesitate to check them out!`,
        `One of those rare places where everything is 100% on point! Huge congratulations to ${name}. Deserves 10 stars!`,
        `I cannot recommend ${name} enthusiastically enough! You will leave with a huge smile. Simply the best!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Must-visit spot! Highly recommended to everyone. 5/5 stars.`,
        `One of my absolute favorites! Top marks for ${name}.`,
        `A true 5-star gem. You won't regret visiting ${name}!`,
      ],
      [
        `10/10 experience! Strongly recommend checking out ${name}.`,
        `Consistently amazing experience. Deserves all 5 stars!`,
        `My go-to spot! Highly recommend to friends and family.`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `I wholeheartedly endorse ${name}. Their steadfast dedication to quality and customer satisfaction is second to none. A true credit to the industry.`,
        `It is with great pleasure that I recommend ${name}. An establishment that consistently exceeds expectations and maintains highest standards.`,
        `A stellar operation with unwavering commitment to excellence. I confidently recommend ${name} to all discerning patrons.`,
      ],
      [
        `Outstanding across every metric. ${name} demonstrates rare consistency and dedication. A well-earned 5-star recommendation.`,
        `My experience at ${name} was nothing short of remarkable. I recommend their services without hesitation.`,
        `Exceptional quality, dependable consistency, and exemplary care. ${name} deserves highest commendation.`,
      ],
    ],
  },
};

const retailTemplates: Record<string, ReviewTemplateMap> = {
  quality: {
    desi: (name, kw, note) => [
      [
        `${name} me har product genuine aur best quality ka milta hai! Range aur variety bohot badi hai. ${note ? note + ". " : ""}${kw ? "Khas kar " + kw + " ki availability bohot acchi thi. " : ""}5/5 stars!`,
        `Shopping experience at ${name} was amazing! Saara saman ek hi jagah authentic aur durable quality me mil gaya. Highly recommended!`,
        `Trustworthy store! ${name} hamesha fresh stock aur genuine branded items rakhte hain. Quality me koi compromise nahi. Pure 5 stars!`,
      ],
      [
        `Bohot hi badhiya collection hai ${name} par. Har item high grade aur reliable hai. ${note || "Aage bhi yahi se shopping karenge."} 5/5 stars!`,
        `Top quality products aur wide variety! ${name} ne hamara shopping experience super easy bana diya. Highly recommended!`,
        `Har cheez standard aur authentic milti hai yahan. ${name} is definitely the best store in this area!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `Great variety and top quality at ${name}! Found everything I was looking for under one roof. ${note ? note + ". " : ""}Definitely my go-to store!`,
        `Super impressed by the collection at ${name}. Genuine items, well-organized displays, and reliable quality. Highly recommend!`,
        `Everything purchased from ${name} has been durable and top notch. Great selection and great overall shopping experience!`,
      ],
      [
        `Fantastic store with an impressive inventory! ${name} makes finding quality products effortless. 5 stars all the way!`,
        `Always satisfied with my purchases at ${name}. Excellent variety, trustworthy products, and fair deals.`,
        `High quality standards and great availability. You can shop at ${name} with total peace of mind.`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `Hands down the best store around! ${name} has an unbeatable collection of top-quality products. Absolutely five stars!`,
        `Blown away by the range and premium quality at ${name}! You won't find a better place to shop. 10/10 recommended!`,
        `The absolute benchmark for quality and variety! ${name} never fails to impress. Huge fan!`,
      ],
      [
        `Incredible selection! Found exactly what I needed in minutes at ${name}. Super high quality!`,
        `A true treasure trove! ${name} has the finest quality and selection in town. Five huge stars!`,
        `Outstanding! Quality, variety, and reliability all in one spot at ${name}. Highly recommended!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Top quality products and great variety at ${name}! 5/5.`,
        `Genuine items and great selection. Loved shopping here!`,
        `Best shop for authentic items. Highly recommended!`,
      ],
      [
        `Vast collection and reliable quality at ${name}.`,
        `Great stock, authentic goods, and seamless shopping. 5 stars!`,
        `My go-to store for quality essentials. Top marks!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `${name} maintains an extensive inventory of superior quality goods. The reliability and authenticity of their merchandise are exemplary.`,
        `A well-managed retail establishment offering authentic products and dependable standards. I highly recommend ${name}.`,
        `Impressed by the comprehensive range and high standards upheld by ${name}. Consistently reliable.`,
      ],
      [
        `Exemplary selection and steadfast commitment to product authenticity. ${name} is a credit to the retail sector.`,
        `Professional merchandising, transparent standards, and superior quality. A well-deserved 5 stars for ${name}.`,
        `I commend ${name} for maintaining authentic inventory and rigorous quality assurance.`,
      ],
    ],
  },
  staff: {
    desi: (name, kw, note) => [
      [
        `${name} ka staff bohot cooperative aur helpful hai! Sahi guidance dete hain aur patient ho ke sab dikhate hain. ${note ? note + ". " : ""}5/5 stars!`,
        `Bohot hi polite aur knowledgeable team hai ${name} me. Billing bhi fast hui aur customer support number one tha!`,
        `Customer friendly environment! Owner aur team dono bohot respectful hain. Aise shops pe baar baar aane ka mann karta hai. 5 stars!`,
      ],
      [
        `Staff ne hamari zarurat samajh kar best option suggest kiya. ${name} team ki hospitality lajawab hai!`,
        `Super helpful log hain ${name} me. Zero rush, honest advice aur quick service. Pure 5 stars!`,
        `Warm aur polite behavior! ${name} treats every customer with utmost respect and patience. Highly recommended!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `The team at ${name} was incredibly helpful and patient! Guided me to exactly what I needed without any pressure. Highly recommend!`,
        `Super friendly staff and quick checkout. They really know their inventory inside and out at ${name}. A solid 5-star experience!`,
        `Wonderful customer service! The staff at ${name} went out of their way to assist me. Very polite and knowledgeable.`,
      ],
      [
        `Great staff who are eager to help! Found what I needed in no time thanks to their guidance at ${name}.`,
        `Patient, courteous, and efficient staff at ${name}. Made the whole shopping experience smooth and enjoyable.`,
        `Pleasant and helpful service throughout my visit. The staff at ${name} deserves top marks!`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `World-class customer service! The team at ${name} treated me like VIP. Unmatched hospitality and support! 10/10!`,
        `The friendliest, most helpful staff you will ever meet! ${name} sets the gold standard for how customers should be treated!`,
        `Outstanding support! They answered all my questions with a smile and gave top-tier recommendations. Five stars!`,
      ],
      [
        `Such a wonderful, attentive team! ${name} made me feel so valued as a customer. Kudos to the entire staff!`,
        `Superstar service! Helpful, knowledgeable, and lightning fast. You guys rock at ${name}!`,
        `Customer service doesn't get better than this! Five enthusiastic stars for ${name}!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Very helpful and polite staff at ${name}! 5/5 stars.`,
        `Knowledgeable team and fast billing. Great service!`,
        `Friendly, courteous staff and easy shopping experience.`,
      ],
      [
        `Great customer support and honest advice at ${name}.`,
        `Staff was super courteous and prompt. Loved it!`,
        `Attentive team and smooth assistance. 5 stars!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `The staff at ${name} exhibits commendable professionalism, product knowledge, and courtesy. A seamless shopping experience.`,
        `I was thoroughly impressed by the patient assistance and expert guidance offered by the personnel at ${name}.`,
        `Exemplary customer assistance and efficient processing. ${name} demonstrates true dedication to client satisfaction.`,
      ],
      [
        `Courteous, knowledgeable, and responsive staff. ${name} sets high standards for customer care.`,
        `The team at ${name} provided attentive, professional guidance that was greatly appreciated. Highly recommended.`,
        `Commendable service standards and prompt, courteous interaction throughout. 5 stars.`,
      ],
    ],
  },
  pricing: {
    desi: (name, kw, note) => [
      [
        `${name} me rates market se kaafi reasonable aur competitive hain! Har item par fair price aur genuine quality milti hai. 5/5 stars!`,
        `Paisa vasool! ${name} par genuine saman affordable rates me milta hai. Koi hidden charges nahi, bilkul honest dealing.`,
        `Bohot hi reasonable pricing aur discounts! ${name} provides maximum value for money. Zaroor visit karein!`,
      ],
      [
        `Best prices in the market! ${name} balances premium quality with honest, transparent rates. 5 stars!`,
        `Budget-friendly aur high quality! Har khareedari par pura satisfaction milta hai ${name} se.`,
        `Honest pricing aur transparent billing! ${name} is the most reliable shop for fair deals.`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `Very reasonable pricing for top-quality goods at ${name}! Great value for money without any compromise on standards.`,
        `Fair prices and transparent billing. You always feel like you got a great deal at ${name}. Highly recommend!`,
        `Honest prices, great discounts, and excellent quality. ${name} gives you the best bang for your buck!`,
      ],
      [
        `Affordable prices for genuine products. ${name} keeps things honest and budget-friendly. 5 stars!`,
        `Great value across the entire range! Highly impressed with the fair pricing at ${name}.`,
        `Reliable, honest rates every single time. Shopping at ${name} is always cost-effective.`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `Unbeatable value for money! ${name} gives you premium quality at prices you just can't beat anywhere else!`,
        `The best deals in town! ${name} proves you don't have to overpay for genuine quality. Five stars all the way!`,
        `Incredible pricing and top-tier merchandise! You get so much more value at ${name}. 10/10!`,
      ],
      [
        `Best prices anywhere! ${name} delivers exceptional quality without burning a hole in your pocket!`,
        `Total value for money! Transparent, fair, and unbeatable discounts at ${name}. Five huge stars!`,
        `Phenomenal prices and genuine items! ${name} is the ultimate shopping destination!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Fair prices, genuine quality, and honest billing at ${name}!`,
        `Great value for money. Very reasonable rates! 5/5.`,
        `Best pricing and authentic merchandise. Recommended!`,
      ],
      [
        `Very affordable and transparent rates at ${name}.`,
        `Pocket-friendly prices and top quality. A solid 5 stars!`,
        `Great deals and honest pricing. Loved shopping here!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `${name} offers remarkably fair and competitive pricing alongside verified quality. A transparent and honorable enterprise.`,
        `Fair price points and transparent transactions characterize ${name}. An excellent destination for cost-effective value.`,
        `I appreciate the transparent pricing policy and dependable product standards maintained by ${name}.`,
      ],
      [
        `Competitive rates matched with uncompromising merchandise quality. ${name} delivers substantial value.`,
        `Honest commercial practices and balanced pricing at ${name}. Highly commendable.`,
        `A trustworthy establishment providing commendable value for investment. Five stars.`,
      ],
    ],
  },
  recommend: {
    desi: (name, kw, note) => [
      [
        `${name} is my trusted store for all needs! Authentic products, polite staff aur sahi rate. 100% recommended!`,
        `Aankh band karke trust kar sakte hain ${name} par. Har baar 5-star experience milta hai. Sabhi ko recommend karta hoon!`,
        `Area ki best shop hai ${name}. Sahi saman, sahi bhav aur honest dealing! Pure 5 stars!`,
      ],
      [
        `Mera favorite store ban chuka hai ${name}. Quality aur service dono me no compromise!`,
        `Har kisi ko ${name} zaroor visit karna chahiye. Truly 5-star retail store!`,
        `Always a pleasant experience at ${name}. 10/10 recommendation from my side!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `I highly recommend ${name} to anyone looking for genuine quality and dependable service. A true 5-star store!`,
        `Consistently great shopping experience at ${name}. Reliable, friendly, and honest. Can't ask for more!`,
        `My go-to store in town. ${name} never fails to deliver top quality and great support. Highly recommended!`,
      ],
      [
        `Always a breeze shopping at ${name}. Excellent service and trustworthy products. 5 stars!`,
        `Strongly recommend ${name}! They take pride in their work and treat customers with genuine care.`,
        `A fantastic store that earns 5 stars every single visit. Check out ${name} for yourself!`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `CANNOT RECOMMEND ${name} ENOUGH! Top quality, awesome staff, and unbeatable service. A complete 10/10!`,
        `The gold standard of retail shopping! ${name} is simply in a league of its own. Five stars!`,
        `Hands down the best place to shop! Tell your friends and family about ${name}!`,
      ],
      [
        `An absolute pleasure shopping at ${name}! Stellar quality and fantastic staff. Five stars!`,
        `Number one store in the city! You will love everything about ${name}!`,
        `Five massive stars for ${name}! Exceeded every single expectation!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Highly recommended store! 5/5 stars for ${name}.`,
        `My go-to trusted shop. Always a great experience!`,
        `Top marks for ${name}. Best store around!`,
      ],
      [
        `10/10 store! Great products and great people.`,
        `Strongly recommend visiting ${name}. You won't regret it!`,
        `Trusted, reliable, and top quality. 5 stars!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `I recommend ${name} with utmost confidence. Their consistent attention to quality, fair pricing, and customer satisfaction is exemplary.`,
        `An outstanding enterprise that upholds highest retail standards. A well-deserved 5-star endorsement for ${name}.`,
        `I am pleased to provide this positive recommendation for ${name}. Reliable, professional, and dedicated to excellence.`,
      ],
      [
        `Superior standards and commendable integrity make ${name} a standout establishment. Highly recommended.`,
        `An exceptional store that demonstrates unwavering consistency. Five stars.`,
        `Wholeheartedly endorsed for reliable quality and exemplary client service.`,
      ],
    ],
  },
};

// General fallback templates for other business types
const generalTemplates: Record<string, ReviewTemplateMap> = {
  overall: {
    desi: (name, kw, note) => [
      [
        `${name} ke sath experience bohot hi accha raha! Quality aur professional behavior dono first-class hain. ${note ? note + ". " : ""}Pure 5 stars!`,
        `${name} me har kaam time pe aur proper precision ke sath hota hai. Owner aur staff bohot supportive hain. Highly trusted!`,
        `Bohot hi genuine aur dependable service mili ${name} se. Har cheez transparent aur customer-friendly thi. 5/5 stars!`,
      ],
      [
        `${name} ne hamari expectations se bhi behtar deliver kiya. Staff ka behavior polite aur cooperative tha. Zaroor visit karein!`,
        `Totally satisfied with ${name}! Professionalism aur genuine approach dekh kar tassalli ho gayi. Highly recommended!`,
        `Saari requirements ko samajh kar best solution diya ${name} ne. Truly 5-star service aur great experience!`,
      ],
    ],
    casual: (name, kw, note) => [
      [
        `Had a fantastic experience with ${name}! Super professional, prompt, and easy to deal with. ${note ? note + ". " : ""}Definitely my go-to choice now!`,
        `Really happy with the quality and support at ${name}. Everything went smoothly from start to finish. Highly recommend!`,
        `Great communication, high quality, and very reliable service at ${name}. Deserves all 5 stars!`,
      ],
      [
        `Smooth and pleasant experience with ${name}. The team is knowledgeable, attentive, and genuinely cares about customer satisfaction.`,
        `So glad I chose ${name}! They delivered exactly what was promised with zero hassle. A solid 5-star experience!`,
        `Friendly, reliable, and very competent team at ${name}. Would gladly recommend them to anyone!`,
      ],
    ],
    enthusiastic: (name, kw, note) => [
      [
        `Exceptional experience with ${name}! From start to finish, they went above and beyond all expectations. 10/10 service!`,
        `Hands down the best in the business! ${name} is dependable, highly skilled, and thoroughly customer-focused. Five huge stars!`,
        `Blown away by the quality and attention to detail at ${name}! Truly an outstanding job, keep it up!`,
      ],
      [
        `Incredible work by ${name}! Fast, reliable, and completely stress-free. Could not have asked for a better experience!`,
        `The absolute gold standard! ${name} sets the bar high with their dedication and perfectionism. Highly, highly recommended!`,
        `100% satisfied! ${name} exceeded every single benchmark. An absolute pleasure to do business with!`,
      ],
    ],
    short: (name, kw, note) => [
      [
        `Smooth, reliable, and top quality service at ${name}! 5/5.`,
        `Super helpful team and great overall experience. Recommended!`,
        `Professional, fast, and high quality. 5 stars for ${name}!`,
      ],
      [
        `Great experience with ${name}. Very dependable and polite!`,
        `High quality work and prompt service. Highly recommended!`,
        `Top-notch standards and courteous team. 5/5 stars!`,
      ],
    ],
    formal: (name, kw, note) => [
      [
        `I had a thoroughly satisfactory experience engaging with ${name}. Their professionalism, efficiency, and attention to detail were exemplary.`,
        `${name} conducts business with utmost integrity and competence. Clear communication and superior deliverables throughout. Highly recommended.`,
        `A highly proficient establishment that adheres to rigorous standards of excellence. I commend ${name} for their outstanding service.`,
      ],
      [
        `Exceptional proficiency and client care demonstrated by ${name}. It is refreshing to work with such dedicated professionals.`,
        `Consistently dependable, courteous, and precise. ${name} is an exemplary organization worthy of a 5-star rating.`,
        `I was deeply impressed by the high standards and clear communication maintained by ${name}. Highly recommended.`,
      ],
    ],
  },
};

export function generateCategoryReviews(options: GeneratorOptions): string[] {
  const {
    businessName,
    category,
    subcategoryId = "overall",
    tone = "casual",
    keywords = [],
    notes = "",
    variation = 0,
  } = options;

  const name = businessName.trim() || "this business";
  const catType = detectBusinessCategoryType(category, businessName);
  const keywordStr = keywords.slice(0, 3).join(", ");
  const customNote = notes.trim().replace(/[.!?\s]+$/, "");

  // Select appropriate template map based on category type
  let sourceMap = foodTemplates;
  if (catType === "RETAIL_SHOP") {
    sourceMap = retailTemplates;
  } else if (catType !== "FOOD_DINING") {
    sourceMap = generalTemplates;
  }

  // Find subcategory template or fallback to first available
  const subcatKeys = Object.keys(sourceMap);
  const key = sourceMap[subcategoryId] ? subcategoryId : (subcatKeys[0] || "overall");
  const toneMap = sourceMap[key] || generalTemplates.overall;
  const toneHandler = toneMap[tone] || toneMap.casual;

  const [set1, set2] = toneHandler(name, keywordStr, customNote);
  // Choose set based on variation index
  const chosenSet = (variation % 2 === 0) ? set1 : set2;

  return chosenSet;
}

// Backward-compatible function for existing code
export function generateReviewSuggestions(
  businessName: string,
  experience: string,
  tone: ReviewTone,
): string[] {
  return generateCategoryReviews({
    businessName,
    notes: experience,
    tone,
  });
}

export function formatGoogle5StarUrl(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    // If it is a Google local writereview link, ensure 5-star parameter is appended if possible
    if (parsed.hostname.includes("google.") && parsed.pathname.includes("writereview")) {
      if (!parsed.searchParams.has("review_stars")) {
        parsed.searchParams.set("review_stars", "5");
      }
      return parsed.toString();
    }
  } catch {
    // Return original if parsing fails
  }
  return url;
}
