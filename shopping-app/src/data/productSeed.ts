import type { CategorySlug } from '../types';

// Compact seed tuples: [name, brand, price, unit, subcategory, icon, description?]
export type SeedTuple = [string, string, number, string, string, string, string?];

export interface CategorySeed {
  category: CategorySlug;
  items: SeedTuple[];
}

export const groceriesSeed: SeedTuple[] = [
  // Fruit & Veg
  ['Bananas Cavendish', 'Fresh Produce', 0.62, 'each', 'Fruit & Veg', '🍌'],
  ['Royal Gala Apples', 'Fresh Produce', 6.5, 'kg', 'Fruit & Veg', '🍎'],
  ['Navel Oranges', 'Fresh Produce', 5.9, 'kg', 'Fruit & Veg', '🍊'],
  ['Truss Tomatoes', 'Fresh Produce', 5.4, 'kg', 'Fruit & Veg', '🍅'],
  ['Brushed Potatoes', 'Fresh Produce', 4.2, '2kg bag', 'Fruit & Veg', '🥔'],
  ['Baby Spinach', 'Fresh Produce', 3.5, '120g bag', 'Fruit & Veg', '🥬'],
  ['Carrots', 'Fresh Produce', 2.9, '1kg bag', 'Fruit & Veg', '🥕'],
  ['Brown Onions', 'Fresh Produce', 3.2, '1.5kg bag', 'Fruit & Veg', '🧅'],
  ['Avocado', 'Fresh Produce', 2.5, 'each', 'Fruit & Veg', '🥑'],
  ['Broccoli', 'Fresh Produce', 4.5, 'each', 'Fruit & Veg', '🥦'],
  // Bakery
  ['White Sandwich Bread', 'Wonder White', 4.3, '650g loaf', 'Bakery', '🍞'],
  ['Wholemeal Toast Bread', 'Helga\'s', 5.2, '700g loaf', 'Bakery', '🍞'],
  ['Sourdough Loaf', 'Bakers Delight', 6.8, 'each', 'Bakery', '🥖'],
  ['Plain Croissants', 'Bakers Delight', 6.0, '4 pack', 'Bakery', '🥐'],
  ['Dinner Rolls', 'Tip Top', 3.9, '6 pack', 'Bakery', '🍞'],
  ['Blueberry Muffins', 'Bakers Delight', 7.5, '4 pack', 'Bakery', '🧁'],
  // Dairy & Eggs
  ['Full Cream Milk', 'Dairy Farmers', 3.7, '2L', 'Dairy & Eggs', '🥛'],
  ['Lite Milk', 'Pauls', 3.7, '2L', 'Dairy & Eggs', '🥛'],
  ['Free Range Eggs', 'Sunny Queen', 6.9, '12 pack', 'Dairy & Eggs', '🥚'],
  ['Tasty Cheese Block', 'Bega', 9.5, '500g', 'Dairy & Eggs', '🧀'],
  ['Butter Salted', 'Western Star', 6.3, '500g', 'Dairy & Eggs', '🧈'],
  ['Greek Yoghurt', 'Chobani', 6.0, '1kg tub', 'Dairy & Eggs', '🥣'],
  ['Shredded Mozzarella', 'Perfect Italiano', 7.2, '250g', 'Dairy & Eggs', '🧀'],
  // Meat & Seafood
  ['Chicken Breast Fillets', 'Fresh Meat', 12.0, '1kg', 'Meat & Seafood', '🍗'],
  ['Beef Mince 5 Star', 'Fresh Meat', 11.5, '500g', 'Meat & Seafood', '🥩'],
  ['Pork Sausages', 'Fresh Meat', 8.5, '500g', 'Meat & Seafood', '🌭'],
  ['Atlantic Salmon Fillet', 'Fresh Seafood', 15.0, '300g', 'Meat & Seafood', '🐟'],
  ['Bacon Rashers', 'Don', 8.0, '250g', 'Meat & Seafood', '🥓'],
  // Pantry
  ['Basmati Rice', 'SunRice', 6.5, '1kg', 'Pantry', '🍚'],
  ['Spaghetti Pasta', 'San Remo', 2.2, '500g', 'Pantry', '🍝'],
  ['Rich Tomato Pasta Sauce', 'Leggo\'s', 3.4, '500g', 'Pantry', '🍅'],
  ['Extra Virgin Olive Oil', 'Cobram Estate', 12.5, '500ml', 'Pantry', '🫒'],
  ['Raw Sugar', 'CSR', 3.1, '1kg', 'Pantry', '🍬'],
  ['Plain Flour', 'White Wings', 2.6, '1kg', 'Pantry', '🌾'],
  ['Baked Beans', 'Heinz', 2.1, '420g', 'Pantry', '🥫'],
  ['Peanut Butter Smooth', 'Kraft', 5.4, '375g', 'Pantry', '🥜'],
  ['Vegemite', 'Bega', 5.9, '380g', 'Pantry', '🍯'],
  ['Instant Coffee', 'Moccona', 14.5, '200g', 'Pantry', '☕'],
  ['Breakfast Cereal Cornflakes', 'Kelloggs', 5.7, '500g', 'Pantry', '🥣'],
  ['Honey Pure', 'Capilano', 8.9, '500g', 'Pantry', '🍯'],
  // Snacks & Confectionery
  ['Original Potato Chips', 'Smiths', 4.5, '170g', 'Snacks & Confectionery', '🍟'],
  ['Milk Chocolate Block', 'Cadbury', 5.5, '180g', 'Snacks & Confectionery', '🍫'],
  ['Salted Mixed Nuts', 'Coles', 6.8, '375g', 'Snacks & Confectionery', '🥜'],
  ['Muesli Bars', 'Uncle Tobys', 4.9, '6 pack', 'Snacks & Confectionery', '🍫'],
  ['Water Crackers', 'Jatz', 3.5, '250g', 'Snacks & Confectionery', '🍘'],
  ['Fruit Gummy Snakes', 'Allens', 4.2, '190g', 'Snacks & Confectionery', '🍬'],
  // Drinks
  ['Spring Water', 'Mount Franklin', 5.5, '24x600ml', 'Drinks', '💧'],
  ['Cola Soft Drink', 'Coca-Cola', 12.0, '24x375ml cans', 'Drinks', '🥤'],
  ['Orange Juice', 'Berri', 4.8, '2L', 'Drinks', '🧃'],
  ['Green Tea Bags', 'Lipton', 4.6, '100 pack', 'Drinks', '🍵'],
  ['Ground Coffee', 'Vittoria', 11.0, '500g', 'Drinks', '☕'],
  // Frozen
  ['Frozen Mixed Vegetables', 'Birds Eye', 4.8, '1kg', 'Frozen', '🥦'],
  ['Vanilla Ice Cream', 'Streets', 7.5, '2L', 'Frozen', '🍨'],
  ['Frozen Beef Pies', 'Four\'N Twenty', 6.9, '4 pack', 'Frozen', '🥧'],
  ['Hash Browns', 'McCain', 4.5, '750g', 'Frozen', '🥔'],
  ['Frozen Berries Mixed', 'Creative Gourmet', 6.5, '500g', 'Frozen', '🍓'],
  // Cleaning & Laundry
  ['Laundry Powder', 'OMO', 15.0, '2kg', 'Cleaning & Laundry', '🧺'],
  ['Dishwashing Liquid', 'Morning Fresh', 4.2, '400ml', 'Cleaning & Laundry', '🧴'],
  ['Multi-Purpose Spray Cleaner', 'Spray n Wipe', 4.8, '750ml', 'Cleaning & Laundry', '🧴'],
  ['Toilet Paper', 'Quilton', 12.5, '12 pack', 'Cleaning & Laundry', '🧻'],
  ['Paper Towel', 'Kleenex', 9.0, '4 pack', 'Cleaning & Laundry', '🧻'],
  ['Fabric Softener', 'Downy', 8.5, '900ml', 'Cleaning & Laundry', '🧴'],
  ['Bathroom Bleach Cleaner', 'Domestos', 5.5, '500ml', 'Cleaning & Laundry', '🧴'],
  // Baby & Pet
  ['Baby Nappies Size 4', 'Huggies', 24.0, '42 pack', 'Baby & Pet', '👶'],
  ['Baby Wipes', 'Huggies', 9.5, '3x80 pack', 'Baby & Pet', '🧻'],
  ['Dry Dog Food', 'Pedigree', 22.0, '8kg', 'Baby & Pet', '🐶'],
  ['Cat Food Pouches', 'Whiskas', 14.0, '12 pack', 'Baby & Pet', '🐱'],
];

