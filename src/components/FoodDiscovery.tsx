import { useState } from "react";
import { Coffee, Flame, Heart, Info, MapPin, Sparkles, Utensils, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FoodDiscoveryProps {
  city: string;
}

// Culinary database for all 5 cities
const FOOD_DB: Record<string, {
  dishName: string;
  jpName?: string;
  arName?: string;
  tagline: string;
  steamIntensity: number; // 1 to 3
  ingredients: string[];
  story: string;
  restaurants: { name: string; style: string; reason: string }[];
  accentColor: string;
}[]> = {
  Tokyo: [
    {
      dishName: "Teuchi Soba (Hand-cut Buckwheat)",
      jpName: "手打ち蕎麦",
      tagline: "Edo-period merchant fuel crafted with rhythmic stone milling",
      steamIntensity: 2,
      ingredients: ["Buckwheat flour (Sobako)", "Dashi broth (Bonito & Kombu)", "Mirin", "Sake-aged soy sauce"],
      story: "Soba rose to massive popularity during the Edo period (1603-1867) in merchant neighborhoods. Merchants would slurp noodles at rapid-paced wooden carts as an auspicious tradition at the end of every month. The pure elasticity of buckwheat signifies longevity.",
      restaurants: [
        { name: "Yanaka Soba-ya", style: "Artisan wooden noodle house", reason: "The chef mills buckwheat by hand each morning in the front window." },
        { name: "Kanda Matsuya", style: "Historic 1884 tavern", reason: "Famous for classic wooden booth dining and hot dashi-soaked duck soba." }
      ],
      accentColor: "from-amber-600 to-yellow-500"
    },
    {
      dishName: "Edomae Nigiri Sushi",
      jpName: "江戸前寿司",
      tagline: "Quick-cured coastal bay seafood on warm vinegared grains",
      steamIntensity: 1,
      ingredients: ["Marinated Bluefin Tuna", "Aged Red Rice Vinegar (Akazu)", "Fresh Wasabi root", "Sumida Bay sea salt"],
      story: "Before refrigeration, Edo sushi was sold as quick street food near Tokyo bay. Fish was quickly simmered in soy sauce or cured in vinegar, packed into vinegared rice balls, and consumed by busy handcart pullers standing near docks.",
      restaurants: [
        { name: "Sushi Dai (Toyosu)", style: "Fish market counter", reason: "Watch master sushi makers press the morning catch directly in front of you." },
        { name: "Sukiyabashi Jiro", style: "Legendary temple of craft", reason: "The world's most disciplined study of sushi temperature and pressure control." }
      ],
      accentColor: "from-red-600 to-pink-500"
    }
  ],
  Cairo: [
    {
      dishName: "Koshary (The Street Harmony)",
      arName: "كشري",
      tagline: "A multi-layered cultural mosaic of Egyptian grains",
      steamIntensity: 3,
      ingredients: ["Brown lentils", "Egyptian rice", "Macaroni elbow pasta", "Crispy fried onions", "Spicy tomato-garlic vinegar sauce"],
      story: "Originating as a dynamic mixing of surplus pantry ingredients in working-class neighborhoods, Koshary represents multicultural Cairo. It is an extraordinary convergence of Egyptian grain, Italian pasta, and Indian spices.",
      restaurants: [
        { name: "Koshary Abou Tarek", style: "Multi-story local institution", reason: "Lively, neon-lit Cairo landmark serving massive metal plates of steaming koshary." },
        { name: "El Tahrir Koshary", style: "Fast-paced downtown favorite", reason: "Legendary vinegar splash and lightning-speed plate presentation." }
      ],
      accentColor: "from-orange-600 to-yellow-500"
    },
    {
      dishName: "Ful Medames (Fava Bean Stew)",
      arName: "فول مدمس",
      tagline: "Pharaonic slow-cooked fava beans with olive oil and cumin",
      steamIntensity: 2,
      ingredients: ["Broad fava beans", "Garlic cloves", "Cold-pressed extra virgin olive oil", "Ground Cumin", "Flat baladi bread"],
      story: "Ful dates back to the era of the Pharaohs. It was traditionally cooked overnight in massive copper cauldrons buried in hot bathhouse embers, providing slow-burning nutrition to generations of pyramid builders and builders of Cairo.",
      restaurants: [
        { name: "Zooba (Zamalek)", style: "Modern gourmet street food", reason: "Serves beautifully spiced Ful with freshly baked baladi flatbread." },
        { name: "Ful El Gahsh", style: "Historic alleyway cart", reason: "No-frills breakfast cart beloved by Cairo taxi drivers for 50 years." }
      ],
      accentColor: "from-amber-600 to-orange-500"
    }
  ],
  Jaipur: [
    {
      dishName: "Dal Baati Churma",
      tagline: "Desert war fuel consisting of ghee-soaked baked wheat balls and lentil stew",
      steamIntensity: 3,
      ingredients: ["Coarse whole wheat flour", "Spiced five-lentil curry (Panchmel Dal)", "Desi Ghee (Clarified Butter)", "Crushed sweet wheat (Churma)"],
      story: "Baati was invented during the founding of Mewar kingdom. Soldiers would bury chunks of dough in desert sand under the sun before heading into battle. By evening, they returned to find perfectly baked balls ready to be soaked in ghee.",
      restaurants: [
        { name: "Laxmi Mishthan Bhandar (LMB)", style: "Historic sweet & meal court", reason: "Famous for royal platters with traditional dousing of pure Rajasthani ghee." },
        { name: "Chokhi Dhani", style: "Immersive ethnic craft village", reason: "Provides meals on floor leaf mats served by local community hosts singing folk hymns." }
      ],
      accentColor: "from-pink-600 to-orange-500"
    },
    {
      dishName: "Pyaaz Kachori",
      tagline: "Flaky golden pastry puffed with spiced caramelized onions",
      steamIntensity: 2,
      ingredients: ["Caramelized red onions", "Fennel seeds", "Coriander seeds", "Gram flour", "Deep fried pastry casing"],
      story: "An absolute staple of Jaipur's morning street food routine. Master fryers cook massive woks of kachoris in Johari Bazaar, timing the spices to perfectly counter the heavy morning desert fog.",
      restaurants: [
        { name: "Rawat Mishthan Bhandar", style: "Bustling confectionary palace", reason: "Supplies thousands of piping-hot crispy kachoris to travelers each hour." },
        { name: "Sodhani Sweets", style: "Neighborhood morning court", reason: "Lighter onion seasoning paired with spicy mint-tamarind chutney." }
      ],
      accentColor: "from-yellow-600 to-red-500"
    }
  ],
  Rome: [
    {
      dishName: "Spaghetti alla Carbonara",
      tagline: "The velvety Roman synthesis of cured jowl and aged cheese",
      steamIntensity: 2,
      ingredients: ["Guanciale (Cured pork jowl)", "Fresh egg yolks", "Aged Pecorino Romano", "Freshly cracked black pepper"],
      story: "Controversially claimed to be created either by charcoal miners ('Carbonari') cooking high-calorie fuel over wood fires, or from post-war alliances combining Roman ingredients with powdered egg rations from allied troops.",
      restaurants: [
        { name: "Da Enzo al 29", style: "Tiny Trastevere trattoria", reason: "Extremely rich sauce with perfectly thick-cut, crispy guanciale cubes." },
        { name: "Roscioli Salumeria", style: "Delicatessen & wine cellar", reason: "An absolute masterclass in raw ingredient vetting and cheese emulsification." }
      ],
      accentColor: "from-amber-700 to-yellow-600"
    },
    {
      dishName: "Tonnarelli Cacio e Pepe",
      tagline: "The minimalist shepherd classic of starch-water and black pepper",
      steamIntensity: 2,
      ingredients: ["Handcrafted egg pasta (Tonnarelli)", "Finely grated Pecorino Romano", "Crushed whole black peppercorns", "Starch-rich pasta boiling water"],
      story: "Shepherds grazing sheep in Roman hills carried only dry pasta, pecorino cheese, and black peppercorns. Black pepper kept them warm in winter, and the salt of the cheese preserved energy during long weeks in the pasture.",
      restaurants: [
        { name: "Roma Sparita", style: "Charming piazza terrace", reason: "Serves creamy cacio e pepe inside an edible baked parmigiano cheese bowl." },
        { name: "Felice a Testaccio", style: "1936 classic institution", reason: "The waiter dramatically table-tosses the pasta in front of you." }
      ],
      accentColor: "from-blue-600 to-indigo-500"
    }
  ],
  "Rio de Janeiro": [
    {
      dishName: "Feijoada Carioca",
      tagline: "Afro-Brazilian slow-cooked pork and black bean feast",
      steamIntensity: 3,
      ingredients: ["Black beans", "Smoked pork ribs", "Carne seca (sun-dried beef)", "Garlic & bay leaves", "Collard greens & orange slices"],
      story: "Invented by enslaved Afro-Brazilian workers who saved leftover cuts of pork discarded from plantation kitchens, slow-boiling them with native black beans. It has evolved into Brazil's majestic national weekend celebration.",
      restaurants: [
        { name: "Bar do Mineiro (Santa Teresa)", style: "Art-filled neighborhood pub", reason: "Excellent feijoada pots served with cold chopp beer on a winding cobblestone hill." },
        { name: "Casa da Feijoada (Ipanema)", style: "Premium heritage restaurant", reason: "Offers complete traditional bean stew pairings in authentic clay pots." }
      ],
      accentColor: "from-emerald-600 to-teal-500"
    },
    {
      dishName: "Pão de Queijo (Baked Cheese Rolls)",
      tagline: "Airy, elastic puff balls made with manioc flour and mountain cheese",
      steamIntensity: 2,
      ingredients: ["Sweet sour manioc starch (Polvilho)", "Minas cured mountain cheese", "Whole eggs", "Warm whole milk"],
      story: "Rooted in culinary creativity during the colonial gold rush, when wheat was scarce. Indigenous culinary makers used manioc root starch combined with scraps of cheese to bake quick, puffy snack bread.",
      restaurants: [
        { name: "Cultivar (Santa Teresa)", style: "Quaint organic cafe", reason: "The absolute best golden cheese rolls paired with fresh hand-dripped local coffee." },
        { name: "Belmonte (Copacabana)", style: "Classic corner bar", reason: "Grab them fresh and hot directly from sliding trays near the beachfront boardwalk." }
      ],
      accentColor: "from-emerald-500 to-yellow-500"
    }
  ]
};

export default function FoodDiscovery({ city }: FoodDiscoveryProps) {
  const dishes = FOOD_DB[city] || FOOD_DB["Tokyo"];
  const [selectedDishIdx, setSelectedDishIdx] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const activeDish = dishes[selectedDishIdx];

  const toggleLike = (dishName: string) => {
    setLikes(prev => ({
      ...prev,
      [dishName]: !prev[dishName]
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* Decorative accent background */}
      <div className="absolute right-4 top-4 opacity-5 text-8xl font-display font-black select-none pointer-events-none uppercase">
        TASTE
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono text-orange-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Utensils className="h-4.5 w-4.5 text-orange-400 animate-bounce" /> CULINARY ARCHIVE
          </span>
          <h3 className="text-2xl font-display font-bold text-white mt-1">Gastronomic Discoveries</h3>
          <p className="text-xs text-stone-400 font-light mt-0.5">Explore authentic recipes, historical food migration lore, and trusted neighborhood kitchens.</p>
        </div>

        {/* Dish Selector list */}
        <div className="flex gap-2 bg-[#121216] border border-white/10 p-1 rounded-lg">
          {dishes.map((dish, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDishIdx(idx)}
              className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition-all cursor-pointer ${
                selectedDishIdx === idx
                  ? "bg-[#8a7251] text-white"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {dish.dishName.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {activeDish && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Dish Information and Story (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {activeDish.jpName && (
                  <span className="bg-[#121216] border border-white/10 text-stone-300 text-xs font-mono px-2 py-0.5 rounded-sm">
                    {activeDish.jpName}
                  </span>
                )}
                {activeDish.arName && (
                  <span className="bg-[#121216] border border-white/10 text-stone-300 text-xs font-mono px-2 py-0.5 rounded-sm">
                    {activeDish.arName}
                  </span>
                )}
                <span className="text-orange-400 text-xs font-mono flex items-center gap-1 font-bold">
                  <Flame className="h-3 w-3 animate-pulse" /> STEAM INTENSITY: {activeDish.steamIntensity}/3
                </span>
              </div>

              <h4 className="text-2xl font-display font-extrabold text-white">{activeDish.dishName}</h4>
              <p className="text-sm font-serif italic text-[#8a7251] mt-1">&ldquo;{activeDish.tagline}&rdquo;</p>
            </div>

            {/* AI Food Story paragraph */}
            <div className="bg-[#111116] border border-white/5 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute right-3 top-3">
                <Sparkles className="h-4 w-4 text-orange-400 opacity-60" />
              </div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-2 font-bold">GEN-AI FOOD LORE</span>
              <p className="text-sm text-stone-300 leading-relaxed font-light font-sans">{activeDish.story}</p>
            </div>

            {/* Top Recommended Local Restaurants */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">TRUSTED NEIGHBORHOOD KITCHENS</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDish.restaurants.map((rest, idx) => (
                  <div key={idx} className="bg-[#121218] border border-white/10 p-4 rounded-xl space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-[#8a7251] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-sm font-display font-bold text-white leading-tight">{rest.name}</h5>
                        <span className="text-[10px] font-mono text-stone-500">{rest.style}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 font-light leading-relaxed">{rest.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steam / Ingredients interactive visual card (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Holographic Hot Food Plate simulation with animated Steam */}
            <div className="h-56 rounded-2xl border border-white/10 bg-[#0d0d12] flex flex-col items-center justify-center relative overflow-hidden p-6 group">
              
              {/* Animated steam lines */}
              <div className="absolute top-12 flex gap-4 justify-center w-full z-10 pointer-events-none">
                {Array.from({ length: activeDish.steamIntensity * 2 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-16 steam-line ${
                      i % 3 === 0 ? "animate-steam-1" : i % 3 === 1 ? "animate-steam-2" : "animate-steam-3"
                    }`}
                  />
                ))}
              </div>

              {/* Glowing hot plate graphic */}
              <div className="w-36 h-36 rounded-full bg-radial from-orange-950/20 via-transparent to-transparent flex items-center justify-center border border-orange-500/10 shadow-[0_0_40px_rgba(249,115,22,0.05)] relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#8a7251]/20 flex items-center justify-center animate-spin-slow">
                  <div className="w-16 h-16 rounded-full bg-[#121218] border border-white/5 flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-[#8a7251] opacity-70" />
                  </div>
                </div>
                
                {/* Hot point indicator */}
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="text-[10px] font-mono text-stone-400">STATUS: HOT PLATE ACTIVE</span>
                <button
                  onClick={() => toggleLike(activeDish.dishName)}
                  className={`p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                    likes[activeDish.dishName] ? "text-red-500" : "text-stone-400 hover:text-white"
                  }`}
                  title="Save Dish to Favorites"
                >
                  <Heart className={`h-3.5 w-3.5 ${likes[activeDish.dishName] ? "fill-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Ingredient Highlights list */}
            <div className="bg-[#121216] border border-white/10 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-mono text-[#8a7251] font-bold block uppercase tracking-wider">INGREDIENT COMPOSITION</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeDish.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-stone-300">
                    <Check className="h-3.5 w-3.5 text-[#8a7251] shrink-0" />
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
