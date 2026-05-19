export const categoryLabelMap = {
  Gold: 'Luxe Ring',
  Silver: 'Royal Braces',
  'Lux Wear': 'Elite Series',
  'Party Wear': 'Piercings',
};

export const getCategoryLabel = (category) => categoryLabelMap[category] || category;