export const medicalSeed: SeedTuple[] = [
  // Pain Relief
  ['Paracetamol 500mg Tablets', 'Panadol', 8.5, '100 pack', 'Pain Relief', '💊'],
  ['Ibuprofen 200mg Tablets', 'Nurofen', 9.9, '96 pack', 'Pain Relief', '💊'],
  ['Aspirin 300mg Tablets', 'Bayer', 6.5, '100 pack', 'Pain Relief', '💊'],
  ['Muscle Rub Gel', 'Deep Heat', 10.5, '100g', 'Pain Relief', '🧴'],
  ['Migraine Relief Tablets', 'Panadol', 12.9, '20 pack', 'Pain Relief', '💊'],
  // Cold & Flu
  ['Cold & Flu Tablets', 'Codral', 11.5, '24 pack', 'Cold & Flu', '🤧'],
  ['Throat Lozenges Honey Lemon', 'Strepsils', 6.5, '36 pack', 'Cold & Flu', '🍬'],
  ['Vapour Rub', 'Vicks', 8.9, '50g', 'Cold & Flu', '🧴'],
  ['Nasal Spray Decongestant', 'Otrivin', 12.5, '15ml', 'Cold & Flu', '💧'],
  ['Vitamin C Effervescent', 'Redoxon', 13.0, '30 pack', 'Cold & Flu', '🍊'],
  // First Aid
  ['Adhesive Bandages Assorted', 'Band-Aid', 7.0, '50 pack', 'First Aid', '🩹'],
  ['Antiseptic Cream', 'Savlon', 8.5, '50g', 'First Aid', '🧴'],
  ['First Aid Kit Compact', 'St John', 29.9, 'each', 'First Aid', '🩹'],
  ['Cotton Wool Balls', 'Chemist Own', 4.5, '100 pack', 'First Aid', '🧻'],
  ['Instant Cold Pack', 'Chemist Own', 6.0, 'each', 'First Aid', '🧊'],
  ['Elastic Bandage Roll', 'Elastoplast', 9.5, '7.5cm x 4m', 'First Aid', '🩹'],
  ['Antiseptic Wipes', 'Dettol', 5.5, '20 pack', 'First Aid', '🧻'],
  // Vitamins & Supplements
  ['Multivitamin Tablets', 'Centrum', 24.0, '100 pack', 'Vitamins & Supplements', '💊'],
  ['Fish Oil Capsules', 'Blackmores', 22.0, '200 pack', 'Vitamins & Supplements', '💊'],
  ['Vitamin D3 Tablets', 'Ostelin', 15.0, '130 pack', 'Vitamins & Supplements', '💊'],
  ['Magnesium Tablets', 'Blackmores', 18.5, '100 pack', 'Vitamins & Supplements', '💊'],
  ['Probiotic Capsules', 'Inner Health Plus', 26.0, '30 pack', 'Vitamins & Supplements', '💊'],
  ['Zinc Tablets', 'Chemist Own', 9.9, '100 pack', 'Vitamins & Supplements', '💊'],
  // Skin Care
  ['Sunscreen SPF50+', 'Cancer Council', 16.5, '200ml', 'Skin Care', '🧴'],
  ['Moisturising Lotion', 'QV', 14.0, '500g', 'Skin Care', '🧴'],
  ['Aloe Vera Gel', 'Lucas Papaw', 9.5, '75g', 'Skin Care', '🧴'],
  ['Anti-Itch Cream', 'Sudocrem', 11.0, '125g', 'Skin Care', '🧴'],
  ['Hand Sanitiser Gel', 'Dettol', 5.0, '250ml', 'Skin Care', '🧴'],
  // Personal Care
  ['Cotton Buds', 'Johnson\'s', 3.5, '200 pack', 'Personal Care', '🧴'],
  ['Disposable Razors', 'Gillette', 7.5, '5 pack', 'Personal Care', '🪒'],
  ['Deodorant Roll-On', 'Rexona', 5.9, '50ml', 'Personal Care', '🧴'],
  ['Shampoo', 'Head & Shoulders', 9.5, '400ml', 'Personal Care', '🧴'],
  ['Body Wash', 'Dove', 7.9, '500ml', 'Personal Care', '🧴'],
  ['Facial Tissues', 'Kleenex', 3.0, '4 pack', 'Personal Care', '🧻'],
  // Oral Care
  ['Toothpaste Fluoride', 'Colgate', 4.5, '110g', 'Oral Care', '🪥'],
  ['Toothbrush Soft', 'Oral-B', 4.0, '2 pack', 'Oral Care', '🪥'],
  ['Mouthwash Fresh Mint', 'Listerine', 8.9, '500ml', 'Oral Care', '🧴'],
  ['Dental Floss', 'Oral-B', 5.5, '50m', 'Oral Care', '🧵'],
  ['Electric Toothbrush', 'Oral-B', 45.0, 'each', 'Oral Care', '🪥'],
  // Baby Health
  ['Baby Paracetamol Suspension', 'Panadol', 9.5, '200ml', 'Baby Health', '💊'],
  ['Baby Nappy Rash Cream', 'Sudocrem', 11.0, '125g', 'Baby Health', '🧴'],
  ['Baby Thermometer Digital', 'Braun', 32.0, 'each', 'Baby Health', '🌡️'],
  ['Saline Nasal Drops', 'FESS', 8.5, '15ml', 'Baby Health', '💧'],
];

export const stationerySeed: SeedTuple[] = [
  // Writing & Correction
  ['Ballpoint Pens Black', 'Bic', 5.5, '10 pack', 'Writing & Correction', '🖊️'],
  ['Gel Pens Assorted', 'Pilot', 8.9, '8 pack', 'Writing & Correction', '🖊️'],
  ['HB Pencils', 'Staedtler', 4.5, '12 pack', 'Writing & Correction', '✏️'],
  ['Highlighters Assorted', 'Stabilo Boss', 9.5, '6 pack', 'Writing & Correction', '🖍️'],
  ['Correction Tape', 'Tipp-Ex', 4.9, 'each', 'Writing & Correction', '📏'],
  ['Whiteboard Markers', 'Artline', 7.5, '4 pack', 'Writing & Correction', '🖊️'],
  ['Permanent Markers Black', 'Sharpie', 6.0, '3 pack', 'Writing & Correction', '🖊️'],
  // Paper & Notebooks
  ['A4 Copy Paper', 'Reflex', 8.5, '500 sheet ream', 'Paper & Notebooks', '📄'],
  ['A4 Spiral Notebook', 'Spirax', 4.5, 'each', 'Paper & Notebooks', '📓'],
  ['A5 Hardcover Notebook', 'Kikki.K', 12.0, 'each', 'Paper & Notebooks', '📓'],
  ['Sticky Notes Assorted', 'Post-it', 6.5, '6 pad pack', 'Paper & Notebooks', '🗒️'],
  ['Legal Pad', 'Spirax', 3.9, 'each', 'Paper & Notebooks', '📝'],
  ['Graph Paper Pad', 'Spirax', 5.0, 'each', 'Paper & Notebooks', '📊'],
  // Art & Craft
  ['Coloured Pencils', 'Faber-Castell', 9.5, '24 pack', 'Art & Craft', '🎨'],
  ['Watercolour Paint Set', 'Crayola', 12.5, '24 colours', 'Art & Craft', '🎨'],
  ['Craft Glue Stick', 'UHU', 3.5, '3 pack', 'Art & Craft', '🧴'],
  ['Scissors Kids Safety', 'Fiskars', 5.5, 'each', 'Art & Craft', '✂️'],
  ['Coloured Card A4', 'Rainbow', 6.9, '100 sheet pack', 'Art & Craft', '🎨'],
  ['Modelling Clay Set', 'Play-Doh', 10.0, '10 pack', 'Art & Craft', '🎨'],
  // Filing & Organisation
  ['Lever Arch File', 'Marbig', 6.5, 'each', 'Filing & Organisation', '📁'],
  ['Manila Folders', 'Marbig', 8.0, '20 pack', 'Filing & Organisation', '📁'],
  ['Plastic Sleeves A4', 'Marbig', 7.5, '100 pack', 'Filing & Organisation', '📂'],
  ['Box File Storage', 'Bantex', 9.9, 'each', 'Filing & Organisation', '🗃️'],
  ['Ring Binder Folder', 'Marbig', 5.9, 'each', 'Filing & Organisation', '📁'],
  // School Supplies
  ['School Backpack', 'Smiggle', 45.0, 'each', 'School Supplies', '🎒'],
  ['Pencil Case', 'Smiggle', 15.0, 'each', 'School Supplies', '🎒'],
  ['Scientific Calculator', 'Casio', 28.0, 'each', 'School Supplies', '🧮'],
  ['Library Bag', 'Generic', 8.5, 'each', 'School Supplies', '👜'],
  ['Wooden Ruler 30cm', 'Celco', 1.5, 'each', 'School Supplies', '📏'],
  ['Eraser White', 'Staedtler', 1.2, 'each', 'School Supplies', '🧽'],
  // Printers & Ink
  ['Black Ink Cartridge', 'HP', 35.0, 'each', 'Printers & Ink', '🖨️'],
  ['Colour Ink Cartridge Pack', 'Canon', 55.0, '3 pack', 'Printers & Ink', '🖨️'],
  ['Photo Paper Glossy', 'Kodak', 14.9, '50 sheet pack', 'Printers & Ink', '📷'],
  ['Laser Toner Cartridge', 'Brother', 89.0, 'each', 'Printers & Ink', '🖨️'],
  // Desk Accessories
  ['Desk Organiser Tray', 'Marbig', 12.5, 'each', 'Desk Accessories', '🗄️'],
  ['Stapler Standard', 'Rexel', 8.9, 'each', 'Desk Accessories', '📎'],
  ['Staples Box', 'Rexel', 3.5, '5000 pack', 'Desk Accessories', '📎'],
  ['Paper Clips Assorted', 'Marbig', 3.0, '100 pack', 'Desk Accessories', '📎'],
  ['Desk Calendar', 'Collins', 9.5, 'each', 'Desk Accessories', '📅'],
  ['Scissors Office 21cm', 'Marbig', 6.5, 'each', 'Desk Accessories', '✂️'],
];

export const homeHardwareSeed: SeedTuple[] = [
  // Hand Tools
  ['Claw Hammer 450g', 'Stanley', 24.0, 'each', 'Hand Tools', '🔨'],
  ['Screwdriver Set 6 Piece', 'Kincrome', 22.0, 'set', 'Hand Tools', '🪛'],
  ['Adjustable Wrench 250mm', 'Stanley', 18.5, 'each', 'Hand Tools', '🔧'],
  ['Tape Measure 5m', 'Stanley', 12.9, 'each', 'Hand Tools', '📏'],
  ['Spirit Level 600mm', 'Kincrome', 26.0, 'each', 'Hand Tools', '📏'],
  ['Pliers Combination 200mm', 'Stanley', 16.5, 'each', 'Hand Tools', '🔧'],
  ['Hand Saw 500mm', 'Irwin', 22.5, 'each', 'Hand Tools', '🪚'],
  ['Utility Knife Retractable', 'Stanley', 9.5, 'each', 'Hand Tools', '🔪'],
  // Power Tools
  ['Cordless Drill Driver 18V', 'Ryobi', 129.0, 'each', 'Power Tools', '🔋'],
  ['Angle Grinder 125mm', 'Makita', 89.0, 'each', 'Power Tools', '⚙️'],
  ['Jigsaw Corded', 'Bosch', 99.0, 'each', 'Power Tools', '⚙️'],
  ['Cordless Impact Driver 18V', 'Ryobi', 149.0, 'each', 'Power Tools', '🔋'],
  ['Random Orbital Sander', 'Makita', 79.0, 'each', 'Power Tools', '⚙️'],
  ['18V Battery Pack', 'Ryobi', 65.0, 'each', 'Power Tools', '🔋'],
  // Fixings & Fasteners
  ['Wood Screws Assorted Kit', 'Zenith', 14.5, '275 pack', 'Fixings & Fasteners', '🔩'],
  ['Masonry Anchors Kit', 'Ramset', 12.0, '50 pack', 'Fixings & Fasteners', '🔩'],
  ['Nails Assorted Kit', 'Zenith', 9.5, '300g', 'Fixings & Fasteners', '🔩'],
  ['Cable Ties 200mm', 'Zenith', 6.5, '100 pack', 'Fixings & Fasteners', '🔗'],
  ['Nuts and Bolts Kit', 'Zenith', 15.0, '110 pack', 'Fixings & Fasteners', '🔩'],
  // Paint & Supplies
  ['Interior Wall Paint White', 'Dulux', 65.0, '4L', 'Paint & Supplies', '🎨'],
  ['Exterior Weathershield Paint', 'Dulux', 89.0, '4L', 'Paint & Supplies', '🎨'],
  ['Paint Roller Kit', 'Wattyl', 15.5, 'set', 'Paint & Supplies', '🖌️'],
  ['Paint Brush Set', 'Wattyl', 12.0, '3 pack', 'Paint & Supplies', '🖌️'],
  ['Painters Tape', '3M', 7.5, '48mm x 50m', 'Paint & Supplies', '📏'],
  ['Drop Sheet Plastic', 'Trimaco', 8.9, '3.6x2.4m', 'Paint & Supplies', '🧻'],
  // Garden & Outdoor
  ['Garden Hose 18m', 'Nylex', 39.0, 'each', 'Garden & Outdoor', '🚿'],
  ['Potting Mix Premium', 'Scotts Osmocote', 12.5, '25L', 'Garden & Outdoor', '🌱'],
  ['Garden Gloves', 'Showa', 9.5, 'pair', 'Garden & Outdoor', '🧤'],
  ['Secateurs Pruning Shears', 'Fiskars', 28.0, 'each', 'Garden & Outdoor', '✂️'],
  ['Lawn Fertiliser', 'Scotts', 24.5, '4kg', 'Garden & Outdoor', '🌱'],
  ['Outdoor Broom', 'Oates', 16.0, 'each', 'Garden & Outdoor', '🧹'],
  ['Wheelie Bin Trolley', 'Generic', 45.0, 'each', 'Garden & Outdoor', '🗑️'],
  // Plumbing
  ['PVC Pipe 20mm x 3m', 'Holman', 8.5, 'each', 'Plumbing', '🔧'],
  ['Tap Washers Assorted', 'Holman', 5.5, '10 pack', 'Plumbing', '🔧'],
  ['Silicone Sealant Clear', 'Selleys', 9.9, '300g', 'Plumbing', '🧴'],
  ['Plumbers Tape Roll', 'Holman', 3.5, 'each', 'Plumbing', '🔧'],
  ['Drain Unblocker Gel', 'Drano', 8.5, '900ml', 'Plumbing', '🧴'],
  // Electrical
  ['Extension Cord 10m', 'HPM', 24.5, 'each', 'Electrical', '🔌'],
  ['LED Light Globes', 'Philips', 12.5, '4 pack', 'Electrical', '💡'],
  ['Power Board 6 Outlet', 'HPM', 22.0, 'each', 'Electrical', '🔌'],
  ['Batteries AA Alkaline', 'Duracell', 11.5, '16 pack', 'Electrical', '🔋'],
  ['Smoke Alarm 10 Year', 'Brooks', 35.0, 'each', 'Electrical', '🚨'],
  // Storage & Shelving
  ['Plastic Storage Tub 60L', 'Nally', 18.5, 'each', 'Storage & Shelving', '📦'],
  ['Wire Shelving Unit 5 Tier', 'Spacemaster', 129.0, 'each', 'Storage & Shelving', '🗄️'],
  ['Garage Storage Hooks Set', 'Command', 15.0, '6 pack', 'Storage & Shelving', '🪝'],
  ['Toolbox Plastic', 'Stanley', 22.0, 'each', 'Storage & Shelving', '🧰'],
];

export const generalMerchandiseSeed: SeedTuple[] = [
  // Kitchen & Dining
  ['Non-Stick Frypan 28cm', 'Tefal', 39.0, 'each', 'Kitchen & Dining', '🍳'],
  ['Stainless Steel Saucepan Set', 'Anko', 45.0, '3 piece', 'Kitchen & Dining', '🍲'],
  ['Dinner Plate Set', 'Anko', 24.0, '4 pack', 'Kitchen & Dining', '🍽️'],
  ['Cutlery Set 16 Piece', 'Anko', 22.0, 'set', 'Kitchen & Dining', '🍴'],
  ['Glass Storage Containers', 'Anko', 18.5, '5 piece', 'Kitchen & Dining', '🥡'],
  ['Electric Kettle', 'Sunbeam', 29.0, 'each', 'Kitchen & Dining', '🫖'],
  ['2 Slice Toaster', 'Sunbeam', 25.0, 'each', 'Kitchen & Dining', '🍞'],
  ['Chopping Board Set', 'Anko', 12.5, '3 piece', 'Kitchen & Dining', '🔪'],
  ['Drink Bottle 1L', 'Anko', 8.5, 'each', 'Kitchen & Dining', '🍶'],
  // Homewares & Decor
  ['Throw Cushion Cover', 'Anko', 9.0, 'each', 'Homewares & Decor', '🛋️'],
  ['Wall Clock Round', 'Anko', 15.0, 'each', 'Homewares & Decor', '🕐'],
  ['Photo Frame A4', 'Anko', 8.0, 'each', 'Homewares & Decor', '🖼️'],
  ['Table Lamp', 'Anko', 22.0, 'each', 'Homewares & Decor', '💡'],
  ['Artificial Plant Pot', 'Anko', 18.0, 'each', 'Homewares & Decor', '🪴'],
  ['Scented Candle', 'Anko', 7.5, 'each', 'Homewares & Decor', '🕯️'],
  ['Area Rug 120x170cm', 'Anko', 49.0, 'each', 'Homewares & Decor', '🧶'],
  // Bedding & Bath
  ['Quilt Cover Set Queen', 'Anko', 35.0, 'set', 'Bedding & Bath', '🛏️'],
  ['Bath Towel', 'Anko', 12.0, 'each', 'Bedding & Bath', '🧖'],
  ['Pillow Standard', 'Anko', 15.0, 'each', 'Bedding & Bath', '🛏️'],
  ['Fitted Sheet Set Queen', 'Anko', 28.0, 'set', 'Bedding & Bath', '🛏️'],
  ['Bath Mat', 'Anko', 10.0, 'each', 'Bedding & Bath', '🧻'],
  ['Shower Curtain', 'Anko', 9.5, 'each', 'Bedding & Bath', '🚿'],
  // Toys & Kids
  ['Building Blocks Set', 'Anko', 25.0, '150 piece', 'Toys & Kids', '🧱'],
  ['Soft Plush Teddy Bear', 'Anko', 12.0, 'each', 'Toys & Kids', '🧸'],
  ['Puzzle 500 Piece', 'Anko', 10.0, 'each', 'Toys & Kids', '🧩'],
  ['Kids Colouring Book Set', 'Anko', 8.0, 'each', 'Toys & Kids', '🖍️'],
  ['Remote Control Car', 'Anko', 30.0, 'each', 'Toys & Kids', '🚗'],
  ['Board Game Family', 'Hasbro', 25.0, 'each', 'Toys & Kids', '🎲'],
  // Clothing Basics
  ['Men\'s Crew T-Shirt', 'Anko', 8.0, 'each', 'Clothing Basics', '👕'],
  ['Women\'s Basic Singlet', 'Anko', 6.0, 'each', 'Clothing Basics', '👚'],
  ['Kids Socks 5 Pack', 'Anko', 9.0, 'pack', 'Clothing Basics', '🧦'],
  ['Unisex Beanie', 'Anko', 7.0, 'each', 'Clothing Basics', '🧢'],
  ['Rain Jacket', 'Anko', 25.0, 'each', 'Clothing Basics', '🧥'],
  // Storage & Cleaning
  ['Storage Box with Lid 40L', 'Anko', 12.0, 'each', 'Storage & Cleaning', '📦'],
  ['Laundry Basket', 'Anko', 10.0, 'each', 'Storage & Cleaning', '🧺'],
  ['Vacuum Cleaner Bagless', 'Bissell', 89.0, 'each', 'Storage & Cleaning', '🧹'],
  ['Microfibre Cloths', 'Anko', 6.5, '10 pack', 'Storage & Cleaning', '🧽'],
  ['Ironing Board', 'Anko', 35.0, 'each', 'Storage & Cleaning', '🧺'],
  // Party & Gifting
  ['Balloons Assorted Pack', 'Anko', 6.0, '50 pack', 'Party & Gifting', '🎈'],
  ['Gift Wrap Roll', 'Anko', 4.5, 'each', 'Party & Gifting', '🎁'],
  ['Birthday Candles', 'Anko', 3.0, '24 pack', 'Party & Gifting', '🎂'],
  ['Greeting Card', 'Anko', 4.0, 'each', 'Party & Gifting', '💌'],
  ['Party Cups Disposable', 'Anko', 5.5, '20 pack', 'Party & Gifting', '🥤'],
  // Tech Accessories
  ['USB-C Charging Cable', 'Anko', 12.0, 'each', 'Tech Accessories', '🔌'],
  ['Bluetooth Speaker Portable', 'Anko', 35.0, 'each', 'Tech Accessories', '🔊'],
  ['Phone Case Universal', 'Anko', 9.0, 'each', 'Tech Accessories', '📱'],
  ['Wireless Mouse', 'Anko', 15.0, 'each', 'Tech Accessories', '🖱️'],
  ['Power Bank 10000mAh', 'Anko', 25.0, 'each', 'Tech Accessories', '🔋'],
];
